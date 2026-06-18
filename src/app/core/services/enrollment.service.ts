import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';

export type ReaderStatus = 'DISCONNECTED' | 'CONNECTED' | 'READY' | 'READING' | 'SUCCESS' | 'ERROR';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private port: any = null;
  private writer: WritableStreamDefaultWriter<string> | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;

  private readableStreamClosed: Promise<void> | null = null;
  private writableStreamClosed: Promise<void> | null = null;
  
  // Internal tracking properties to handle clean stream decoding
  private textDecoderStream: any = null;
  private textEncoderStream: any = null;

  constructor(private apiService: ApiService) {}

  /**
   * Checks if the Web Serial connection is active and readable
   */
  isPortOpen(): boolean {
    return !!this.port && !!this.port.readable;
  }


  // 1. Create a private BehaviorSubject to track state changes
  private statusSubject = new BehaviorSubject<ReaderStatus>('DISCONNECTED');
  
  // 2. Expose it as a public Observable for components to subscribe to
  public status$: Observable<ReaderStatus> = this.statusSubject.asObservable();

  /**
   * Helper to quickly update the state and broadcast it
   */
  private setStatus(newStatus: ReaderStatus): void {
    this.statusSubject.next(newStatus);
  }

  /**
   * Gets the raw current value if needed outside of an asynchronous stream
   */
  public get currentStatus(): ReaderStatus {
    return this.statusSubject.value;
  }
  
  /**
   * Step 1: Requests hardware USB port access from the web browser context.
   * Sets up full-duplex text-based pipeline tracking streams.
   */
async connectReader(): Promise<void> {
    if (!('serial' in navigator)) {
      throw new Error('The Web Serial API is missing or blocked by browser security policy.');
    }

    try {
      // @ts-ignore
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });

      // Setup Writer
      this.textEncoderStream = new TextEncoderStream();
      this.writableStreamClosed = this.textEncoderStream.readable.pipeTo(this.port.writable);
      this.writer = this.textEncoderStream.writable.getWriter();

      // Setup Reader
      this.textDecoderStream = new TextDecoderStream();
      this.readableStreamClosed = this.port.readable.pipeTo(this.textDecoderStream.writable);
      this.reader = this.textDecoderStream.readable.getReader();

      this.setStatus('CONNECTED');
      console.log('[ENROLLMENT SERVICE]: USB Web Serial pipeline successfully mounted.');
    } catch (err) {
      console.error('[ENROLLMENT SERVICE]: Connection initialization stalled:', err);
      
      // REMOVED: Do not call disconnectReader() automatically here. 
      // Let the port stay allocated so we don't nullify the object references.
      
      throw err; 
    }
  }
  
  /**
   * Main Cryptographic Workflow State Machine
   * Handles the transaction steps across Hardware -> Angular Service -> Server Vault -> Hardware
   */
async provisionNewCard(credentialPayload: string): Promise<void> {
    if (!this.isPortOpen()) {
      throw new Error('Hardware connection link missing. Run connectReader() first.');
    }

    // --- STEP A: Read the physical card hardware token ---
    await this.sendCommand('GET_UID');
    const uidResponse = await this.readResponse();
    
    if (!uidResponse.startsWith('UID:')) {
      throw new Error(uidResponse.startsWith('ERROR:') ? uidResponse : 'Failed to isolate valid card hardware target.');
    }
    
    const uid = uidResponse.split(':')[1].trim();
    console.log(`[ENROLLMENT SERVICE]: Local card isolated. Physical UID: ${uid}`);


    // --- STEP B: Request a secure unique card derived key from the database vault ---
    // Let apiService handle the Base URL prefix automatically.
    // We only pass the exact relative endpoint path it expects.
    const backendResponse = await firstValueFrom(
      this.apiService.post<{ derivedKey: string }>('provision/derive-key', { uid })
    );

    if (!backendResponse || !backendResponse.derivedKey) {
      throw new Error('Security Backend failed to generate a matching derived cryptographic identity.');
    }
    const derivedKey = backendResponse.derivedKey;
    console.log(`[ENROLLMENT SERVICE]: Server handshake complete. Cryptographic key derived successfully.`);


    // --- STEP C: Package parameters and dispatch the instruction payload to the edge device ---
    const provisionCmd = `PROVISION ${derivedKey} ${credentialPayload}`;
    await this.sendCommand(provisionCmd);
    
    const executionStatus = await this.readResponse();
    
    if (executionStatus !== 'SUCCESS') {
      throw new Error(`Hardware firmware processing failed: ${executionStatus}`);
    }
  }
    
  /**
   * Dispatches text-encoded commands straight down the serial UART wire to the microcontroller
   */
  private async sendCommand(cmd: string): Promise<void> {
    if (!this.writer) throw new Error('Serial writer transmission stream is uninitialized.');
    // Appending newline matches your firmware's Serial.readStringUntil('\n') protocol
    await this.writer.write(cmd + '\n');
  }

  /**
   * Reads data chunks coming off the serial buffer until a full line boundary (\n) is detected
   */
  private async readResponse(): Promise<string> {
    if (!this.reader) throw new Error('Serial reader receiver stream is uninitialized.');

    let lineBuffer = '';
    const timeoutMs = 10000; // 10 second timeout guard for execution loops
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const { value, done } = await this.reader.read();
      if (done) break;
      
      if (value) {
        lineBuffer += value;
        if (lineBuffer.includes('\n')) {
          return lineBuffer.trim();
        }
      }
    }
    throw new Error('Hardware lifecycle execution response timeout reached.');
  }

  /**
   * Explicitly closes and clears active stream links for safety
   */
async disconnectReader(): Promise<void> {
    // 1. Safely cancel the Reader (This automatically propagates the unlock up the pipe)
    if (this.reader) {
      try {
        await this.reader.cancel(); 
        // Notice: NO releaseLock() here. .cancel() releases it naturally.
      } catch (e) {
        console.debug('[ENROLLMENT SERVICE]: Reader cancel bypassed:', e);
      }
      this.reader = null;
    }

    // 2. Await the readable pipe unwinding
    if (this.readableStreamClosed) {
      try {
        await this.readableStreamClosed;
      } catch (e) {
        // When we cancel the reader, the pipeTo promise intentionally rejects. We catch it silently.
      }
      this.readableStreamClosed = null;
    }

    // 3. Safely close the Writer
    if (this.writer) {
      try {
        await this.writer.close();
      } catch (e) {
        console.debug('[ENROLLMENT SERVICE]: Writer close bypassed:', e);
      }
      this.writer = null;
    }

    // 4. Await the writable pipe unwinding
    if (this.writableStreamClosed) {
      try {
        await this.writableStreamClosed;
      } catch (e) {
        /* Silent catch */
      }
      this.writableStreamClosed = null;
    }

    // 5. Now that the pipes have properly detached, close the physical port
    if (this.port) {
      try {
        await this.port.close();
        console.log('[ENROLLMENT SERVICE]: Web Serial port fully closed and released.');
      } catch (closeErr) {
        console.error('[ENROLLMENT SERVICE]: Error executing hardware port termination:', closeErr);
      }
      this.port = null;
    }

    this.textEncoderStream = null;
    this.textDecoderStream = null;
  }
}