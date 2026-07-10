import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [],
  template: `
    <div class="card" (click)="view.emit(recipe)">
      <div class="card-image">
        <img [src]="recipe.image" [alt]="recipe.name" loading="lazy" (error)="onImgError($event)" />
        <div class="card-badges">
          @for (tag of recipe.tags.slice(0,2); track tag) {
            <span class="badge">{{ tag }}</span>
          }
        </div>
        <div class="card-actions">
          <button
            class="action-btn week-btn"
            [class.active]="isSelectedForWeek"
            (click)="$event.stopPropagation(); toggleWeekSelect.emit(recipe.id)"
            [title]="isSelectedForWeek ? 'Remove from this week' : 'Add to this week'"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" [attr.stroke]="isSelectedForWeek ? '#fff' : 'currentColor'" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              @if (isSelectedForWeek) {
                <polyline points="9 15 11 17 15 13"/>
              }
            </svg>
          </button>
          <button
            class="action-btn fav-btn"
            [class.active]="isFavourite"
            (click)="$event.stopPropagation(); toggleFavourite.emit(recipe.id)"
            [title]="isFavourite ? 'Remove from favourites' : 'Add to favourites'"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" [attr.fill]="isFavourite ? '#2d7d46' : 'none'" [attr.stroke]="isFavourite ? '#2d7d46' : 'currentColor'" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title">{{ recipe.name }}</h3>
        <div class="card-meta">
          <span class="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ recipe.cookingTime }} min
          </span>
          <span class="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
            {{ recipe.calories }} kcal
          </span>
          <span class="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            {{ recipe.servings }} servings
          </span>
        </div>
        <div class="card-ingredients">
          {{ recipe.ingredients.length }} ingredients
        </div>
      </div>
      <button class="delete-btn" (click)="$event.stopPropagation(); delete.emit(recipe.id)" title="Delete recipe">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .card {
      position: relative; background: #fff; border-radius: 16px; overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07); cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s; border: 1px solid #f0f0f0;
    }
    .card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(45,125,70,0.12); }
    .card-image { position: relative; height: 200px; overflow: hidden; }
    .card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .card:hover .card-image img { transform: scale(1.04); }
    .card-badges { position: absolute; top: 10px; left: 10px; display: flex; gap: 6px; }
    .badge {
      background: rgba(255,255,255,0.92); color: #2d7d46;
      font-size: 0.7rem; font-weight: 600; padding: 3px 8px;
      border-radius: 20px; text-transform: uppercase; letter-spacing: 0.3px;
    }
    .card-actions {
      position: absolute; top: 10px; right: 10px;
      display: flex; gap: 6px;
      opacity: 0; transition: opacity 0.2s;
    }
    .card:hover .card-actions { opacity: 1; }
    .action-btn {
      background: rgba(255,255,255,0.92); border: none; border-radius: 8px;
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #555; transition: all 0.15s;
    }
    .action-btn:hover { transform: scale(1.1); }
    .week-btn.active { background: #2d7d46; color: #fff; opacity: 1; }
    .fav-btn.active { background: rgba(255,255,255,0.95); opacity: 1; }
    .card-actions .week-btn.active,
    .card-actions .fav-btn.active { opacity: 1; }
    .card-body { padding: 1rem 1.1rem 1.1rem; }
    .card-title { font-size: 1rem; font-weight: 700; color: #1a1a1a; margin: 0 0 0.6rem; line-height: 1.3; }
    .card-meta { display: flex; gap: 0.9rem; margin-bottom: 0.5rem; }
    .meta-item { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: #666; }
    .meta-item svg { color: #2d7d46; }
    .card-ingredients { font-size: 0.78rem; color: #999; }
    .delete-btn {
      position: absolute; bottom: 10px; right: 10px;
      background: rgba(255,255,255,0.9); border: none; border-radius: 8px;
      padding: 6px; cursor: pointer; color: #e53935;
      opacity: 0; transition: opacity 0.2s; display: flex; align-items: center;
    }
    .card:hover .delete-btn { opacity: 1; }

    /* Always show active action buttons even without hover */
    .week-btn.active, .fav-btn.active { opacity: 1 !important; }
  `]
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  @Input() isSelectedForWeek = false;
  @Input() isFavourite = false;
  @Output() view = new EventEmitter<Recipe>();
  @Output() delete = new EventEmitter<string>();
  @Output() toggleWeekSelect = new EventEmitter<string>();
  @Output() toggleFavourite = new EventEmitter<string>();

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80';
  }
}
