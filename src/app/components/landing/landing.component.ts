import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  public readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  showModal = false;
  isLoginMode = true;
  username = '';
  password = '';
  authMessage = '';
  isError = false;

  goToDashboard() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.openAuthModal();
    }
  }

  openAuthModal() {
    this.showModal = true;
    this.authMessage = '';
    this.username = '';
    this.password = '';
  }

  closeAuthModal() {
    this.showModal = false;
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.authMessage = '';
    this.username = '';
    this.password = '';
  }

  handleAuthSubmit() {
    this.authMessage = '';
    const payload = { username: this.username, password: this.password };

    if (this.isLoginMode) {
      this.auth.login(payload).subscribe({
        next: () => {
          this.closeAuthModal();
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isError = true;
          this.authMessage = err.error?.error || 'Invalid credentials or connection issue.';
        }
      });
    } else {
      this.auth.register(payload).subscribe({
        next: () => {
          this.isError = false;
          this.authMessage = 'Profile registered successfully! You can sign in now.';
          this.isLoginMode = true;
          this.password = '';
        },
        error: (err) => {
          this.isError = true;
          this.authMessage = err.error?.error || 'Registration processing failure.';
        }
      });
    }
  }
}