// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { NotificationService, AppNotification } from '../../../core/services/notification.service';
//
// @Component({
//   selector: 'app-notifications',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="notifications-container">
//       @for (notification of notifications; track notification.id) {
//         <div
//           class="notification alert alert-dismissible fade show"
//           [ngClass]="{
//             'alert-success': notification.type === 'success',
//             'alert-danger': notification.type === 'error',
//             'alert-info': notification.type === 'info',
//             'alert-warning': notification.type === 'warning'
//           }"
//           role="alert">
//
//           <div class="d-flex align-items-center">
//             <i class="bi me-2" [ngClass]="{
//               'bi-check-circle': notification.type === 'success',
//               'bi-exclamation-circle': notification.type === 'error',
//               'bi-info-circle': notification.type === 'info',
//               'bi-exclamation-triangle': notification.type === 'warning'
//             }"></i>
//
//             <div class="flex-grow-1">
//               <strong class="me-2">{{ notification.title }}</strong>
//               {{ notification.message }}
//
//               @if (notification.action) {
//                 <button
//                   class="btn btn-link btn-sm p-0 ms-2"
//                   (click)="notification.action!.callback()">
//                   {{ notification.action.label }}
//                 </button>
//               }
//             </div>
//
//             <button
//               type="button"
//               class="btn-close"
//               (click)="remove(notification.id)">
//             </button>
//           </div>
//         </div>
//       }
//     </div>
//   `,
//   styles: [`
//     .notifications-container {
//       position: fixed;
//       top: 20px;
//       right: 20px;
//       z-index: 9999;
//       max-width: 400px;
//     }
//
//     .notification {
//       margin-bottom: 10px;
//       box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//       border: none;
//       border-radius: 8px;
//     }
//   `]
// })
// export class NotificationsComponent {
//   notifications: AppNotification[] = [];
//
//   constructor(private notificationService: NotificationService) {
//     this.notificationService.notifications$.subscribe(notifications => {
//       this.notifications = notifications;
//     });
//   }
//
//   remove(notificationId: string) {
//     this.notificationService.remove(notificationId);
//   }
// }
