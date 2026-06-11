import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'access-control-dashboard';

  ngOnInit(): void {
    // Perfect hook location for initializing global app state telemetry 
    // or triggering configuration handshakes in the future.
    console.log('🛡️ AccessOS Control Core Engine Initialized.');
  }
}
