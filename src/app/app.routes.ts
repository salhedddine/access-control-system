import { Routes } from '@angular/router';
import { Layout } from './layout/layout/layout';

export const routes: Routes = [
    {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard) 
      },
      { 
        path: 'users', 
        loadComponent: () => import('./features/users/users/users').then(m => m.Users) 
      },
      { 
        path: 'devices', 
        loadComponent: () => import('./features/devices/devices/devices').then(m => m.Devices) 
      },
      { 
        path: 'logs', 
        loadComponent: () => import('./features/logs/logs/logs').then(m => m.Logs) 
      },
      { 
        path: 'access-control', 
        loadComponent: () => import('./features/access-control/access-control').then(m => m.AccessControl) 
      },
    ]
  }
];
