import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card card-modern">
            <div class="card-header text-center">
              <h3>Créer un compte</h3>
              <p class="text-muted mb-0">Rejoignez notre communauté</p>
            </div>
            <div class="card-body">
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="firstName" class="form-label">Prénom</label>
                      <input
                        type="text"
                        id="firstName"
                        class="form-control"
                        formControlName="firstName"
                        [class.is-invalid]="registerForm.get('profile.firstName')?.invalid && registerForm.get('profile.firstName')?.touched">

                      @if (registerForm.get('profile.firstName')?.invalid && registerForm.get('profile.firstName')?.touched) {
                        <div class="invalid-feedback">
                          Le prénom est requis
                        </div>
                      }
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="lastName" class="form-label">Nom</label>
                      <input
                        type="text"
                        id="lastName"
                        class="form-control"
                        formControlName="lastName"
                        [class.is-invalid]="registerForm.get('profile.lastName')?.invalid && registerForm.get('profile.lastName')?.touched">

                      @if (registerForm.get('profile.lastName')?.invalid && registerForm.get('profile.lastName')?.touched) {
                        <div class="invalid-feedback">
                          Le nom est requis
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="username" class="form-label">Nom d'utilisateur</label>
                  <input
                    type="text"
                    id="username"
                    class="form-control"
                    formControlName="username"
                    [class.is-invalid]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched">

                  @if (registerForm.get('username')?.invalid && registerForm.get('username')?.touched) {
                    <div class="invalid-feedback">
                      Le nom d'utilisateur est requis
                    </div>
                  }
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    class="form-control"
                    formControlName="email"
                    [class.is-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">

                  @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
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
                    [class.is-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">

                  @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                    <div class="invalid-feedback">
                      Le mot de passe doit contenir au moins 6 caractères
                    </div>
                  }
                </div>

                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    class="form-control"
                    formControlName="confirmPassword"
                    [class.is-invalid]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">

                  @if (registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched) {
                    <div class="invalid-feedback">
                      Les mots de passe ne correspondent pas
                    </div>
                  }
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 btn-modern"
                  [disabled]="registerForm.invalid || loading">

                  @if (loading) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Créer mon compte
                </button>

                @if (errorMessage) {
                  <div class="alert alert-danger mt-3 mb-0">
                    {{ errorMessage }}
                  </div>
                }
              </form>

              <div class="text-center mt-3">
                <p>Déjà un compte ? <a routerLink="/login">Se connecter</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      profile: this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]]
      })
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(form: any) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const formValue = this.registerForm.value;
      const registerData = {
        username: formValue.username!,
        email: formValue.email!,
        password: formValue.password!,
        profile: {
          firstName: formValue.profile!.firstName!,
          lastName: formValue.profile!.lastName!
        }
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Une erreur est survenue lors de l\'inscription';
        }
      });
    }
  }
}
