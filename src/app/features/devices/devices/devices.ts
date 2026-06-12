import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReaderDevice {
  mac: string;
  alias: string;
  firmware: string;
  assignedDoor: string;
  status: 'online' | 'offline' | 'error';
  signalStrength: number; // dBm
}

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devices.html',
  styleUrl: './devices.css',
})
export class Devices {
  selectedDevice = signal<ReaderDevice | null>(null);

  devices = signal<ReaderDevice[]>([
    { mac: '32:AE:A4:07:0X:11', alias: 'Server Room Core Entrance', firmware: 'v1.4.2-ESP32', assignedDoor: 'Main Server Vault Vault-01', status: 'online', signalStrength: -62 },
    { mac: '32:AE:A4:07:0X:22', alias: 'Backyard Loading Dock Gate', firmware: 'v1.4.0-ESP32', assignedDoor: 'Loading Dock Exterior Roller', status: 'offline', signalStrength: 0 },
    { mac: '32:AE:A4:07:0X:33', alias: 'Executive Floor Lobby East', firmware: 'v1.4.2-ESP32', assignedDoor: 'Floor 4 Glass Turnstile', status: 'online', signalStrength: -55 }
  ]);

  newDevice = { mac: '', alias: '', assignedDoor: '' };

  registerReader() {
    if (!this.newDevice.mac || !this.newDevice.alias) return;
    const deviceToRegister: ReaderDevice = {
      mac: this.newDevice.mac.toUpperCase(),
      alias: this.newDevice.alias,
      firmware: 'v1.5.0-ESP-STABLE',
      assignedDoor: this.newDevice.assignedDoor || 'Unassigned Internal Portal',
      status: 'online',
      signalStrength: -45
    };

    this.devices.update(curr => [...curr, deviceToRegister]);
    this.newDevice = { mac: '', alias: '', assignedDoor: '' };
  }

  viewDetail(device: ReaderDevice) {
    this.selectedDevice.set(device);
  }

  closeDetail() {
    this.selectedDevice.set(null);
  }
}
