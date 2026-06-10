import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    private readonly auth = inject(AuthService);

    username = '';
    password = '';
    isLoginMode = true;
    message = '';
    isError = false;

    toggleMode() {
        this.isLoginMode = !this.isLoginMode;
        this.message = '';
    }

    onSubmit() {
        this.message = '';
        const payload = { username: this.username, password: this.password };

        if (this.isLoginMode) {
            this.auth.login(payload).subscribe({
                error: (err) => {
                    this.isError = true;
                    this.message = err.error?.error || 'Login processing error';
                }
            });
        } else {
            this.auth.register(payload).subscribe({
                next: () => {
                    this.isError = false;
                    this.message = 'Registration complete! You can sign in now.';
                    this.isLoginMode = true;
                    this.password = '';
                },
                error: (err) => {
                    this.isError = true;
                    this.message = err.error?.error || 'Registration processing error';
                }
            });
        }
    }
}