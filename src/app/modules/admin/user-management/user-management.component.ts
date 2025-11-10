import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="h2 fw-bold">Gestion des utilisateurs</h1>
              <p class="text-muted mb-0">Gérer les comptes et permissions</p>
            </div>
            <button
              class="btn btn-primary"
              (click)="showUserForm = true">
              <i class="bi bi-plus-circle me-1"></i>
              Nouvel utilisateur
            </button>
          </div>
        </div>
      </div>

      <!-- Formulaire création utilisateur -->
      @if (showUserForm) {
        <div class="row mb-4">
          <div class="col-12">
            <div class="card card-modern">
              <div class="card-header">
                <h5 class="mb-0">Créer un utilisateur</h5>
              </div>
              <div class="card-body">
                <form [formGroup]="userForm" (ngSubmit)="createUser()">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Prénom</label>
                        <input type="text" class="form-control" formControlName="firstName">
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Nom</label>
                        <input type="text" class="form-control" formControlName="lastName">
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" formControlName="email">
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Rôle</label>
                        <select class="form-select" formControlName="role">
                          <option value="reader">Lecteur</option>
                          <option value="writer">Rédacteur</option>
                          <option value="editor">Éditeur</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex gap-2">
                    <button type="button" class="btn btn-outline-secondary" (click)="cancelCreate()">
                      Annuler
                    </button>
                    <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid">
                      Créer l'utilisateur
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Liste des utilisateurs -->
      <div class="row">
        <div class="col-12">
          <div class="card card-modern">
            <div class="card-header">
              <h5 class="mb-0">Utilisateurs ({{ users.length }})</h5>
            </div>
            <div class="card-body">
              <!-- Filtres -->
              <div class="row mb-3">
                <div class="col-md-4">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Rechercher..."
                    [(ngModel)]="searchTerm">
                </div>
                <div class="col-md-3">
                  <select class="form-select" [(ngModel)]="roleFilter">
                    <option value="">Tous les rôles</option>
                    <option value="reader">Lecteur</option>
                    <option value="writer">Rédacteur</option>
                    <option value="editor">Éditeur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <select class="form-select" [(ngModel)]="statusFilter">
                    <option value="">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>

              <!-- Tableau -->
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th>Dernière connexion</th>
                      <th>Inscription</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (user of filteredUsers; track user._id) {
                      <tr>
                        <td>
                          <div class="d-flex align-items-center">
                            <img
                              [src]="user.profile.avatar || '/assets/default-avatar.png'"
                              class="avatar me-3">
                            <div>
                              <div class="fw-bold">
                                {{ user.profile.firstName }} {{ user.profile.lastName }}
                              </div>
                              <div class="text-muted small">
                                {{ user.username }}
                              </div>
                              <div class="text-muted small">{{ user.email }}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-secondary': user.role === 'reader',
                            'bg-primary': user.role === 'writer',
                            'bg-warning': user.role === 'editor',
                            'bg-danger': user.role === 'admin'
                          }">
                            {{ user.role }}
                          </span>
                        </td>
                        <td>
                          @if (user.isActive) {
                            <span class="badge bg-success">Actif</span>
                          } @else {
                            <span class="badge bg-danger">Inactif</span>
                          }
                        </td>
                        <td>{{ user.lastLogin | date:'dd/MM/yyyy' }}</td>
                        <td>{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button
                              class="btn btn-outline-primary"
                              (click)="editUser(user)">
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button
                              class="btn btn-outline-danger"
                              (click)="toggleUserStatus(user)">
                              <i class="bi"
                                 [class.bi-person-check]="!user.isActive"
                                 [class.bi-person-x]="user.isActive"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <nav>
                <ul class="pagination justify-content-center">
                  <li class="page-item disabled">
                    <a class="page-link" href="#">Précédent</a>
                  </li>
                  <li class="page-item active">
                    <a class="page-link" href="#">1</a>
                  </li>
                  <li class="page-item">
                    <a class="page-link" href="#">2</a>
                  </li>
                  <li class="page-item">
                    <a class="page-link" href="#">3</a>
                  </li>
                  <li class="page-item">
                    <a class="page-link" href="#">Suivant</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  showUserForm = false;
  searchTerm = '';
  roleFilter = '';
  statusFilter = '';
  userForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['reader', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    // Données mockées
    this.users = [
      {
        _id: '1',
        username: 'johndoe',
        email: 'john@example.com',
        role: 'admin',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          avatar: '/assets/default-avatar.png'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      {
        _id: '2',
        username: 'janesmith',
        email: 'jane@example.com',
        role: 'writer',
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
          avatar: '/assets/default-avatar.png'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
    ];
  }

  get filteredUsers(): User[] {
    return this.users.filter(user => {
      const matchesSearch =
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = !this.roleFilter || user.role === this.roleFilter;
      const matchesStatus = !this.statusFilter ||
        (this.statusFilter === 'active' && user.isActive) ||
        (this.statusFilter === 'inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  createUser() {
    if (this.userForm.valid) {
      console.log('Creating user:', this.userForm.value);
      this.showUserForm = false;
      this.userForm.reset();
    }
  }

  cancelCreate() {
    this.showUserForm = false;
    this.userForm.reset();
  }

  editUser(user: User) {
    console.log('Editing user:', user);
  }

  toggleUserStatus(user: User) {
    user.isActive = !user.isActive;
    console.log('Toggled user status:', user);
  }
}
