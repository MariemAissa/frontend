import {Component, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ArticleService } from '../../core/services/article.service';
import { User } from '../../core/models/user.model';
import { Article } from '../../core/models/article.model';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

// Import Bootstrap
declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5">
      <!-- En-tête du Dashboard -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="fw-bold text-dark mb-2">Tableau de bord</h1>
              <p class="text-muted mb-0">Bienvenue, {{ currentUser?.profile?.firstName || currentUser?.username }} !</p>
            </div>
            <button class="btn btn-primary btn-modern" routerLink="/article/create">
              <i class="bi bi-plus-circle me-2"></i>
              Nouvel article
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="row">
          <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="mt-3 text-muted">Chargement de vos données...</p>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (error && !isLoading) {
        <div class="row mb-4">
          <div class="col-12">
            <div class="alert alert-danger alert-modern d-flex align-items-center">
              <i class="bi bi-exclamation-triangle me-3 fs-5"></i>
              <div class="flex-grow-1">
                {{ error }}
              </div>
              <button class="btn btn-sm btn-outline-danger" (click)="retryLoading()">
                Réessayer
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Content -->
      @if (!isLoading && !error) {
        <!-- Statistiques -->
        <div class="row mb-5">
          <div class="col-xl-3 col-md-6 mb-4">
            <div class="stat-card stat-card-primary">
              <div class="stat-icon">
                <i class="bi bi-journal-text"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.totalArticles }}</div>
                <div class="stat-label">Total Articles</div>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-md-6 mb-4">
            <div class="stat-card stat-card-success">
              <div class="stat-icon">
                <i class="bi bi-check-circle"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.publishedArticles }}</div>
                <div class="stat-label">Publiés</div>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-md-6 mb-4">
            <div class="stat-card stat-card-warning">
              <div class="stat-icon">
                <i class="bi bi-pencil-square"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.draftArticles }}</div>
                <div class="stat-label">Brouillons</div>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-md-6 mb-4">
            <div class="stat-card stat-card-info">
              <div class="stat-icon">
                <i class="bi bi-eye"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.totalViews }}</div>
                <div class="stat-label">Vues Totales</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Articles récents -->
        <div class="row">
          <div class="col-12">
            <div class="card card-modern border-0 shadow-sm">
              <div class="card-header bg-transparent border-0 py-4">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="mb-0 text-dark fw-semibold">
                    <i class="bi bi-clock-history me-2 text-primary"></i>
                    Mes articles récents
                  </h5>
                  <a routerLink="/my-articles" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-list-ul me-1"></i>
                    Voir tout
                  </a>
                </div>
              </div>
              <div class="card-body p-0">
                @if (recentArticles.length > 0) {
                  <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                      <thead class="table-light">
                        <tr>
                          <th scope="col" class="ps-4 fw-semibold text-dark">Titre</th>
                          <th scope="col" class="fw-semibold text-dark">Statut</th>
                          <th scope="col" class="fw-semibold text-dark">Date</th>
                          <th scope="col" class="fw-semibold text-dark">Vues</th>
                          <th scope="col" class="text-end pe-4 fw-semibold text-dark">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (article of recentArticles; track article._id; let i = $index) {
                          <tr [class.bg-light]="i % 2 === 0">
                            <td class="ps-4">
                              <div class="d-flex align-items-center">
                                <div class="article-avatar bg-primary bg-opacity-10 text-primary rounded me-3">
                                  <i class="bi bi-file-text"></i>
                                </div>
                                <div>
                                  <strong class="text-dark d-block">{{ article.title }}</strong>
                                  <small class="text-muted">Créé le {{ formatDate(article.createdAt) }}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              @if (article.status === 'published') {
                                <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                                  <i class="bi bi-check-circle me-1"></i>
                                  Publié
                                </span>
                              } @else {
                                <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
                                  <i class="bi bi-pencil me-1"></i>
                                  Brouillon
                                </span>
                              }
                            </td>
                            <td class="text-muted">{{ formatDate(article.createdAt) }}</td>
                            <td>
                              <span class="d-flex align-items-center text-muted">
                                <i class="bi bi-eye me-1"></i>
                                {{ article.viewCount || 0 }}
                              </span>
                            </td>
                            <td class="text-end pe-4">
                              <div class="btn-group btn-group-sm">
                                <a
                                  [routerLink]="['/articles/edit', article._id]"
                                  class="btn btn-outline-primary btn-action"
                                  title="Modifier">
                                  <i class="bi bi-pencil"></i>
                                </a>
                                <a
                                  [routerLink]="['/articles', article._id]"
                                  class="btn btn-outline-secondary btn-action"
                                  title="Voir">
                                  <i class="bi bi-eye"></i>
                                </a>
                                <button
                                  class="btn btn-outline-danger btn-action"
                                  title="Supprimer"
                                  (click)="openDeleteModal(article)">
                                  <i class="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <div class="text-center py-5">
                    <div class="empty-state-icon mb-3">
                      <i class="bi bi-journal-plus text-muted"></i>
                    </div>
                    <h5 class="text-muted mb-2">Aucun article trouvé</h5>
                    <p class="text-muted mb-4">Commencez par créer votre premier article pour partager vos idées</p>
                    <button class="btn btn-primary btn-modern" routerLink="/article/create">
                      <i class="bi bi-plus-circle me-2"></i>
                      Créer mon premier article
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Modal de confirmation de suppression -->
      <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-gradient-danger text-white">
              <div class="d-flex align-items-center">
                <i class="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
                <h5 class="modal-title fw-bold" id="deleteModalLabel">Confirmation de suppression</h5>
              </div>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <div class="text-center mb-3">
                <i class="bi bi-trash3 text-danger fs-1"></i>
              </div>
              <p class="text-center mb-0" id="deleteModalMessage">
                Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
              </p>
            </div>
            <div class="modal-footer border-0 justify-content-center">
              <button type="button" class="btn btn-outline-secondary btn-modern" data-bs-dismiss="modal">
                <i class="bi bi-x-circle me-2"></i>Annuler
              </button>
              <button type="button" class="btn btn-danger btn-modern" (click)="confirmDelete()">
                <i class="bi bi-trash3 me-2"></i>Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    }

    .stat-card-primary {
      border-left: 4px solid #007bff;
    }

    .stat-card-success {
      border-left: 4px solid #28a745;
    }

    .stat-card-warning {
      border-left: 4px solid #ffc107;
    }

    .stat-card-info {
      border-left: 4px solid #17a2b8;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-card-primary .stat-icon {
      background: rgba(0, 123, 255, 0.1);
      color: #007bff;
    }

    .stat-card-success .stat-icon {
      background: rgba(40, 167, 69, 0.1);
      color: #28a745;
    }

    .stat-card-warning .stat-icon {
      background: rgba(255, 193, 7, 0.1);
      color: #ffc107;
    }

    .stat-card-info .stat-icon {
      background: rgba(23, 162, 184, 0.1);
      color: #17a2b8;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .stat-card-primary .stat-number { color: #007bff; }
    .stat-card-success .stat-number { color: #28a745; }
    .stat-card-warning .stat-number { color: #ffc107; }
    .stat-card-info .stat-number { color: #17a2b8; }

    .stat-label {
      color: #6c757d;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }

    .alert-modern {
      border: none;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      background: rgba(220, 53, 69, 0.05);
      border-left: 4px solid #dc3545;
    }

    .card-modern {
      border-radius: 16px;
      overflow: hidden;
    }

    .btn-modern {
      border-radius: 10px;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-action {
      border-radius: 8px;
      padding: 0.375rem 0.75rem;
      transition: all 0.2s ease;
    }

    .btn-action:hover {
      transform: translateY(-1px);
    }

    .article-avatar {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .empty-state-icon {
      font-size: 4rem;
      opacity: 0.5;
    }

    .table > :not(caption) > * > * {
      padding: 1rem 0.75rem;
    }

    .bg-light {
      background-color: rgba(0, 0, 0, 0.02) !important;
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  currentUser: User | null = null;
  recentArticles: Article[] = [];
  stats = {
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0
  };

  isLoading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  // Variables pour la gestion du modal
  private articleToDelete: Article | null = null;
  private deleteModal: any;

  constructor(
    private authService: AuthService,
    private articleService: ArticleService
  ) {}

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadDashboardData();
        }
      });
  }

  ngAfterViewInit() {
    // Initialiser le modal après que la vue soit rendue
    this.initializeModal();
  }

  private initializeModal() {
    const modalElement = document.getElementById('deleteModal');
    if (modalElement) {
      this.deleteModal = new bootstrap.Modal(modalElement);
    }
  }

  loadDashboardData() {
    this.isLoading = true;
    this.error = null;

    this.articleService.getUserArticles()
      .pipe(
        catchError(error => {
          console.error('Error loading articles:', error);
          this.error = 'Erreur lors du chargement des articles';
          return of();
        }),
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(articles => {
        // FIXED: Directly use the articles array (no .data property)
        this.recentArticles = articles.data.articles.slice(0, 5);
        this.calculateStats(articles.data.articles);
      });
  }

  calculateStats(articles: Article[]) {
    this.stats = {
      totalArticles: articles.length,
      publishedArticles: articles.filter(a => a.status === 'published').length,
      draftArticles: articles.filter(a => a.status === 'draft').length,
      totalViews: articles.reduce((sum, article) => sum + (article.viewCount || 0), 0)
    };
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  }

  deleteArticle(article: Article) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${article.title}" ?`)) {
      this.articleService.deleteArticle(article._id).subscribe({
        next: () => {
          this.loadDashboardData(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting article:', error);
          this.error = 'Erreur lors de la suppression de l\'article';
        }
      });
    }
  }

  retryLoading() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Ouvrir le modal de confirmation
  openDeleteModal(article: Article) {
    this.articleToDelete = article;

    // Mettre à jour le message du modal
    const messageElement = document.getElementById('deleteModalMessage');
    if (messageElement && article) {
      messageElement.innerHTML = `
        Êtes-vous sûr de vouloir supprimer <strong>"${article.title}"</strong> ?<br>
        <span class="text-danger small mt-2 d-block">Cette action est irréversible et ne peut pas être annulée.</span>
      `;
    }

    // Afficher le modal
    if (this.deleteModal) {
      this.deleteModal.show();
    }
  }

  // Méthode pour afficher un message de succès (optionnel)
  private showSuccessMessage(message: string) {
    // Vous pouvez implémenter un toast ou une notification ici
    console.log(message);

    // Exemple simple avec un alert temporaire
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
      <i class="bi bi-check-circle-fill me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);

    // Supprimer automatiquement après 3 secondes
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 3000);
  }

  // Confirmer la suppression
  confirmDelete() {
    if (!this.articleToDelete) return;

    this.articleService.deleteArticle(this.articleToDelete._id).subscribe({
      next: () => {
        // Fermer le modal
        if (this.deleteModal) {
          this.deleteModal.hide();
        }

        // Réinitialiser l'article à supprimer
        this.articleToDelete = null;

        // Recharger les données
        this.loadDashboardData();

        // Optionnel : Afficher un message de succès
        this.showSuccessMessage('Article supprimé avec succès');
      },
      error: (error) => {
        console.error('Error deleting article:', error);
        this.error = 'Erreur lors de la suppression de l\'article';

        // Fermer le modal en cas d'erreur
        if (this.deleteModal) {
          this.deleteModal.hide();
        }
      }
    });
  }

}
