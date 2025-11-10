import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import {Article, ArticlesResponse} from '../../../core/models/article.model';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5">
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="fw-bold">Articles</h1>
          <p class="text-muted">Découvrez tous nos articles</p>
        </div>
      </div>

      <div class="row g-4">
        @for (article of articles; track article._id) {
          <div class="col-md-6 col-lg-4">
            <div class="card card-modern h-100">
              <div class="card-body">
                <h5 class="card-title fw-bold">{{ article.title }}</h5>
                <p class="card-text text-muted">
                  {{ article.excerpt || (article.content | slice:0:150) + '...' }}
                </p>

                <div class="d-flex justify-content-between align-items-center mt-auto">
                  <small class="text-muted">
                    Par {{ article.author }}
                  </small>
                  <small class="text-muted">
                    {{ article.createdAt | date:'dd/MM/yyyy' }}
                  </small>
                </div>

                <div class="mt-3">
                  <a [routerLink]="['/articles', article._id]"
                     class="btn btn-primary btn-sm w-100 btn-modern">
                    Lire l'article
                  </a>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      @if (loading) {
        <div class="text-center mt-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
      }

      @if (!loading && articles.length === 0) {
        <div class="text-center py-5">
          <i class="bi bi-journal-x display-1 text-muted"></i>
          <h4 class="mt-3 text-muted">Aucun article disponible</h4>
        </div>
      }
    </div>
  `
})
export class ArticleListComponent implements OnInit {
  articles: Article[] = [];
  loading = true;
  pagination: any;
  isLoading = true;

  constructor(private articleService: ArticleService) {}

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    console.log(this.articles)
    // article-list.component.ts
// Corrigez la ligne 80 :
    this.articleService.getArticles().subscribe({
      next: (response: ArticlesResponse) => { // Utilisez 'response'
        this.articles = response.data.articles;
        this.pagination = response.data.pagination;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading articles:', error);
        this.isLoading = false;
      }
    });
  }
}
