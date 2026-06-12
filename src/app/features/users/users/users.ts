import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Operator' | 'Employee' | 'Contractor';
  cardUid: string;
  status: 'Active' | 'Suspended';
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  users = signal<User[]>([
    { id: 'USR-001', name: 'Sarah Connor', email: 's.connor@sky.net', role: 'Super Admin', cardUid: 'A3:4F:92:11', status: 'Active' },
    { id: 'USR-002', name: 'John Doe', email: 'j.doe@access.io', role: 'Employee', cardUid: 'B8:11:C4:E2', status: 'Active' },
    { id: 'USR-003', name: 'Miles Dyson', email: 'm.dyson@cyber.com', role: 'Contractor', cardUid: 'E9:C2:5A:77', status: 'Suspended' }
  ]);

  showForm = signal(false);
  
  // Form Model state
  newUser = {
    name: '',
    email: '',
    role: 'Employee' as User['role'],
    cardUid: '',
  };

  toggleForm() {
    this.showForm.update(v => !v);
  }

  saveUser() {
    if (!this.newUser.name || !this.newUser.email) return;
    
    const userToSave: User = {
      id: `USR-00${this.users().length + 1}`,
      name: this.newUser.name,
      email: this.newUser.email,
      role: this.newUser.role,
      cardUid: this.newUser.cardUid || 'PENDING_PAIRING',
      status: 'Active'
    };

    this.users.update(current => [userToSave, ...current]);
    this.resetForm();
  }

  resetForm() {
    this.newUser = { name: '', email: '', role: 'Employee', cardUid: '' };
    this.showForm.set(false);
  }

  toggleStatus(userId: string) {
    this.users.update(list => list.map(u => 
      u.id === userId ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u
    ));
  }
}
