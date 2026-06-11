import { Routes } from '@angular/router';
import { Layout } from './layout/layout/layout';

export const routes: Routes = [
    {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    //   { 
    //     path: 'dashboard', 
    //     loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
    //   },
    //   { 
    //     path: 'users', 
    //     loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent) 
    //   },
    //   { 
    //     path: 'devices', 
    //     loadComponent: () => import('./features/devices/devices.component').then(m => m.DevicesComponent) 
    //   },
    //   { 
    //     path: 'logs', 
    //     loadComponent: () => import('./features/logs/logs.component').then(m => m.LogsComponent) 
    //   },
    //   { 
    //     path: 'access-control', 
    //     loadComponent: () => import('./features/access-control/access-control.component').then(m => m.AccessControlComponent) 
    //   },
    ]
  }
];
