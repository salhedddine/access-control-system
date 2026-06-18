import { Component, signal, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EnrollmentService, ReaderStatus } from '../../core/services/enrollment.service';

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
export class AccessControl implements OnInit, OnDestroy {
  // Inject core infrastructure services
  private enrollmentService = inject(EnrollmentService);
  private cdr = inject(ChangeDetectorRef);
  private statusSubscription!: Subscription;

  // Access Policy Signals
  rules = signal<SecurityRule[]>([
    { id: 'RUL-10', name: 'Core Infrastructure Security Clearance', targetRole: 'Super Admin', allowedDoors: ['Main Server Vault Vault-01', 'Penthouse Lift Layer'], timeWindow: '24/7 Unrestricted', isActive: true },
    { id: 'RUL-11', name: 'Standard Operational Corporate Shift', targetRole: 'Employee', allowedDoors: ['Floor 4 Glass Turnstile', 'Loading Dock Exterior Roller'], timeWindow: 'Mon-Fri 07:00 - 19:00', isActive: true },
    { id: 'RUL-12', name: 'Temporary Maintenance Windows', targetRole: 'Contractor', allowedDoors: ['Loading Dock Exterior Roller'], timeWindow: 'Tue-Thu 00:00 - 04:00', isActive: false }
  ]);

  newRuleName = '';
  newRuleRole = 'Employee';
  newRuleTime = 'Mon-Fri 08:00 - 17:00';

  // Hardware Provisioning UI State Fields
  enrollmentState: ReaderStatus = 'DISCONNECTED';
  hardwareStatusMessage = 'USB Enrollment Reader link offline.';
  targetCardUserId = '';
  
  // User Directory Matrix
  availableUsers = [
    { id: 'usr_8921', name: 'Salheddine Ayad' },
    { id: 'usr_4412', name: 'John Doe' }
  ];

  ngOnInit() {
    // Intercept hardware engine state events over asynchronous boundaries
    this.statusSubscription = this.enrollmentService.status$.subscribe((status: ReaderStatus) => {
      this.enrollmentState = status;
      this.updateStatusMessage(status);
      
      // Force UI updates across execution macro-tasks
      this.cdr.detectChanges();
    });
  }

  /**
   * Evaluates state machine configurations into descriptive status strings
   */
  private updateStatusMessage(status: ReaderStatus): void {
    switch (status) {
      case 'READY':
        this.hardwareStatusMessage = 'USB hardware device linked and hot. Ready to provision.';
        break;
      case 'READING':
        this.hardwareStatusMessage = 'Polling RF field... Place blank card onto the pad.';
        break;
      case 'SUCCESS':
        this.hardwareStatusMessage = 'AES keys successfully calculated and committed!';
        break;
      case 'ERROR':
        this.hardwareStatusMessage = 'Hardware connection link stalled or missing.';
        break;
      case 'DISCONNECTED':
      default:
        this.hardwareStatusMessage = 'USB Enrollment Reader link offline.';
        break;
    }
  }

  async initializeHardwareLink() {
    try {
      this.enrollmentState = 'DISCONNECTED';
      this.hardwareStatusMessage = 'Negotiating Web Serial handshakes...';
      this.cdr.detectChanges();

      await this.enrollmentService.connectReader();
    } catch (err: any) {
      this.enrollmentState = 'ERROR';
      this.hardwareStatusMessage = `Mount error: ${err.message || err}`;
      this.cdr.detectChanges();
    }
  }

  async executeCardProvisioning() {
    if (!this.targetCardUserId) {
      alert('Please isolate a system directory user to lock to this blank chip.');
      return;
    }

    try {
      const payloadString = `IDENTITY_ID:${this.targetCardUserId}`;
      await this.enrollmentService.provisionNewCard(payloadString);
    } catch (err: any) {
      this.enrollmentState = 'ERROR';
      this.hardwareStatusMessage = `Lifecycle aborted: ${err.message || err}`;
      this.cdr.detectChanges();
    }
  }

  async resetHardwareForm() {
    await this.enrollmentService.disconnectReader();
    this.targetCardUserId = '';
    this.cdr.detectChanges();
  }

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

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }
}