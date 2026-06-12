import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCards } from '../components/kpi-cards/kpi-cards/kpi-cards';
import { AlertsPanel } from '../components/alerts-panel/alerts-panel/alerts-panel';
import { DeviceStatus } from '../components/device-status/device-status/device-status';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KpiCards,
    AlertsPanel,
    DeviceStatus
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {}
