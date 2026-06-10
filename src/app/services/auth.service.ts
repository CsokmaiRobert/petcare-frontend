import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly sessionService = inject(SessionService);
    private readonly url = 'https://10.169.140.178:3000/api/auth';

    private isLoggedInSignal = signal<boolean>(!!localStorage.getItem('auth_token'));

    isLoggedIn(): boolean {
        if (this.isLoggedInSignal() && this.isTokenExpired()) {
            this.logout();
            return false;
        }
        return this.isLoggedInSignal();
    }

    private isTokenExpired(): boolean {
        const token = localStorage.getItem('auth_token');
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expired = payload.exp * 1000 < Date.now();
            return expired;
        } catch {
            return true;
        }
    }

    login(credentials: { username: string; password: string }) {
        return this.http.post<{ token: string }>(`${this.url}/login`, credentials).pipe(
            tap((res) => {
                localStorage.setItem('auth_token', res.token);
                this.isLoggedInSignal.set(true);
                this.sessionService.startMonitoring();
                this.router.navigate(['/dashboard']);
            })
        );
    }

    register(credentials: { username: string; password: string }) {
        return this.http.post(`${this.url}/register`, credentials);
    }

    logout() {
        this.sessionService.stopMonitoring();
        localStorage.removeItem('auth_token');
        this.isLoggedInSignal.set(false);
        this.router.navigate(['/login']);
    }
}