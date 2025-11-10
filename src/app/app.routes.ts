import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./modules/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./modules/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'articles',
    loadComponent: () => import('./modules/articles/article-list/article-list.component').then(m => m.ArticleListComponent)
  },
  {
    path: 'articles/:slug',
    loadComponent: () => import('./modules/articles/article-detail/article-detail.component').then(m => m.ArticleDetailComponent)
  },

  // Protected routes
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashbaord/dashbaord.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./modules/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'article/create',
    loadComponent: () => import('./modules/articles/article-form/article-form.component').then(m => m.ArticleFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'articles/edit/:id',
    loadComponent: () => import('./modules/articles/article-form/article-form.component').then(m => m.ArticleFormComponent),
    canActivate: [AuthGuard]
  },

  // Admin routes
  {
    path: 'admin',
    loadComponent: () => import('./modules/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./modules/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
