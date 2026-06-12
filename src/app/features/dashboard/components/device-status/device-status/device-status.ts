import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ControllerNode {
  mac: string;
  alias: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: string;
}

@Component({
  selector: 'app-device-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './device-status.html',
  styleUrl: './device-status.css',
})
export class DeviceStatus {
  devices = signal<ControllerNode[]>([
    { mac: '32:AE:A4:07:0X:11', alias: 'ESP32-A1 (Server Entrance)', ipAddress: '192.168.1.101', status: 'online', lastSeen: 'Active' },
    { mac: '32:AE:A4:07:0X:22', alias: 'ESP32-B2 (Loading Dock)', ipAddress: '192.168.1.102', status: 'offline', lastSeen: '12m ago' },
    { mac: '32:AE:A4:07:0X:33', alias: 'ESP32-C1 (Parking Entry)', ipAddress: '192.168.1.105', status: 'online', lastSeen: 'Active' },
    { mac: '32:AE:A4:07:0X:44', alias: 'ESP32-D9 (Penthouse Lift)', ipAddress: '192.168.1.110', status: 'error', lastSeen: '1h ago' }
  ]);
}
