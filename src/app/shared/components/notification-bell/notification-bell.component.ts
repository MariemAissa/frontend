import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NotificationService} from '../../../core/services/notification.service';
import {AuthService} from '../../../core/services/auth.service';


@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-bell dropdown">
      <button class="btn btn-link text-dark position-relative"
              data-bs-toggle="dropdown">
        <i class="bi bi-bell fs-5"></i>

        <!-- Badge pour les notifications non lues -->
        @if (unreadCount > 0) {
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </span>
        }
      </button>

      <div class="dropdown-menu dropdown-menu-end p-3" style="min-width: 350px; max-height: 500px; overflow-y: auto;">
        <!-- En-tête -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="mb-0">Notifications</h6>
          @if (unreadCount > 0) {
            <button class="btn btn-sm btn-outline-primary" (click)="markAllAsRead()">
              Tout marquer comme lu
            </button>
          }
        </div>

        <!-- Liste des notifications -->
        <div class="notifications-list">
          @for (notification of notifications; track notification._id) {
            <div class="notification-item border-bottom pb-2 mb-2"
                 [class.unread]="!notification.read"
                 (click)="onNotificationClick(notification)">

              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <h6 class="mb-1 small fw-bold">{{ notification.title }}</h6>
                  <p class="mb-1 small text-muted">{{ notification.message }}</p>
                  <small class="text-muted">
                    {{ notification.createdAt | date:'dd/MM/yyyy HH:mm' }}
                  </small>
                </div>

                <!-- Indicateur non lu -->
                @if (!notification.read) {
                  <span class="badge bg-primary ms-2">●</span>
                }
              </div>

              <!-- Actions -->
              <div class="mt-2 d-flex gap-2">
                @if (!notification.read) {
                  <button class="btn btn-sm btn-outline-success"
                          (click)="markAsRead(notification._id); $event.stopPropagation()">
                    Marquer lu
                  </button>
                }
                <button class="btn btn-sm btn-outline-danger"
                        (click)="deleteNotification(notification._id); $event.stopPropagation()">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          }

          <!-- État vide -->
          @if (notifications.length === 0) {
            <div class="text-center text-muted py-4">
              <i class="bi bi-bell-slash display-6"></i>
              <p class="mt-2 mb-0">Aucune notification</p>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="text-center mt-3">
          <a routerLink="/notifications" class="btn btn-sm btn-outline-primary">
            Voir toutes les notifications
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-item {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .notification-item:hover {
      background-color: #f8f9fa;
    }

    .notification-item.unread {
      background-color: #e7f3ff;
      border-left: 3px solid #007bff;
      padding-left: 10px;
    }

    .notifications-list {
      max-height: 300px;
      overflow-y: auto;
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  notifications: any[] = [];
  unreadCount = 0;

  ngOnInit() {
    // S'abonner aux notifications
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications.slice(0, 5); // 5 dernières
      this.unreadCount = notifications.filter(n => !n.read).length;
    });

    // S'abonner aux stats
    this.notificationService.stats$.subscribe(stats => {
      if (stats) {
        this.unreadCount = stats.unread;
      }
    });

    // Initialiser avec l'ID utilisateur
    // const user = this.authService.currentUser;
    // if (user) {
    //   this.notificationService.initialize(user._id);
    // }
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => console.log('Notification marquée comme lue'),
      error: (error) => console.error('Erreur:', error)
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => console.log('Toutes les notifications marquées comme lues'),
      error: (error) => console.error('Erreur:', error)
    });
  }

  deleteNotification(notificationId: string): void {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => console.log('Notification supprimée'),
      error: (error) => console.error('Erreur:', error)
    });
  }

  onNotificationClick(notification: Notification): void {
    // Naviguer vers l'article ou effectuer une action
    if (notification.data?.articleId) {
      // this.router.navigate(['/articles', notification.data.articleId]);
    }

    // Marquer comme lu si ce n'est pas déjà fait
    // if (!notification.read) {
    //   this.markAsRead(notification._id);
    // }
  }

  ngOnDestroy() {
    // const user = this.authService.currentUser;
    // if (user) {
    //   this.notificationService.leaveNotificationRoom(user._id);
    // }
  }
}
