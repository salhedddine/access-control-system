import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DevicesStore } from '../services/devices.store';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devices.html',
  styleUrl: './devices.css',
})
export class Devices {
  readonly store = inject(DevicesStore);

  readonly controllers = this.store.controllersView;
  readonly selectedController = this.store.selectedController;
  readonly summary = this.store.summary;
  readonly alerts = this.store.alerts;

  readonly formError = signal<string | null>(null);

  newController = {
    mac: '',
    alias: '',
    doorId: '',
    doorName: '',
  };

  readonly criticalAlertsCount = computed(
    () => this.alerts().filter(a => a.level === 'critical').length
  );

  readonly warningAlertsCount = computed(
    () => this.alerts().filter(a => a.level === 'warning').length
  );

  registerController(): void {
    const result = this.store.registerDoorController(this.newController);

    if (!result.ok) {
      this.formError.set(result.error);
      return;
    }

    this.formError.set(null);
    this.newController = {
      mac: '',
      alias: '',
      doorId: '',
      doorName: '',
    };
  }

  openDetail(controllerId: string): void {
    this.store.selectController(controllerId);
  }

  closeDetail(): void {
    this.store.clearSelection();
  }

  onForceReboot(controllerId: string): void {
    this.store.forceOtaReboot(controllerId);
  }

  onClearKeys(controllerId: string): void {
    this.store.clearKeys(controllerId);
  }

  onRemoveController(controllerId: string): void {
    const confirmed = window.confirm(
      'Remove this door controller from the system?'
    );

    if (!confirmed) return;

    this.store.removeController(controllerId);
  }
}
