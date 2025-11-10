import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card card-modern">
            <div class="card-header text-center">
              <h3>Connexion</h3>
            </div>
            <div class="card-body">
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    class="form-control"
                    formControlName="email"
                    [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">

                  @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                    <div class="invalid-feedback">
                      Veuillez entrer un email valide
                    </div>
                  }
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Mot de passe</label>
                  <input
                    type="password"
                    id="password"
                    class="form-control"
                    formControlName="password"
                    [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">

                  @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                    <div class="invalid-feedback">
                      Le mot de passe est requis
                    </div>
                  }
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 btn-modern"
                  [disabled]="loginForm.invalid || loading">

                  @if (loading) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Se connecter
                </button>
              </form>

              <div class="text-center mt-3">
                <p>Pas de compte ? <a routerLink="/register">S'inscrire</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });}

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      const credentials = this.loginForm.value;

      this.authService.login(credentials as any).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Login error:', error);
        }
      });
    }
  }
}
