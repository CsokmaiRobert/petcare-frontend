import { Component, OnInit, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionService } from './services/session.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent implements OnInit {
  title = 'PetCare';

  private sessionService = inject(SessionService);
  private authService = inject(AuthService);

  constructor() {
    effect(() => {
      const isLoggedIn = this.authService.isLoggedIn();
      if (isLoggedIn) {
        this.sessionService.startMonitoring();
      } else {
        this.sessionService.stopMonitoring();
      }
    });
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.sessionService.startMonitoring();
    }
  }
}