import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card card-modern">
            <div class="card-header">
              <h3 class="mb-0">Mon Profil</h3>
            </div>
            <div class="card-body">
              <!-- Informations personnelles -->
              <div class="row mb-4">
                <div class="col-md-4 text-center">
                  <img
                    [src]="currentUser?.profile?.avatar || '/assets/default-avatar.png'"
                    class="avatar-lg mb-3"
                    alt="Avatar">
                  <h5>{{ currentUser?.profile?.firstName }} {{ currentUser?.profile?.lastName }}</h5>
                  <p class="text-muted">{{ currentUser?.username }}</p>
                  <span class="badge bg-primary">{{ currentUser?.role }}</span>
                </div>
                <div class="col-md-8">
                  <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label class="form-label">Prénom</label>
                          <input
                            type="text"
                            class="form-control"
                            formControlName="firstName">
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label class="form-label">Nom</label>
                          <input
                            type="text"
                            class="form-control"
                            formControlName="lastName">
                        </div>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Bio</label>
                      <textarea
                        class="form-control"
                        formControlName="bio"
                        rows="3"
                        placeholder="Parlez-nous de vous..."></textarea>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Avatar URL</label>
                      <input
                        type="url"
                        class="form-control"
                        formControlName="avatar"
                        placeholder="https://example.com/avatar.jpg">
                    </div>

                    <button
                      type="submit"
                      class="btn btn-primary"
                      [disabled]="profileForm.invalid || profileLoading">

                      @if (profileLoading) {
                        <span class="spinner-border spinner-border-sm me-2"></span>
                      }
                      Mettre à jour
                    </button>
                  </form>
                </div>
              </div>

              <!-- Informations de compte -->
              <div class="card card-modern">
                <div class="card-header">
                  <h5 class="mb-0">Informations du compte</h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <p><strong>Email:</strong> {{ currentUser?.email }}</p>
                      <p><strong>Nom d'utilisateur:</strong> {{ currentUser?.username }}</p>
                    </div>
                    <div class="col-md-6">
                      <p><strong>Rôle:</strong> {{ currentUser?.role }}</p>
                      <p><strong>Membre depuis:</strong> {{ currentUser?.createdAt | date:'dd/MM/yyyy' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileLoading = false;
  profileForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    bio: [''],
    avatar: ['']
  });}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          bio: user.profile.bio,
          avatar: user.profile.avatar
        });
      }
    });
  }

  updateProfile() {
    if (this.profileForm.valid && this.currentUser) {
      this.profileLoading = true;

      // Simuler une mise à jour
      setTimeout(() => {
        const updatedUser: User = {
          ...this.currentUser!,
          profile: {
            ...this.currentUser!.profile,
            ...this.profileForm.value
          }
        };

        //this.authService.updateCurrentUser(updatedUser);
        this.profileLoading = false;
      }, 1000);
    }
  }
}
