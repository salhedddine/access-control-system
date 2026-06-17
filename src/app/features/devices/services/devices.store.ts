import { Injectable, computed, signal } from '@angular/core';
import {
  DoorController,
  DoorHealth,
  ReaderHealth,
} from '../models/device';

/**
* Expected model file shape (for reference)
*
* export type DeviceStatus = 'online' | 'offline' | 'error';
* export type ReaderHealth = 'ok' | 'missing' | 'error';
* export type DoorHealth = 'healthy' | 'degraded' | 'error';
*
* export interface DoorController {
*   id: string;
*   mac: string;
*   alias: string;
*   firmware: string;
*   doorId: string;
*   doorName: string;
*   status: 'online' | 'offline' | 'error';
*   signalStrength: number;
*   lastSeen: string;
*   readers: {
*     in: ReaderHealth;
*     out: ReaderHealth;
*   };
* }
*/

export interface RegisterDoorControllerInput {
  mac: string;
  alias: string;
  doorId: string;
  doorName: string;
}

export interface DoorControllerView extends DoorController {
  doorHealth: DoorHealth;
}

@Injectable({
  providedIn: 'root',
})
export class DevicesStore {
  private readonly _controllers = signal<DoorController[]>([
    {
      id: 'ctrl-01',
      mac: '32:AE:A4:07:0X:11',
      alias: 'Server Room Controller',
      firmware: 'v1.4.2-ESP32',
      doorId: 'vault-01',
      doorName: 'Main Server Vault',
      status: 'online',
      signalStrength: -62,
      lastSeen: '2s ago',
      readers: {
        in: 'ok',
        out: 'ok',
      },
    },
    {
      id: 'ctrl-02',
      mac: '32:AE:A4:07:0X:22',
      alias: 'Loading Dock Controller',
      firmware: 'v1.4.0-ESP32',
      doorId: 'dock-roller-01',
      doorName: 'Loading Dock Exterior Roller',
      status: 'offline',
      signalStrength: 0,
      lastSeen: '5m ago',
      readers: {
        in: 'ok',
        out: 'missing',
      },
    },
    {
      id: 'ctrl-03',
      mac: '32:AE:A4:07:0X:33',
      alias: 'Executive Floor Lobby Controller',
      firmware: 'v1.4.2-ESP32',
      doorId: 'floor4-turnstile-east',
      doorName: 'Floor 4 Glass Turnstile',
      status: 'online',
      signalStrength: -55,
      lastSeen: '1s ago',
      readers: {
        in: 'ok',
        out: 'error',
      },
    },
  ]);

  private readonly _selectedControllerId = signal<string | null>(null);

  readonly controllers = this._controllers.asReadonly();
  readonly selectedControllerId = this._selectedControllerId.asReadonly();

  /**
   * Decorated view: same controller object + computed door health
   */
  readonly controllersView = computed<DoorControllerView[]>(() => {
    return this._controllers().map((controller) => ({
      ...controller,
      doorHealth: this.computeDoorHealth(controller),
    }));
  });

  /**
   * Summary cards for dashboard/devices page
   */
  readonly summary = computed(() => {
    const controllers = this._controllers();

    const onlineControllers = controllers.filter(c => c.status === 'online').length;
    const offlineControllers = controllers.filter(c => c.status === 'offline').length;
    const errorControllers = controllers.filter(c => c.status === 'error').length;

    const doorsHealthy = this.controllersView().filter(c => c.doorHealth === 'healthy').length;
    const doorsDegraded = this.controllersView().filter(c => c.doorHealth === 'degraded').length;
    const doorsError = this.controllersView().filter(c => c.doorHealth === 'error').length;

    return {
      totalDoors: controllers.length,
      totalControllers: controllers.length,
      onlineControllers,
      offlineControllers,
      errorControllers,
      doorsHealthy,
      doorsDegraded,
      doorsError,
    };
  });

  /**
   * Useful if you want alert widgets later
   */
  readonly alerts = computed(() => {
    const alerts: Array<{
      level: 'critical' | 'warning';
      controllerId: string;
      doorId: string;
      message: string;
    }> = [];

    for (const controller of this.controllersView()) {
      if (controller.status === 'offline') {
        alerts.push({
          level: 'critical',
          controllerId: controller.id,
          doorId: controller.doorId,
          message: `${controller.doorName}: controller offline`,
        });
      }

      if (controller.readers.in === 'missing') {
        alerts.push({
          level: 'warning',
          controllerId: controller.id,
          doorId: controller.doorId,
          message: `${controller.doorName}: IN reader missing`,
        });
      }

      if (controller.readers.out === 'missing') {
        alerts.push({
          level: 'warning',
          controllerId: controller.id,
          doorId: controller.doorId,
          message: `${controller.doorName}: OUT reader missing`,
        });
      }

      if (controller.readers.in === 'error') {
        alerts.push({
          level: 'critical',
          controllerId: controller.id,
          doorId: controller.doorId,
          message: `${controller.doorName}: IN reader error`,
        });
      }

      if (controller.readers.out === 'error') {
        alerts.push({
          level: 'critical',
          controllerId: controller.id,
          doorId: controller.doorId,
          message: `${controller.doorName}: OUT reader error`,
        });
      }
    }

    return alerts;
  });

  readonly selectedController = computed<DoorControllerView | null>(() => {
    const selectedId = this._selectedControllerId();
    if (!selectedId) return null;

    return this.controllersView().find(c => c.id === selectedId) ?? null;
  });

  selectController(controllerId: string): void {
    this._selectedControllerId.set(controllerId);
  }

  clearSelection(): void {
    this._selectedControllerId.set(null);
  }

  registerDoorController(
    input: RegisterDoorControllerInput
  ): { ok: true } | { ok: false; error: string } {
    const normalizedMac = input.mac.trim().toUpperCase();
    const normalizedDoorId = input.doorId.trim().toLowerCase();

    if (!normalizedMac || !input.alias.trim() || !normalizedDoorId || !input.doorName.trim()) {
      return {
        ok: false,
        error: 'MAC, alias, door ID and door name are required.',
      };
    }

    const sameMac = this._controllers().some(c => c.mac === normalizedMac);
    if (sameMac) {
      return {
        ok: false,
        error: `A controller with MAC ${normalizedMac} already exists.`,
      };
    }

    const sameDoor = this._controllers().some(c => c.doorId === normalizedDoorId);
    if (sameDoor) {
      return {
        ok: false,
        error: `Door "${input.doorName}" already has a controller assigned.`,
      };
    }

    const newController: DoorController = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${normalizedMac}`,
      mac: normalizedMac,
      alias: input.alias.trim(),
      firmware: 'v1.5.0-ESP-STABLE',
      doorId: normalizedDoorId,
      doorName: input.doorName.trim(),
      status: 'online',
      signalStrength: -45,
      lastSeen: 'just now',
      readers: {
        in: 'ok',
        out: 'ok',
      },
    };

    this._controllers.update(curr => [...curr, newController]);
    return { ok: true };
  }

  setControllerStatus(
    controllerId: string,
    status: DoorController['status'],
    signalStrength?: number,
    lastSeen?: string
  ): void {
    this._controllers.update(curr =>
      curr.map(controller =>
        controller.id === controllerId
          ? {
              ...controller,
              status,
              signalStrength: signalStrength ?? controller.signalStrength,
              lastSeen: lastSeen ?? controller.lastSeen,
            }
          : controller
      )
    );
  }

  setReaderHealth(
    controllerId: string,
    direction: 'in' | 'out',
    health: ReaderHealth
  ): void {
    this._controllers.update(curr =>
      curr.map(controller =>
        controller.id === controllerId
          ? {
              ...controller,
              readers: {
                ...controller.readers,
                [direction]: health,
              },
            }
          : controller
      )
    );
  }

  forceOtaReboot(controllerId: string): void {
    // Stub for backend integration
    console.log('Force OTA reboot requested for controller', controllerId);
  }

  clearKeys(controllerId: string): void {
    // Stub for backend integration
    console.log('Clear keys requested for controller', controllerId);
  }

  removeController(controllerId: string): void {
    this._controllers.update(curr => curr.filter(c => c.id !== controllerId));

    if (this._selectedControllerId() === controllerId) {
      this._selectedControllerId.set(null);
    }
  }

  private computeDoorHealth(controller: DoorController): DoorHealth {
    if (controller.status === 'error') return 'error';
    if (controller.status === 'offline') return 'error';

    const hasReaderError =
      controller.readers.in === 'error' || controller.readers.out === 'error';

    if (hasReaderError) return 'error';

    const hasMissingReader =
      controller.readers.in === 'missing' || controller.readers.out === 'missing';

    if (hasMissingReader) return 'degraded';

    return 'healthy';
  }
}
