import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { SocketService } from './socket.service';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  readAt?: string;
  createdAt: string;
  isRecent?: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      hasMore: boolean;
    }
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  unreadPercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private socketService = inject(SocketService);
  private apiUrl = 'http://localhost:5005/api/notifications';

  // Observable pour les notifications en temps réel
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  // Observable pour les stats
  private statsSubject = new BehaviorSubject<NotificationStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  constructor() {
    this.setupSocketListeners();
  }

  // Configurer les écouteurs Socket.io
  private setupSocketListeners(): void {
    this.socketService.onNotification((notification: Notification) => {
      console.log('🔔 Nouvelle notification reçue:', notification);
      this.addNotification(notification);
      this.updateStats();
    });

    this.socketService.onNotificationUpdated((data: any) => {
      console.log('📱 Notification mise à jour:', data);
      this.updateNotification(data);
    });
  }

  // Rejoindre les rooms de notifications
  joinNotificationRoom(userId: string): void {
    this.socketService.joinNotificationRoom(userId);
  }

  // Quitter les rooms de notifications
  leaveNotificationRoom(userId: string): void {
    this.socketService.leaveNotificationRoom(userId);
  }

  // Récupérer les notifications
  getNotifications(page: number = 1, limit: number = 20): Observable<NotificationsResponse> {
    return this.http.get<NotificationsResponse>(
      `${this.apiUrl}?page=${page}&limit=${limit}`
    );
  }

  // Récupérer les statistiques
  getStats(): Observable<{ success: boolean; data: NotificationStats }> {
    return this.http.get<{ success: boolean; data: NotificationStats }>(
      `${this.apiUrl}/stats`
    );
  }

  // Marquer comme lu
  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${notificationId}/read`,
      {}
    );
  }

  // Marquer toutes comme lues
  markAllAsRead(): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/read-all`,
      {}
    );
  }

  // Supprimer une notification
  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${notificationId}`
    );
  }

  // Méthodes pour gérer l'état local
  private addNotification(notification: Notification): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
  }

  private updateNotification(updatedNotification: any): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(notif =>
      notif._id === updatedNotification._id ? updatedNotification : notif
    );
    this.notificationsSubject.next(updated);
  }

  private async updateStats(): Promise<void> {
    try {
      const stats = await this.getStats().toPromise();
      if (stats?.success) {
        this.statsSubject.next(stats.data);
      }
    } catch (error) {
      console.error('Erreur mise à jour stats:', error);
    }
  }

  // Initialiser les données
  async initialize(userId: string): Promise<void> {
    this.joinNotificationRoom(userId);

    try {
      const [notifications, stats] = await Promise.all([
        this.getNotifications().toPromise(),
        this.getStats().toPromise()
      ]);

      if (notifications?.success) {
        this.notificationsSubject.next(notifications.data.notifications);
      }

      if (stats?.success) {
        this.statsSubject.next(stats.data);
      }
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
    }
  }
}
