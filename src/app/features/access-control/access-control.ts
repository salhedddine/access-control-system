import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SecurityRule {
  id: string;
  name: string;
  targetRole: string;
  allowedDoors: string[];
  timeWindow: string;
  isActive: boolean;
}

@Component({
  selector: 'app-access-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access-control.html',
  styleUrl: './access-control.css',
})
export class AccessControl {
  rules = signal<SecurityRule[]>([
    { id: 'RUL-10', name: 'Core Infrastructure Security Clearance', targetRole: 'Super Admin', allowedDoors: ['Main Server Vault Vault-01', 'Penthouse Lift Layer'], timeWindow: '24/7 Unrestricted', isActive: true },
    { id: 'RUL-11', name: 'Standard Operational Corporate Shift', targetRole: 'Employee', allowedDoors: ['Floor 4 Glass Turnstile', 'Loading Dock Exterior Roller'], timeWindow: 'Mon-Fri 07:00 - 19:00', isActive: true },
    { id: 'RUL-12', name: 'Temporary Maintenance Windows', targetRole: 'Contractor', allowedDoors: ['Loading Dock Exterior Roller'], timeWindow: 'Tue-Thu 00:00 - 04:00', isActive: false }
  ]);

  newRuleName = '';
  newRuleRole = 'Employee';
  newRuleTime = 'Mon-Fri 08:00 - 17:00';

  addRule() {
    if (!this.newRuleName) return;
    const rule: SecurityRule = {
      id: `RUL-${this.rules().length + 10}`,
      name: this.newRuleName,
      targetRole: this.newRuleRole,
      allowedDoors: ['Global Perimeter Shared Portals'],
      timeWindow: this.newRuleTime,
      isActive: true
    };
    this.rules.update(r => [...r, rule]);
    this.newRuleName = '';
  }

  toggleRule(ruleId: string) {
    this.rules.update(list => list.map(r => 
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r
    ));
  }
}
