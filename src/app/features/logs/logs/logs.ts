import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AccessLog {
  id: string;
  timestamp: string;
  username: string;
  deviceAlias: string;
  cardUid: string;
  result: 'GRANTED' | 'DENIED';
  reason: string;
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logs.html',
  styleUrl: './logs.css',
})
export class Logs {
  searchQuery = signal('');
  filterResult = signal<string>('ALL');

  masterLogs = signal<AccessLog[]>([
    { id: 'LOG-9921', timestamp: '2026-06-12 10:14:22', username: 'Sarah Connor', deviceAlias: 'Server Room Core Entrance', cardUid: 'A3:4F:92:11', result: 'GRANTED', reason: 'Valid Token Check' },
    { id: 'LOG-9920', timestamp: '2026-06-12 10:11:05', username: 'Unknown Attacker', deviceAlias: 'Executive Floor Lobby East', cardUid: '00:FF:22:11', result: 'DENIED', reason: 'Invalid Card Identity Token' },
    { id: 'LOG-9919', timestamp: '2026-06-12 09:45:10', username: 'John Doe', deviceAlias: 'Server Room Core Entrance', cardUid: 'B8:11:C4:E2', result: 'GRANTED', reason: 'Valid Token Check' },
    { id: 'LOG-9918', timestamp: '2026-06-12 08:32:00', username: 'Miles Dyson', deviceAlias: 'Backyard Loading Dock Gate', cardUid: 'E9:C2:5A:77', result: 'DENIED', reason: 'Suspended Identity Context' }
  ]);

  // High performance filtered logs pipeline built on Angular Computed Signals
  filteredLogs = computed(() => {
    let list = this.masterLogs();

    if (this.filterResult() !== 'ALL') {
      list = list.filter(l => l.result === this.filterResult());
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(l => 
        l.username.toLowerCase().includes(query) || 
        l.deviceAlias.toLowerCase().includes(query) ||
        l.cardUid.toLowerCase().includes(query)
      );
    }

    return list;
  });
}
