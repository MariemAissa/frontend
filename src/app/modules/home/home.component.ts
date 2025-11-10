import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import {Article, ArticlesResponse} from '../../core/models/article.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Section -->
    <section class="hero-section py-5">
      <div class="container">
        <div class="row align-items-center min-vh-50">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-4">
              Bienvenue sur
              <span class="text-gradient">BlogSphere</span>
            </h1>
            <p class="lead text-muted mb-4">
              Découvrez, partagez et collaborez sur des articles passionnants.
              Rejoignez notre communauté de rédacteurs et lecteurs passionnés.
            </p>
            <div class="d-flex gap-3 flex-wrap">
              <button class="btn btn-primary btn-lg btn-modern" routerLink="/articles">
                <i class="bi bi-journal-text me-2"></i>
                Explorer les articles
              </button>

              @if (!currentUser) {
                <button class="btn btn-outline-primary btn-lg" routerLink="/register">
                  Commencer à écrire
                </button>
              }
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-image">
              <img src="/assets/hero-blog.svg" alt="Blog Illustration" class="img-fluid">
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Articles -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="row mb-5">
          <div class="col-12 text-center">
            <h2 class="fw-bold">Articles Populaires</h2>
            <p class="text-muted">Découvrez les articles les plus appréciés</p>
          </div>
        </div>

        <div class="row g-4">
          @for (article of featuredArticles; track article._id) {
            <div class="col-md-6 col-lg-4">
              <div class="card card-modern h-100 fade-in">
                <div class="card-img-top-container">
                  <img [src]="article.featuredImage || '/assets/default-article.jpg'"
                       class="card-img-top" [alt]="article.title">
                  <div class="card-badge">
                    <span class="badge badge-modern bg-primary">
                      {{ article.tags[0] || 'Général' }}
                    </span>
                  </div>
                </div>

                <div class="card-body d-flex flex-column">
                  <h5 class="card-title fw-bold">{{ article.title }}</h5>
                  <p class="card-text text-muted flex-grow-1">
                    {{ article.excerpt || (article.content | slice:0:120) + '...' }}
                  </p>

                  <div class="d-flex justify-content-between align-items-center mt-auto">
                    <div class="d-flex align-items-center">
                      <img [src]="article.author.profile.avatar || '/assets/default-avatar.png'"
                           class="avatar me-2" [alt]="article.author.username">
                      <small class="text-muted">{{ article.author.profile.firstName }}</small>
                    </div>
                    <small class="text-muted">
                      {{ article.createdAt | date:'dd/MM/yyyy' }}
                    </small>
                  </div>

                  <div class="mt-3">
                    <a [routerLink]="['/articles', article.slug]"
                       class="btn btn-primary btn-sm w-100 btn-modern">
                      Lire l'article
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Loading State -->
        @if (loading) {
          <div class="text-center mt-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
        }

        <!-- Empty State -->
        @if (!loading && featuredArticles.length === 0) {
          <div class="text-center py-5">
            <i class="bi bi-journal-x display-1 text-muted"></i>
            <h4 class="mt-3 text-muted">Aucun article disponible</h4>
            <p class="text-muted">Soyez le premier à publier un article !</p>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      position: relative;
      overflow: hidden;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('/assets/pattern.svg');
      opacity: 0.1;
    }

    .hero-section .container {
      position: relative;
      z-index: 2;
    }

    .text-gradient {
      background: linear-gradient(45deg, #f093fb, #f5576c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .min-vh-50 {
      min-height: 50vh;
    }

    .hero-image img {
      filter: drop-shadow(0 20px 40px rgba(0,0,0,0.1));
    }

    .card-img-top-container {
      position: relative;
      overflow: hidden;
    }

    .card-img-top {
      height: 200px;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .card-modern:hover .card-img-top {
      transform: scale(1.05);
    }

    .card-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }
  `]
})
export class HomeComponent implements OnInit {
  featuredArticles: Article[] = [];
  loading = true;
  currentUser = null;

  constructor(private articleService: ArticleService) {}

  ngOnInit() {
    this.loadFeaturedArticles();
  }

  loadFeaturedArticles() {
    this.articleService.getArticles({ limit: 6, sort: '-viewCount' }).subscribe({
      next: (articles) => {
        this.featuredArticles = articles.data.articles;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
