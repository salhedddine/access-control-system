import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface KpiItem {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-cards.html',
  styleUrl: './kpi-cards.css',
})
export class KpiCards {
  // Reactive mock numbers for real-time tracking simulation
  kpis = signal<KpiItem[]>([
    { title: 'Total Users', value: 1248, change: '+12 this week', isPositive: true, icon: '👥', colorClass: 'blue-kpi' },
    { title: 'Active Devices', value: '42 / 45', change: '93.3% operational', isPositive: true, icon: '💻', colorClass: 'emerald-kpi' },
    { title: 'Today\'s Access Logs', value: 384, change: '-5% vs yesterday', isPositive: false, icon: '🚪', colorClass: 'purple-kpi' }
  ]);
}
