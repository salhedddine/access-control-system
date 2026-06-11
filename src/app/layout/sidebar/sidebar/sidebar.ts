import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  // Navigation menu items matched exactly to your feature domains
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '📊' },
    { label: 'Users', route: '/users', icon: '👥' },
    { label: 'Devices', route: '/devices', icon: '💻' },
    { label: 'Logs', route: '/logs', icon: '📜' },
    { label: 'Access Control', route: '/access-control', icon: '🔐' }
  ];
}
