import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = localStorage.getItem('auth_token');

    if (req.url.includes('/session/refresh')) {
        return next(req);
    }

    let authReq = req;
    if (token) {
        authReq = addToken(req, token);
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !req.url.includes('/login')) {
                return handle401Error(authReq, next, authService);
            }
            return throwError(() => error);
        })
    );
};

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
    });
}

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService) {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        const token = localStorage.getItem('auth_token');
        if (token) {
            const http = inject(HttpClient);
            return http.post<{ token: string }>(`${environment.apiUrl}/session/refresh`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            }).pipe(
                switchMap((response) => {
                    isRefreshing = false;
                    refreshTokenSubject.next(response.token);
                    localStorage.setItem('auth_token', response.token);
                    return next(addToken(request, response.token));
                }),
                catchError((err) => {
                    isRefreshing = false;
                    authService.logout();
                    return throwError(() => err);
                })
            );
        }
    }

    return refreshTokenSubject.pipe(
        switchMap((token) => {
            if (token) {
                return next(addToken(request, token));
            }
            return throwError(() => new Error('No token available'));
        })
    );
}