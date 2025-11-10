import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-dark text-light py-4 mt-5">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <h5>Blog plateform</h5>
            <p class="mb-0">Made with love.</p>
          </div>
          <div class="col-md-6 text-md-end">
            <p class="mb-0">&copy; 2025. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
