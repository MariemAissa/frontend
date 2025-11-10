import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <!-- En-tête -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="h2 fw-bold">Administration</h1>
              <p class="text-muted mb-0">Gestion de la plateforme</p>
            </div>
            <div class="d-flex gap-2">
              <a routerLink="/admin/users" class="btn btn-outline-primary">
                <i class="bi bi-people me-1"></i>
                Gestion utilisateurs
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="row mb-4">
        <div class="col-xl-3 col-md-6">
          <div class="card stat-card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-0">{{ stats.totalUsers }}</h4>
                  <p class="mb-0">Utilisateurs</p>
                </div>
                <div class="align-self-center">
                  <i class="bi bi-people display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-md-6">
          <div class="card stat-card bg-success text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-0">{{ stats.totalArticles }}</h4>
                  <p class="mb-0">Articles</p>
                </div>
                <div class="align-self-center">
                  <i class="bi bi-journal-text display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-md-6">
          <div class="card stat-card bg-warning text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-0">{{ stats.totalComments }}</h4>
                  <p class="mb-0">Commentaires</p>
                </div>
                <div class="align-self-center">
                  <i class="bi bi-chat-dots display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-md-6">
          <div class="card stat-card bg-info text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-0">{{ stats.totalViews }}</h4>
                  <p class="mb-0">Vues totales</p>
                </div>
                <div class="align-self-center">
                  <i class="bi bi-eye display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Graphiques -->
      <div class="row mb-4">
        <div class="col-lg-8">
          <div class="card card-modern">
            <div class="card-header">
              <h5 class="mb-0">Activité récente</h5>
            </div>
            <div class="card-body">
              <canvas id="activityChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card card-modern">
            <div class="card-header">
              <h5 class="mb-0">Répartition des rôles</h5>
            </div>
            <div class="card-body">
              <canvas id="rolesChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Dernières activités -->
      <div class="row">
        <div class="col-12">
          <div class="card card-modern">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Activité récente</h5>
              <a href="#" class="btn btn-sm btn-outline-primary">Voir tout</a>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Action</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (activity of recentActivities; track activity.id) {
                      <tr>
                        <td>
                          <div class="d-flex align-items-center">
                            <img [src]="activity.user.avatar" class="avatar me-2">
                            <div>
                              <div class="fw-bold">{{ activity.user.name }}</div>
                              <small class="text-muted">{{ activity.user.username }}</small>
                            </div>
                          </div>
                        </td>
                        <td>{{ activity.action }}</td>
                        <td>{{ activity.date | date:'dd/MM/yyyy HH:mm' }}</td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-success': activity.status === 'success',
                            'bg-warning': activity.status === 'pending',
                            'bg-danger': activity.status === 'failed'
                          }">
                            {{ activity.status }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      border: none;
      border-radius: 12px;
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalUsers: 1542,
    totalArticles: 287,
    totalComments: 1245,
    totalViews: 45876
  };

  recentActivities = [
    {
      id: 1,
      user: {
        name: 'John Doe',
        username: 'johndoe',
        avatar: '/assets/default-avatar.png'
      },
      action: 'A publié un nouvel article',
      date: new Date(),
      status: 'success'
    },
    {
      id: 2,
      user: {
        name: 'Jane Smith',
        username: 'janesmith',
        avatar: '/assets/default-avatar.png'
      },
      action: 'A commenté un article',
      date: new Date(Date.now() - 1000 * 60 * 30),
      status: 'success'
    },
    {
      id: 3,
      user: {
        name: 'Bob Wilson',
        username: 'bobwilson',
        avatar: '/assets/default-avatar.png'
      },
      action: 'Tentative de connexion échouée',
      date: new Date(Date.now() - 1000 * 60 * 60),
      status: 'failed'
    }
  ];

  ngOnInit() {
    Chart.register(...registerables);
    this.initCharts();
  }

  initCharts() {
    // Graphique d'activité
    const activityCtx = document.getElementById('activityChart') as HTMLCanvasElement;
    new Chart(activityCtx, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [
          {
            label: 'Articles publiés',
            data: [12, 19, 8, 15, 12, 5, 9],
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Commentaires',
            data: [45, 52, 38, 61, 48, 32, 41],
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });

    // Graphique des rôles
    const rolesCtx = document.getElementById('rolesChart') as HTMLCanvasElement;
    new Chart(rolesCtx, {
      type: 'doughnut',
      data: {
        labels: ['Lecteurs', 'Rédacteurs', 'Éditeurs', 'Admins'],
        datasets: [{
          data: [1200, 250, 80, 12],
          backgroundColor: [
            '#6c757d',
            '#007bff',
            '#ffc107',
            '#dc3545'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}
