import {Component, Input, OnInit, OnDestroy, inject, DestroyRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CommentService } from '../../../core/services/comment.service';
import { SocketService } from '../../../core/services/socket.service';
import { Comment, CommentCreateRequest } from '../../../core/models/comment.model';
import { User } from '../../../core/models/user.model';
import {CommentItemComponent} from './comment-item/comment-item.component';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CommentItemComponent],
  template: `
    <div class="comments-section">
      <!-- En-tête -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="mb-0">
          Commentaires
          <span class="badge bg-primary ms-2">{{ comments.length }}</span>
        </h5>

        @if (currentUser) {
          <button
            class="btn btn-outline-primary btn-sm"
            (click)="showCommentForm = !showCommentForm">
            <i class="bi bi-chat me-1"></i>
            Ajouter un commentaire
          </button>
        }
      </div>

      <!-- Formulaire de commentaire principal -->
      @if (showCommentForm && currentUser) {
        <div class="card card-modern mb-4">
          <div class="card-body">
            <form [formGroup]="commentForm" (ngSubmit)="submitComment()">
              <div class="mb-3">
                <textarea
                  class="form-control"
                  formControlName="content"
                  rows="3"
                  placeholder="Partagez vos pensées..."
                  [class.is-invalid]="commentForm.get('content')?.invalid && commentForm.get('content')?.touched">
                </textarea>

                @if (commentForm.get('content')?.invalid && commentForm.get('content')?.touched) {
                  <div class="invalid-feedback">
                    Le commentaire ne peut pas être vide
                  </div>
                }
              </div>

              <div class="d-flex justify-content-between align-items-center">
                <div class="text-muted small">
                  {{ commentForm.get('content')?.value?.length || 0 }}/1000 caractères
                </div>
                <div class="d-flex gap-2">
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    (click)="cancelComment()">
                    Annuler
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary btn-sm"
                    [disabled]="commentForm.invalid || loading">

                    @if (loading) {
                      <span class="spinner-border spinner-border-sm me-1"></span>
                    }
                    Commenter
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Liste des commentaires -->
      <div class="comments-list">
        @for (comment of comments; track comment._id) {
          <div class="comment mb-3">
            <app-comment-item
              [comment]="comment"
              [currentUser]="currentUser"
              [articleId]="articleId"
              (reply)="onReply($event)"
              (edit)="onEdit($event)"
              (delete)="onDelete($event)"
              (like)="onLike($event)">
            </app-comment-item>
          </div>
        }

        <!-- État vide -->
        @if (comments.length === 0) {
          <div class="text-center py-5 text-muted">
            <i class="bi bi-chat-dots display-1"></i>
            <p class="mt-3 fs-5">Aucun commentaire pour le moment</p>
            <p>Soyez le premier à partager votre avis !</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .comments-section {
      max-height: 600px;
      overflow-y: auto;
    }

    .comments-list {
      padding-right: 10px;
    }

    .comments-list::-webkit-scrollbar {
      width: 6px;
    }

    .comments-list::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .comments-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 10px;
    }
  `]
})

export class CommentsComponent implements OnInit, OnDestroy {
  @Input() articleId!: string;

  comments: Comment[] = [];
  currentUser: User | null = null;
  showCommentForm = false;
  loading = false;
  replyingTo: string | null = null;
  commentForm!: FormGroup;
  private destroyRef = inject(DestroyRef);
  private socketService = inject(SocketService);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private commentService: CommentService
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  ngOnInit() {
    console.log('🚀 Initialisation CommentsComponent pour article:', this.articleId);

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('👤 Utilisateur actuel:', user?.email);

      // Se connecter seulement si l'utilisateur est authentifié
      if (user) {
        this.initializeSocketConnection();
      }
    });

    this.loadComments();

    // Nettoyage automatique avec DestroyRef
    this.destroyRef.onDestroy(() => {
      console.log('🧹 Nettoyage automatique CommentsComponent');
      this.cleanup();
    });
  }

  loadComments() {
    console.log('📥 Chargement des commentaires pour article:', this.articleId);

    this.commentService.getArticleComments(this.articleId).subscribe({
      next: (result) => {
        console.log('✅ Commentaires chargés:', result.data.comments?.length || 0);
        this.comments = result.data.comments || [];
      },
      error: (error) => {
        console.error('❌ Erreur chargement commentaires:', error);
      }
    });
  }

  ngOnDestroy() {
    console.log('🧹 ngOnDestroy CommentsComponent');
    this.cleanup();
  }

  private cleanup() {
    this.socketService.leaveArticleRoom(this.articleId);
    this.socketService.disconnect();
  }

  private initializeSocketConnection() {
    console.log('🔌 Étape 1: Début initialisation WebSocket');
    console.log('🔌 État initial WebSocket:', this.socketService.connected);

    // D'abord configurer les listeners
    this.setupSocketListeners();
    console.log('🔌 Étape 2: Listeners configurés');

    // Puis se connecter
    this.socketService.connect();
    console.log('🔌 Étape 3: Connect() appelé');
  }

  setupSocketListeners() {
    console.log('👂 Configuration des écouteurs WebSocket...');

    // Écouter la connexion
    this.socketService.onConnect(() => {
      console.log('🎉 ✅ CONNECTÉ AU SERVEUR WEBSOCKET!');
      // Rejoindre la room une fois connecté
      this.socketService.joinArticleRoom(this.articleId);
      console.log(`📖 Rejoint la room: ${this.articleId}`);
    });

    // Écouter les nouveaux commentaires
    this.socketService.onNewComment((comment: Comment) => {
      this.handleNewComment(comment);
    });

    // Écouter les erreurs
    this.socketService.onError((error) => {
      console.error('❌ ERREUR WEBSOCKET:', error);
    });

    console.log('👂 Écouteurs WebSocket configurés');
  }

  private handleNewComment(comment: Comment) {
    console.log('🎉 📨 NOUVEAU COMMENTAIRE REÇU VIA WEBSOCKET:', comment);
    console.log('🎉 Contenu:', comment.content);
    console.log('🎉 Article du commentaire:', comment.article);
    console.log('🎉 Notre articleId:', this.articleId);

    // Vérifier si c'est pour le bon article
    if (comment.article !== this.articleId) {
      console.log('📭 Commentaire ignoré - mauvais article');
      return;
    }

    if (comment.parentComment) {
      console.log('🔄 C\'est une réponse au commentaire:', comment.parentComment);
      this.addReplyToComment(comment.parentComment, comment);
    } else {
      console.log('✅ C\'est un commentaire principal - ajout à la liste');
      console.log('✅ Avant ajout - Nombre de commentaires:', this.comments.length);

      // Vérifier si le commentaire n'existe pas déjà
      const existingComment = this.comments.find(c => c._id === comment._id);
      if (!existingComment) {
        this.comments = [comment, ...this.comments];
        console.log('✅ Après ajout - Nombre de commentaires:', this.comments.length);

        // Forcer la détection de changement
        setTimeout(() => {
          this.comments = [...this.comments];
        }, 50);
      } else {
        console.log('⚠️ Commentaire déjà présent dans la liste');
      }
    }
  }

  async submitComment() {
    console.log('═══════════════════════════════════════');
    console.log('1. 🚀 DÉBUT submitComment');
    console.log('═══════════════════════════════════════');

    if (this.commentForm.valid) {
      console.log('2. ✅ Formulaire valide');
      this.loading = true;

      const commentData: CommentCreateRequest = {
        content: this.commentForm.value.content!,
        article: this.articleId,
        parentComment: this.replyingTo || undefined
      };

      console.log('3. 📝 Données du commentaire:', commentData);
      console.log('4. 🔌 État WebSocket:', this.socketService.connected);

      try {
        console.log('5. 📤 Appel à sendComment...');

        // Ajouter un timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout: serveur ne répond pas')), 5000)
        );

        const sendPromise = this.socketService.sendComment(commentData);
        const result = await Promise.race([sendPromise, timeoutPromise]) as 'websocket' | 'http';

        console.log('6. ✅ sendComment a retourné:', result);

        // Réinitialiser le formulaire
        this.commentForm.reset();
        this.showCommentForm = false;
        this.replyingTo = null;
        this.loadComments();
        console.log('7. 🧹 Formulaire réinitialisé');

      } catch (error: any) {
        console.error('8. ❌ Erreur dans submitComment:', error.message);

        // Fallback vers HTTP
        this.fallbackToHttpComment(commentData);
      } finally {
        this.loading = false;
        console.log('9. 🔄 Loading désactivé');
      }
    } else {
      console.log('❌ Formulaire invalide');
      this.commentForm.markAllAsTouched();
    }
  }

  private fallbackToHttpComment(commentData: CommentCreateRequest) {
    console.log('🔄 Utilisation du fallback HTTP...');
    this.commentService.createComment(commentData).subscribe({
      next: (comment) => {
        console.log('✅ Commentaire créé via HTTP:', comment);
        // Ajouter manuellement le commentaire à la liste
        this.comments = [comment, ...this.comments];
        this.commentForm.reset();
        this.showCommentForm = false;
        this.replyingTo = null;
      },
      error: (error) => {
        console.error('❌ Erreur création commentaire HTTP:', error);
        alert('Erreur lors de la création du commentaire: ' + error.message);
      }
    });
  }

  cancelComment() {
    this.commentForm.reset();
    this.showCommentForm = false;
    this.replyingTo = null;
  }

  onReply(commentId: string) {
    this.replyingTo = commentId;
    this.showCommentForm = true;
  }

  onEdit(comment: Comment) {
    // Implémenter l'édition
    console.log('Edit comment:', comment);
  }

  onDelete(commentId: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      this.socketService.deleteComment(commentId);
    }
  }

  onLike(commentId: string) {
    this.socketService.likeComment(commentId);
  }

  private addReplyToComment(parentCommentId: string, reply: Comment) {
    console.log('🔍 Recherche du commentaire parent:', parentCommentId);

    const parentComment = this.findCommentById(this.comments, parentCommentId);
    if (parentComment) {
      console.log('✅ Commentaire parent trouvé, ajout de la réponse');

      // S'assurer que replies existe
      if (!parentComment.replies) {
        parentComment.replies = [];
      }

      // Vérifier si la réponse n'existe pas déjà
      const existingReply = parentComment.replies.find(r => r._id === reply._id);
      if (!existingReply) {
        parentComment.replies.push(reply);
        console.log('✅ Réponse ajoutée avec succès');

        // Forcer la détection de changement
        this.comments = [...this.comments];
      } else {
        console.log('⚠️ Réponse déjà présente');
      }
    } else {
      console.error('❌ Commentaire parent non trouvé:', parentCommentId);

      // Fallback: si le parent n'est pas trouvé, recharger tous les commentaires
      setTimeout(() => {
        this.loadComments();
      }, 1000);
    }
  }

  private updateCommentInList(updatedComment: Comment) {
    const comment = this.findCommentById(this.comments, updatedComment._id);
    if (comment) {
      Object.assign(comment, updatedComment);
      // Forcer la détection de changement
      this.comments = [...this.comments];
    }
  }

  private removeCommentFromList(commentId: string) {
    this.comments = this.removeCommentById(this.comments, commentId);
  }

  private findCommentById(comments: Comment[], id: string): Comment | null {
    console.log(`🔍 Recherche du commentaire ${id} parmi ${comments.length} commentaires`);

    for (const comment of comments) {
      console.log(`   - Vérification commentaire ${comment._id}`);

      if (comment._id === id) {
        console.log(`   ✅ Commentaire trouvé: ${comment._id}`);
        return comment;
      }

      if (comment.replies && comment.replies.length > 0) {
        console.log(`   🔍 Recherche dans les réponses de ${comment._id}`);
        const found = this.findCommentById(comment.replies, id);
        if (found) {
          console.log(`   ✅ Commentaire trouvé dans les réponses`);
          return found;
        }
      }
    }

    console.log(`   ❌ Commentaire ${id} non trouvé`);
    return null;
  }

  private removeCommentById(comments: Comment[], id: string): Comment[] {
    return comments.filter(comment => {
      if (comment._id === id) return false;
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = this.removeCommentById(comment.replies, id);
      }
      return true;
    });
  }


}
