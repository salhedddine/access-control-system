import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning';
  message: string;
  location: string;
  timestamp: string;
}

@Component({
  selector: 'app-alerts-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts-panel.html',
  styleUrl: './alerts-panel.css',
})
export class AlertsPanel {
  alerts = signal<SystemAlert[]>([
    { id: '1', type: 'critical', message: 'Door forced open detection event', location: 'Server Room Alpha', timestamp: 'Just now' },
    { id: '2', type: 'warning', message: 'ESP32 Client node connection drop', location: 'South Gate Turnstile', timestamp: '4 mins ago' },
    { id: '3', type: 'warning', message: 'Multiple invalid keycard rejections', location: 'Main Executive Lobby', timestamp: '12 mins ago' },
    { id: '4', type: 'critical', message: 'Fire Integration Bypass override active', location: 'External Facility Perimeter', timestamp: '1 hr ago' }
  ]);
}
