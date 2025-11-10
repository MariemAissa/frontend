import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import {NotificationBellComponent} from './shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent, NotificationBellComponent],
  template: `
    <div class="app-container">
      <app-navbar *ngIf="showNavbar" />
      <main class="flex-grow-1">
        <router-outlet />
      </main>
      <app-footer *ngIf="showFooter" />
      <app-notification-bell />
    </div>
  `
})
export class AppComponent {
  showNavbar = true;
  showFooter = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showNavbar = !event.url.includes('/login') && !event.url.includes('/register');
        this.showFooter = !event.url.includes('/login') && !event.url.includes('/register');
      });
  }
}
