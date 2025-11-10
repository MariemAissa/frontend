import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <div class="input-group">
        <span class="input-group-text bg-light border-end-0">
          <i class="bi bi-search"></i>
        </span>
        <input
          type="text"
          class="form-control border-start-0"
          placeholder="Rechercher des articles..."
          [(ngModel)]="searchTerm"
          (input)="onSearch()">
        <button
          class="btn btn-outline-secondary"
          type="button"
          (click)="showFilters = !showFilters">
          <i class="bi bi-funnel"></i>
        </button>
      </div>

      <!-- Filtres avancés -->
      @if (showFilters) {
        <div class="filters-panel card mt-2">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">Tags</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Filtrer par tags..."
                  [(ngModel)]="filters.tags"
                  (input)="onFilterChange()">
              </div>
              <div class="col-md-4">
                <label class="form-label">Auteur</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Filtrer par auteur..."
                  [(ngModel)]="filters.author"
                  (input)="onFilterChange()">
              </div>
              <div class="col-md-4">
                <label class="form-label">Date</label>
                <select class="form-select" [(ngModel)]="filters.date" (change)="onFilterChange()">
                  <option value="">Toutes les dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-container {
      position: relative;
    }

    .filters-panel {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
  `]
})
export class SearchComponent {
  @Output() search = new EventEmitter<any>();

  searchTerm = '';
  showFilters = false;
  filters = {
    tags: '',
    author: '',
    date: ''
  };

  onSearch() {
    this.emitSearch();
  }

  onFilterChange() {
    this.emitSearch();
  }

  private emitSearch() {
    this.search.emit({
      search: this.searchTerm,
      filters: this.filters
    });
  }
}
