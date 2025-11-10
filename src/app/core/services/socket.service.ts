import { Injectable, inject, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Comment, CommentCreateRequest } from '../models/comment.model';
import {catchError, firstValueFrom} from 'rxjs';
import {CommentService} from './comment.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {
  private authService = inject(AuthService);
  private commentService = inject(CommentService);
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 2000;

  constructor() {

  }


  connect(): void {
    if (this.isConnected || this.socket) return;

    const token = this.authService.getToken();
    if (!token) {
      console.warn('No token available for WebSocket connection');
      return;
    }

    try {
      this.socket = io(environment.socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
        autoConnect: true
      });

      this.setupEventListeners();

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('✅ Connected to WebSocket server');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('❌ Disconnected from WebSocket:', reason);

      if (reason === 'io server disconnect') {
        // Le serveur a déconnecté, besoin de se reconnecter manuellement
        setTimeout(() => this.socket?.connect(), 1000);
      }
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      this.reconnectAttempts++;

      console.error(`❌ WebSocket connection error (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}):`, error.message);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('🚨 Maximum reconnection attempts reached');
        this.fallbackToPolling();
      }
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 WebSocket reconnection attempt ${attempt}`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🚨 WebSocket reconnection failed');
    });
  }

  private fallbackToPolling(): void {
    console.log('🔄 Falling back to polling transport');
    if (this.socket) {
      this.socket.disconnect();
      this.socket.io.opts.transports = ['polling'];
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket manually disconnected');
    }
  }

  // Vérifier l'état de connexion
  get connected(): boolean {
    return this.isConnected && this.socket?.connected || false;
  }

  // Reconnecter manuellement
  reconnect(): void {
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  // Commentaires
  joinArticleRoom(articleId: string): void {
    if (this.connected) {
      this.socket?.emit('join_article', articleId);
      console.log(`📖 Joined article room: ${articleId}`);
    } else {
      console.warn('Cannot join room - WebSocket not connected');
    }
  }

  leaveArticleRoom(articleId: string): void {
    this.socket?.emit('leave_article', articleId);
    console.log(`📖 Left article room: ${articleId}`);
  }

  onNewComment(callback: (comment: Comment) => void): void {
    this.socket?.on('new_comment', callback);
  }

  onCommentUpdated(callback: (comment: Comment) => void): void {
    this.socket?.on('comment_updated', callback);
  }

  onCommentDeleted(callback: (commentId: string) => void): void {
    this.socket?.on('comment_deleted', callback);
  }

  async sendComment(commentData: CommentCreateRequest): Promise<'websocket' | 'http'> {
    if (this.connected && this.socket) {
      // Retourner une Promise même pour WebSocket
      return new Promise<'websocket'>((resolve, reject) => {
        // Émettre l'événement avec un accusé de réception
        this.socket!.emit('create_comment', commentData, (response: { success: boolean; error?: string }) => {
          if (response.success) {
            resolve('websocket');
          } else {
            reject(new Error(response.error || 'Erreur lors de la création du commentaire'));
          }
        });
      });
    } else {
      console.warn('WebSocket non connecté, utilisation du fallback HTTP');
      try {
        const comment = await this.fallbackToHttpForComment(commentData);
        // Émettre un événement local pour simuler WebSocket
        this.socket?.emit('new_comment', comment);
        return 'http';
      } catch (error) {
        throw error; // Propager l'erreur
      }
    }
  }

  private async fallbackToHttpForComment(commentData: CommentCreateRequest): Promise<Comment | null> {
    try {
      console.log('🔄 Using HTTP fallback for comment creation');
      const comment = await firstValueFrom(
        this.commentService.createComment(commentData).pipe(
          catchError(error => {
            console.error('❌ HTTP fallback failed:', error);
            throw error;
          })
        )
      );

      console.log('✅ Comment created via HTTP fallback:', comment);
      return comment;

    } catch (error) {
      console.error('❌ Failed to create comment via HTTP fallback:', error);
      throw error; // Propager l'erreur pour la gérer dans le composant
    }
  }

  // Fallback pour likeComment
  async likeComment(commentId: string): Promise<Comment | null> {
    if (this.connected) {
      this.socket?.emit('like_comment', commentId);
      return null;
    } else {
      console.warn('Using HTTP fallback for comment like');
      try {
        return await firstValueFrom(this.commentService.likeComment(commentId));
      } catch (error) {
        console.error('HTTP fallback for like failed:', error);
        throw error;
      }
    }
  }

  // Fallback pour deleteComment
  async deleteComment(commentId: string): Promise<void> {
    if (this.connected) {
      this.socket?.emit('delete_comment', commentId);
    } else {
      console.warn('Using HTTP fallback for comment deletion');
      try {
        await firstValueFrom(this.commentService.deleteComment(commentId));
      } catch (error) {
        console.error('HTTP fallback for delete failed:', error);
        throw error;
      }
    }
  }

  // Notifications
  onNotification(callback: (notification: any) => void): void {
    this.socket?.on('new_notification', callback);
  }



  // Nettoyage
  ngOnDestroy(): void {
    this.disconnect();
  }

  // Supprimer les listeners spécifiques
  removeListener(event: string): void {
    this.socket?.removeAllListeners(event);
  }









  // Rejoindre la room des notifications utilisateur
  joinNotificationRoom(userId: string): void {
    if (this.connected && this.socket) {
      this.socket.emit('join_notifications', userId);
      console.log(`📱 Rejoint les notifications de l'utilisateur: ${userId}`);
    } else {
      console.warn('Cannot join notification room - WebSocket not connected');
    }
  }

  // Quitter la room des notifications
  leaveNotificationRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit('leave_notifications', userId);
      console.log(`📱 Quitté les notifications de l'utilisateur: ${userId}`);
    }
  }

  // Écouter les mises à jour de notifications (marquage comme lu, etc.)
  onNotificationUpdated(callback: (data: any) => void): void {
    this.socket?.on('notification_updated', callback);
  }

  // Marquer une notification comme lue via Socket.io
  markNotificationAsRead(notificationId: string, userId: string): void {
    if (this.connected && this.socket) {
      this.socket.emit('notification_read', {
        notificationId
      });
    }
  }













  // Méthode pour écouter la connexion
  onConnect(callback: () => void): void {
    this.socket?.on('connect', callback);
  }

  // Méthode pour écouter la déconnexion
  onDisconnect(callback: (reason: string) => void): void {
    this.socket?.on('disconnect', callback);
  }

  // Méthode pour écouter les erreurs de connexion
  onError(callback: (error: any) => void): void {
    this.socket?.on('error', callback);
    this.socket?.on('connect_error', callback);
  }

  // Méthode pour tester la connexion
  testPing(): void {
    if (this.connected) {
      this.socket?.emit('ping', { test: 'data' }, (response: any) => {
        console.log('🏓 Ping response:', response);
      });
    } else {
      console.warn('Cannot ping - WebSocket not connected');
    }
  }
}


// import { Injectable, inject } from '@angular/core';
// import { io, Socket } from 'socket.io-client';
// import { environment } from '../../../environments/environment';
// import { AuthService } from './auth.service';
// import { Comment, CommentCreateRequest } from '../models/comment.model';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class SocketService {
//   private authService = inject(AuthService);
//   private socket: Socket | null = null;
//   private isConnected = false;
//
//   connect(): void {
//     if (this.isConnected) return;
//
//     const token = this.authService.getToken();
//     if (!token) return;
//
//     this.socket = io(environment.socketUrl, {
//       auth: {
//         token: token
//       },
//       transports: ['websocket', 'polling']
//     });
//
//     this.socket.on('connect', () => {
//       this.isConnected = true;
//       console.log('Connected to WebSocket');
//     });
//
//     this.socket.on('disconnect', () => {
//       this.isConnected = false;
//       console.log('Disconnected from WebSocket');
//     });
//
//     this.socket.on('connect_error', (error) => {
//       console.error('WebSocket connection error:', error);
//     });
//   }
//
//   disconnect(): void {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//       this.isConnected = false;
//     }
//   }
//
//   // Commentaires
//   joinArticleRoom(articleId: string): void {
//     this.socket?.emit('join_article', articleId);
//   }
//
//   leaveArticleRoom(articleId: string): void {
//     this.socket?.emit('leave_article', articleId);
//   }
//
//   onNewComment(callback: (comment: Comment) => void): void {
//     this.socket?.on('new_comment', callback);
//   }
//
//   onCommentUpdated(callback: (comment: Comment) => void): void {
//     this.socket?.on('comment_updated', callback);
//   }
//
//   onCommentDeleted(callback: (commentId: string) => void): void {
//     this.socket?.on('comment_deleted', callback);
//   }
//
//   sendComment(commentData: CommentCreateRequest): void {
//     this.socket?.emit('create_comment', commentData);
//   }
//
//   likeComment(commentId: string): void {
//     this.socket?.emit('like_comment', commentId);
//   }
//
//   deleteComment(commentId: string): void {
//     this.socket?.emit('delete_comment', commentId);
//   }
//
//   // Notifications
//   onNotification(callback: (notification: any) => void): void {
//     this.socket?.on('new_notification', callback);
//   }
//
//   markNotificationAsRead(notificationId: string): void {
//     this.socket?.emit('mark_notification_read', notificationId);
//   }
// }
