/* =========================
   Device / Controller Status
========================= */

export type DeviceStatus = 'online' | 'offline' | 'error';

/**
* Health of each physical reader (IN / OUT)
* - ok: working normally
* - missing: not connected / not configured
* - error: hardware or communication issue
*/
export type ReaderHealth = 'ok' | 'missing' | 'error';

/**
* Aggregated health at door level
*/
export type DoorHealth = 'healthy' | 'degraded' | 'error';


/* =========================
   Core Domain Model
========================= */

/**
* 🔥 MAIN ENTITY (IMPORTANT)
* Represents ONE ESP32 controller = ONE door
*/
export interface DoorController {
  id: string;                // internal frontend ID
  mac: string;               // hardware identity (UNIQUE)
  alias: string;             // human friendly ("Server Room Controller")

  firmware: string;

  doorId: string;            // unique door reference (backend)
  doorName: string;          // display name ("Main Server Vault")

  status: DeviceStatus;      // controller connectivity
  signalStrength: number;    // RSSI (dBm)
  lastSeen: string;          // last heartbeat ("2s ago")

  /**
   * Readers connected to this controller
   */
  readers: {
    in: ReaderHealth;
    out: ReaderHealth;
  };
}


/* =========================
   View Models (UI Layer)
========================= */

/**
* Extended view used in UI
* (computed properties for dashboards/cards)
*/
export interface DoorControllerView extends DoorController {
  doorHealth: DoorHealth;
}


/**
* Summary for dashboard / KPI cards
*/
export interface DevicesSummary {
  totalDoors: number;
  totalControllers: number;

  onlineControllers: number;
  offlineControllers: number;
  errorControllers: number;

  doorsHealthy: number;
  doorsDegraded: number;
  doorsError: number;
}


/**
* Alert model for UI
*/
export interface DeviceAlert {
  level: 'critical' | 'warning';
  controllerId: string;
  doorId: string;
  message: string;
}


/* =========================
   Backend / Events Models
========================= */

/**
* 🔥 VERY IMPORTANT (future use)
* Event coming from backend
*
* This is what your ESP32 will send
*/
export type AccessDirection = 'IN' | 'OUT';

export interface AccessEvent {
  id: string;

  controllerId: string;
  doorId: string;

  userId: string;

  direction: AccessDirection;

  timestamp: string;

  result: 'ALLOW' | 'DENY';
}


/* =========================
   Commands / Inputs
========================= */

/**
* Input used when registering a new controller
*/
export interface RegisterDoorControllerInput {
  mac: string;
  alias: string;

  doorId: string;
  doorName: string;
}


/**
* Command: update controller health
*/
export interface UpdateControllerStatusInput {
  controllerId: string;
  status: DeviceStatus;
  signalStrength?: number;
  lastSeen?: string;
}


/**
* Command: update reader health
*/
export interface UpdateReaderHealthInput {
  controllerId: string;
  direction: 'in' | 'out';
  health: ReaderHealth;
}