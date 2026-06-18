import { Routes } from '@angular/router';

export const ACCESS_CONTROL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./access-control').then(m => m.AccessControl),
    children: [
      {
        path: 'enroll',
        loadComponent: () => import('./components/enrollment/enrollment/enrollment').then(m => m.Enrollment)
      }
    ]
  }
];