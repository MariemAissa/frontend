import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { User } from  '../../../core/models/user.model';
import {NotificationBellComponent} from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent],
  template: `
    <nav class="navbar navbar-expand-lg navbar-modern">
      <div class="container">
        <!-- Brand -->
        <a class="navbar-brand" routerLink="/">
          <i class="bi bi-pencil-square me-2"></i>
          Blog
        </a>

        <!-- Mobile Toggle -->
        <button class="navbar-toggler" type="button"
                data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navbar Content -->
        <div class="collapse navbar-collapse" id="navbarContent">
          <!-- Navigation Links -->
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active">
                <i class="bi bi-house me-1"></i>
                Accueil
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/articles" routerLinkActive="active">
                <i class="bi bi-journal-text me-1"></i>
                Articles
              </a>
            </li>

            @if (currentUser) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                  <i class="bi bi-speedometer2 me-1"></i>
                  Dashboard
                </a>
              </li>
            }

            @if (isAdmin) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/admin" routerLinkActive="active">
                  <i class="bi bi-shield-check me-1"></i>
                  Admin
                </a>
              </li>
            }
          </ul>

          <!-- User Menu -->
          @if (currentUser) {
            <div class="d-flex align-items-center gap-3">

              <!-- Composant de notifications -->
              <app-notification-bell></app-notification-bell>

              <!-- Profil utilisateur -->
              <div class="dropdown">
                <button class="btn btn-link nav-link dropdown-toggle d-flex align-items-center"
                        type="button" data-bs-toggle="dropdown">
                  <img [src]="'../../assets/icons8-user-default-64.png'"
                       class="avatar me-2" alt="Avatar">
                  <span>{{ currentUser.username }}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <a class="dropdown-item" routerLink="/profile">
                      <i class="bi bi-person me-2"></i>
                      Profil
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" routerLink="/my-articles">
                      <i class="bi bi-journal me-2"></i>
                      Mes Articles
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" routerLink="/notifications">
                      <i class="bi bi-bell me-2"></i>
                      Mes Notifications
                      @if (unreadCount > 0) {
                        <span class="badge bg-danger ms-2">{{ unreadCount }}</span>
                      }
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <button class="dropdown-item text-danger" (click)="logout()">
                      <i class="bi bi-box-arrow-right me-2"></i>
                      Déconnexion
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          } @else {
            <div class="d-flex gap-2">
              <a class="btn btn-outline-primary btn-sm" routerLink="/login">
                Connexion
              </a>
              <a class="btn btn-primary btn-sm" routerLink="/register">
                Inscription
              </a>
            </div>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-modern {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .navbar-brand {
      font-weight: 700;
      font-size: 1.5rem;
      color: white !important;
    }

    .nav-link {
      color: rgba(255, 255, 255, 0.9) !important;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .nav-link:hover,
    .nav-link.active {
      color: white !important;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 0.375rem;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .dropdown-toggle {
      color: white !important;
      text-decoration: none;
    }

    .dropdown-toggle::after {
      margin-left: 0.5rem;
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;
  unreadCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      console.log(user);
      this.currentUser = user;
      this.isAdmin = user?.role === 'admin';
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
