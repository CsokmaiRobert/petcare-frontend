import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class SessionService {
    private readonly http = inject(HttpClient);
    private readonly ngZone = inject(NgZone);
    private readonly router = inject(Router);
    private readonly sessionUrl = `${environment.apiUrl}/session`;

    private lastActivityTime = Date.now();
    private activityCheckInterval: any;
    private isMonitoring = false;

    startMonitoring(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.lastActivityTime = Date.now();

        this.ngZone.runOutsideAngular(() => {
            const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart', 'wheel'];
            const activity$ = merge(
                ...events.map(event => fromEvent(window, event))
            ).pipe(
                throttleTime(500),
                debounceTime(500)
            );

            activity$.subscribe(() => {
                const now = Date.now();
                this.lastActivityTime = now;
            });

            this.activityCheckInterval = setInterval(() => {
                this.checkAndRefreshSession();
            }, 500);
        });
    }

    private checkAndRefreshSession(): void {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            this.forceLogout();
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();

            if (isExpired) {
                this.forceLogout();
                return;
            }
        } catch (err) {
            this.forceLogout();
            return;
        }

        const timeSinceLastActivity = Date.now() - this.lastActivityTime;

        if (timeSinceLastActivity < 1000) {
            this.refreshSession();
        }
        else if (timeSinceLastActivity > 5000) {
            this.forceLogout();
        }
    }

    private refreshSession(): void {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return;
        }

        this.http.post<{ token: string }>(`${this.sessionUrl}/refresh`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
            next: (response) => {
                localStorage.setItem('auth_token', response.token);
            },
            error: (err) => {
                if (err.status === 401) {
                    this.forceLogout();
                }
            }
        });
    }

    private forceLogout(): void {
        this.stopMonitoring();
        localStorage.removeItem('auth_token');

        this.ngZone.run(() => {
            this.router.navigate(['/login']);
        });
    }

    stopMonitoring(): void {
        if (this.activityCheckInterval) {
            clearInterval(this.activityCheckInterval);
        }
        this.isMonitoring = false;
    }

    getLastActivity(): Date {
        return new Date(this.lastActivityTime);
    }
}