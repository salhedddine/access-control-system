import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EnrollmentService } from '../../../../../core/services/enrollment.service';
import { ApiService } from '../../../../../core/services/api.js';

export type EnrollmentState = 'DISCONNECTED' | 'READY' | 'READING' | 'WRITING' | 'SUCCESS' | 'ERROR';

@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enrollment.html',  
  styleUrl: './enrollment.css',
})
export class Enrollment implements OnInit, OnDestroy {
currentState: EnrollmentState = 'DISCONNECTED';
  statusMessage: string = 'Please connect the USB Enrollment Reader to begin.';
  
  availableUsers = [
    { id: 'usr_8921', name: 'Salheddine Ayad', role: 'Admin' },
    { id: 'usr_4412', name: 'John Doe', role: 'Technician' }
  ];
  selectedUserId: string = '';
  private hardwareSub!: Subscription;

  constructor(
    private enrollmentService: EnrollmentService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    if (this.enrollmentService.isPortOpen()) {
      this.currentState = 'READY';
      this.statusMessage = 'Reader ready. Select a user and place a card on the reader.';
    }
  }

  async handleConnect() {
    try {
      this.statusMessage = 'Connecting to USB hardware...';
      await this.enrollmentService.connectReader();
      this.currentState = 'READY';
      this.statusMessage = 'Reader successfully connected over Web Serial.';
    } catch (err: any) {
      this.currentState = 'ERROR';
      this.statusMessage = `Connection failed: ${err.message || err}`;
    }
  }

  async handleEnrollCard() {
    if (!this.selectedUserId) {
      alert('Please select a user application to link to this physical credential.');
      return;
    }

    this.currentState = 'READING';
    this.statusMessage = 'Polling reader field... Place blank card on the pad now.';

    try {
      const credentialPayload = `VAULT_ID:${this.selectedUserId}`;
      await this.enrollmentService.provisionNewCard(credentialPayload);
      
      this.currentState = 'SUCCESS';
      this.statusMessage = `Card successfully encrypted and mapped to user ${this.selectedUserId}!`;
    } catch (err: any) {
      this.currentState = 'ERROR';
      this.statusMessage = `Provisioning aborted: ${err.message || err}`;
    }
  }

  resetForm() {
    this.currentState = this.enrollmentService.isPortOpen() ? 'READY' : 'DISCONNECTED';
    this.statusMessage = this.enrollmentService.isPortOpen() 
      ? 'Ready for next card token deployment.' 
      : 'Please connect the USB Enrollment Reader to begin.';
  }

  ngOnDestroy(): void {
    if (this.hardwareSub) this.hardwareSub.unsubscribe();
  }
}