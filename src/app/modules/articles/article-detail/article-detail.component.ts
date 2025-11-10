import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { AuthService } from '../../../core/services/auth.service';
import { SocketService } from '../../../core/services/socket.service';
import {Article, ArticleByIdResponse, ArticleResponse, ArticlesResponse} from '../../../core/models/article.model';
import { User } from '../../../core/models/user.model';
import { CommentsComponent } from '../comments/comments.component';
import { FormatContentPipe } from '../../../shared/pipes/format-content.pipe';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CommentsComponent, FormatContentPipe],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Bouton retour -->
          <div class="mb-4">
            <button class="btn btn-outline-secondary btn-sm" (click)="goBack()">
              <i class="bi bi-arrow-left me-1"></i>
              Retour aux articles
            </button>
          </div>

          <!-- Loading State -->
          @if (loading) {
            <div class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
              <p class="mt-3 text-muted">Chargement de l'article...</p>
            </div>
          }

          <!-- Error State -->
          @if (error && !loading) {
            <div class="alert alert-danger text-center">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ error }}
            </div>
          }

          <!-- Article Content -->
          @if (article && !loading) {
            <!-- Article Header -->
            <article class="card card-modern mb-4">
              <div class="card-body">
                <!-- Tags -->
                @if (article.tags && article.tags.length > 0) {
                  <div class="mb-3">
                    @for (tag of article.tags; track tag) {
                      <span class="badge bg-primary me-2 mb-2">{{ tag }}</span>
                    }
                  </div>
                }

                <!-- Titre -->
                <h1 class="display-5 fw-bold mb-4 text-dark">{{ article.title }}</h1>

                <!-- Meta informations -->
                <div class="d-flex align-items-center mb-4">
<!--                  <img-->
<!--                    [src]= "'/assets/icons8-user-default-64.png'"-->
<!--                    class="avatar me-3"-->
<!--                    [alt]="article.author.username">-->
                  <div class="flex-grow-1">
                    <div class="fw-bold fs-6">
<!--                      {{ article.author.profile.firstName }} {{ article.author.profile.lastName }}-->
                    </div>
                    <div class="text-muted small">
                      <span>Publié le {{ article.createdAt | date:'dd MMMM yyyy' }}</span>
                      <span class="mx-2">•</span>
                      <span>{{ article.viewCount || 0 }} vue(s)</span>
                      <span class="mx-2">•</span>
                      <span>{{ article.likes || 0 }} like(s)</span>
                    </div>
                  </div>

                  <!-- Actions rapides -->
                  <div class="d-flex gap-2">
                    dfdsd
                    <button
                      class="btn btn-outline-primary btn-sm"
                      (click)="likeArticle()"
                      [disabled]="!currentUser">
                      <i class="bi"
                         [class.bi-heart]="!isLiked"
                         [class.bi-heart-fill]="isLiked"
                         [class.text-danger]="isLiked"></i>
                      {{ article.likes || 0 }}
                    </button>


                    @if (canEdit) {
                      <a
                        [routerLink]="['/articles/edit', article._id]"
                        class="btn btn-primary btn-sm">
                        <i class="bi bi-pencil me-1"></i>
                        Modifier
                      </a>
                    }
                  </div>
                </div>

                <!-- Image featured -->
                @if (article.featuredImage) {
                  <div class="mb-4 text-center">
                    <img
                      [src]="article.featuredImage"
                      [alt]="article.title"
                      class="img-fluid rounded-3 shadow-sm"
                      style="max-height: 400px; object-fit: cover; width: 100%;">
                  </div>
                }

                <!-- Extrait -->
                @if (article.excerpt) {
                  <div class="mb-4">
                    <p class="lead text-muted fs-5 fst-italic border-start border-3 border-primary ps-3 py-2">
                      {{ article.excerpt }}
                    </p>
                  </div>
                }

                <!-- Contenu -->
                <div class="article-content mb-4">
                  <div [innerHTML]="(article.content || '') | formatContent" class="fs-6 lh-base"></div>
                </div>

                <!-- Footer de l'article -->
                <div class="d-flex justify-content-between align-items-center mt-5 pt-4 border-top">
                  <div class="d-flex gap-3">
<!--                    <button-->
<!--                      class="btn btn-outline-primary btn-sm"-->
<!--                      (click)="likeArticle()"-->
<!--                      [disabled]="!currentUser">-->
<!--                      <i class="bi"-->
<!--                         [class.bi-heart]="!isLiked"-->
<!--                         [class.bi-heart-fill]="isLiked"-->
<!--                         [class.text-danger]="isLiked"></i>-->
<!--                      J'aime ({{ article.likeCount || 0 }})-->
<!--                    </button>-->


                    <button class="btn btn-outline-secondary btn-sm" (click)="scrollToComments()">
                      <i class="bi bi-chat me-1"></i>
                      Commenter
                    </button>
                  </div>

                  <div class="text-muted small">
                    Dernière modification : {{ article.updatedAt | date:'dd/MM/yyyy à HH:mm' }}
                  </div>
                </div>
              </div>
            </article>

            <!-- Section commentaires -->
            <div class="card card-modern" id="comments-section">
              <div class="card-header bg-transparent">
                <h5 class="mb-0 d-flex align-items-center">
                  <i class="bi bi-chat-text me-2"></i>
                  Commentaires
                  <span class="badge bg-primary ms-2">{{ getTotalComments() }}</span>
                </h5>
              </div>
              <div class="card-body p-0">
                <app-comments [articleId]="article._id"></app-comments>
              </div>
            </div>

            <!-- Articles similaires -->
            @if (relatedArticles.length > 0) {
              <div class="mt-5">
                <h4 class="fw-bold mb-4">Articles similaires</h4>
                <div class="row g-4">
                  @for (relatedArticle of relatedArticles; track relatedArticle._id) {
                    <div class="col-md-6">
                      <div class="card card-modern h-100">
                        <div class="card-body">
                          <h6 class="card-title fw-bold">{{ relatedArticle.title }}</h6>
                          <p class="card-text text-muted small">
                            {{ relatedArticle.excerpt || (relatedArticle.content | slice:0:100) + '...' }}
                          </p>
                          <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
<!--                              Par {{ relatedArticle.author.profile.firstName }}-->
                            </small>
                            <a [routerLink]="['/articles', relatedArticle.slug]"
                               class="btn btn-primary btn-sm">
                              Lire
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .article-content {
      line-height: 1.8;
      font-size: 1.1rem;
    }

    .article-content p {
      margin-bottom: 1.5rem;
    }

    .article-content h2, .article-content h3 {
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    .article-content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 1.5rem 0;
    }

    .article-content blockquote {
      border-left: 4px solid var(--secondary-color);
      padding-left: 1.5rem;
      margin: 1.5rem 0;
      font-style: italic;
      color: var(--text-secondary);
    }

    .article-content code {
      background: #f8f9fa;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.9em;
    }

    .article-content pre {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.5rem 0;
    }

    .article-content ul, .article-content ol {
      margin-bottom: 1.5rem;
      padding-left: 2rem;
    }

    .article-content li {
      margin-bottom: 0.5rem;
    }
  `]
})
export class ArticleDetailComponent implements OnInit, OnDestroy {
  article: Article | null = null;
  currentUser: User | null = null;
  relatedArticles: Article[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private authService: AuthService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    console.log(this.route.snapshot.paramMap.get('slug'))
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadArticle(slug);
    } else {
      this.error = 'Article non trouvé';
      this.loading = false;
    }

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    if (this.article) {
      this.socketService.leaveArticleRoom(this.article._id);
    }
  }

  loadArticle(slug: string) {
    this.loading = true;
    this.error = '';

    this.articleService.getArticleById(slug).subscribe({
      next: (response: ArticleByIdResponse) => { // Utilisez 'response' au lieu de 'articles'
        this.article = response.data.article;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading article:', error);
        this.error = 'Erreur lors du chargement de l\'article';
        this.loading = false;
      }
    });

// Corrigez la ligne 343 :
    this.articleService.getArticles({ limit: 3 }).subscribe({
      next: (response: ArticlesResponse) => { // Utilisez 'response'
        this.relatedArticles = response.data.articles;
      },
      error: (error) => {
        console.error('Error loading related articles:', error);
      }
    });

    console.log("article", this.article);
  }

  private setupSocketConnection() {
    if (this.article) {
      this.socketService.connect();
      this.socketService.joinArticleRoom(this.article._id);
    }
  }

  private loadRelatedArticles() {
    if (!this.article) return;

    // Charger des articles similaires basés sur les tags
    this.articleService.getArticles().subscribe((articles: ArticlesResponse) => {
      this.relatedArticles = articles.data.articles
        .filter((article: Article) =>
          article._id !== this.article?._id
          // && article.tags.some((tag: string) => this.article?.tags?.includes(tag))
        )
        .slice(0, 2);
    });
  }

  likeArticle() {
    console.log("like article")
    if (!this.article || !this.currentUser) {
      // Rediriger vers login si pas connecté
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.articleService.likeArticle(this.article._id).subscribe({
      next: (response: ArticleResponse) => {
        // this.article.likes = response.data.article.likes;
        // this.isLiked = this.article.likes.includes(this.currentUser?._id || '');
      },
      error: (error) => {
        console.error('Error liking article:', error);
      }
    });
  }

  scrollToComments() {
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  goBack() {
    this.router.navigate(['/articles']);
  }

  get isLiked(): boolean {
    if (!this.article || !this.currentUser) return false;
    return true;
  //  return this.article.likes.includes(this.currentUser._id);
  }

  get canEdit(): boolean {
    if (!this.article || !this.currentUser) return false;

    return this.currentUser._id === this.article.author._id ||
      this.currentUser.role === 'admin' ||
      this.currentUser.role === 'editor';
  }

  getTotalComments(): number  {
    // if (!this.article?.comments) return 0;
    //
    // let total = this.article.comments.length;
    // this.article.comments.forEach(comment => {
    //   //total += comment.replies.length || 0;
    // });

     return 1;
  }
}
