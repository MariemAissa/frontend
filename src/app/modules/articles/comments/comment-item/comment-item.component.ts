import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comment } from '../../../../core/models/comment.model';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-comment-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="comment-item" [class.reply]="isReply">
      <div class="d-flex gap-3">
        <!-- Avatar -->
<!--        <img-->
<!--          [src]="comment.author.profile.avatar || '/assets/default-avatar.png'"-->
<!--          class="avatar"-->
<!--          [alt]="comment.author.username">-->

        <!-- Contenu -->
        <div class="flex-grow-1">
          <!-- En-tête -->
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
<!--              <strong class="me-2">-->
<!--                {{ comment.author.profile.firstName }} {{ comment.author.profile.lastName }}-->
<!--              </strong>-->
<!--              <small class="text-muted">{{ comment.author.username }}</small>-->
              <small class="text-muted ms-2">
                {{ comment.createdAt | date:'dd/MM/yyyy à HH:mm' }}
              </small>
              @if (comment.isEdited) {
                <small class="text-muted ms-2">(modifié)</small>
              }
            </div>

            <!-- Menu actions -->
            @if (canModify) {
              <div class="dropdown">
                <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                  <i class="bi bi-three-dots"></i>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <button class="dropdown-item" (click)="onEdit()">
                      <i class="bi bi-pencil me-2"></i>
                      Modifier
                    </button>
                  </li>
                  <li>
                    <button class="dropdown-item text-danger" (click)="onDelete()">
                      <i class="bi bi-trash me-2"></i>
                      Supprimer
                    </button>
                  </li>
                </ul>
              </div>
            }
          </div>

          <!-- Contenu du commentaire -->
          <div class="comment-content mb-2">
            <p class="mb-0">{{ comment.content }}</p>
          </div>

          <!-- Actions -->
          <div class="comment-actions d-flex gap-3">
            <button
              class="btn btn-link text-muted p-0 text-decoration-none"
              (click)="onLike()">

              <i class="bi"
                 [class.bi-heart]="!isLiked"
                 [class.bi-heart-fill]="isLiked"
                 [class.text-danger]="isLiked"></i>
              <span class="ms-1">{{ comment.likes.length }}</span>
            </button>

            @if (currentUser && !isReply) {
              <button
                class="btn btn-link text-muted p-0 text-decoration-none"
                (click)="onReply()">
                <i class="bi bi-reply me-1"></i>
                Répondre
              </button>
            }
          </div>

          <!-- Réponses -->
          @if (comment.replies && comment.replies.length > 0) {
            <div class="replies mt-3">
              @for (reply of comment.replies; track reply._id) {
                <app-comment-item
                  [comment]="reply"
                  [currentUser]="currentUser"
                  [articleId]="articleId"
                  [isReply]="true"
                  (reply)="onReplyEvent($event)"
                  (edit)="onEditEvent($event)"
                  (delete)="onDeleteEvent($event)"
                  (like)="onLikeEvent($event)">
                </app-comment-item>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .comment-item {
      padding: 1rem;
      border-radius: 12px;
      background: #f8f9fa;
      border-left: 4px solid #007bff;
    }

    .comment-item.reply {
      background: #f1f3f4;
      border-left-color: #6c757d;
      margin-left: 2rem;
    }

    .comment-content {
      line-height: 1.6;
    }

    .comment-actions button {
      font-size: 0.875rem;
    }

    .comment-actions button:hover {
      transform: translateY(-1px);
    }

    .replies {
      border-left: 2px solid #dee2e6;
      padding-left: 1rem;
    }
  `]
})
export class CommentItemComponent {
  @Input() comment!: Comment;
  @Input() currentUser: User | null = null;
  @Input() articleId!: string;
  @Input() isReply = false;

  @Output() reply = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Comment>();
  @Output() delete = new EventEmitter<string>();
  @Output() like = new EventEmitter<string>();

  get canModify(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser._id === this.comment.author._id ||
      this.currentUser.role === 'admin' ||
      this.currentUser.role === 'editor';
  }

  get isLiked(): boolean {
    if (!this.currentUser) return false;
    return this.comment.likes.includes(this.currentUser._id);
  }

  onReply(): void {
    this.reply.emit(this.comment._id);
  }

  onEdit(): void {
    this.edit.emit(this.comment);
  }

  onDelete(): void {
    this.delete.emit(this.comment._id);
  }

  onLike(): void {
    this.like.emit(this.comment._id);
  }

  // Méthodes pour gérer les événements des réponses
  onReplyEvent(commentId: string): void {
    this.reply.emit(commentId);
  }

  onEditEvent(comment: Comment): void {
    this.edit.emit(comment);
  }

  onDeleteEvent(commentId: string): void {
    this.delete.emit(commentId);
  }

  onLikeEvent(commentId: string): void {
    this.like.emit(commentId);
  }
}
