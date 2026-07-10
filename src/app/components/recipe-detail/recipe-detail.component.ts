import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [],
  template: `
    <div class="overlay" (click)="close.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-top-actions">
          <button class="close-btn" (click)="close.emit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-image">
          <img [src]="recipe.image" [alt]="recipe.name" (error)="onImgError($event)" />
          <div class="image-badges">
            @for (tag of recipe.tags; track tag) {
              <span class="badge">{{ tag }}</span>
            }
          </div>
        </div>
        <div class="modal-content">
          <div class="title-row">
            <h2>{{ recipe.name }}</h2>
            <button class="edit-btn" (click)="edit.emit(recipe)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
          </div>
          <div class="stats">
            <div class="stat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <div>
                <span class="stat-value">{{ recipe.cookingTime }}</span>
                <span class="stat-label">minutes</span>
              </div>
            </div>
            <div class="stat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
              <div>
                <span class="stat-value">{{ recipe.calories }}</span>
                <span class="stat-label">kcal</span>
              </div>
            </div>
            <div class="stat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
              <div>
                <span class="stat-value">{{ recipe.servings }}</span>
                <span class="stat-label">servings</span>
              </div>
            </div>
          </div>

          <section class="section">
            <h3>Ingredients</h3>
            <ul class="ingredients-list">
              @for (ing of recipe.ingredients; track ing.name) {
                <li>
                  <span class="ing-amount">{{ ing.amount }} {{ ing.unit }}</span>
                  <span class="ing-name">{{ ing.name }}</span>
                </li>
              }
            </ul>
          </section>

          <section class="section">
            <h3>Instructions</h3>
            <p class="instructions">{{ recipe.instructions }}</p>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 200;
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
      backdrop-filter: blur(3px);
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    .modal {
      background: #fff;
      border-radius: 20px;
      width: 100%;
      max-width: 620px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      animation: slideUp 0.25s ease;
    }
    @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
    .modal-top-actions {
      position: absolute; top: 12px; right: 12px; z-index: 1;
    }
    .close-btn {
      background: rgba(255,255,255,0.9); border: none; border-radius: 50%;
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #444; transition: background 0.2s;
    }
    .close-btn:hover { background: #f0f0f0; }
    .modal-image { position: relative; height: 250px; }
    .modal-image img { width: 100%; height: 100%; object-fit: cover; border-radius: 20px 20px 0 0; }
    .image-badges {
      position: absolute; bottom: 12px; left: 14px;
      display: flex; gap: 6px; flex-wrap: wrap;
    }
    .badge {
      background: rgba(255,255,255,0.92); color: #2d7d46;
      font-size: 0.7rem; font-weight: 600;
      padding: 3px 10px; border-radius: 20px; text-transform: uppercase;
    }
    .modal-content { padding: 1.5rem; }
    .title-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.1rem; }
    h2 { font-size: 1.4rem; font-weight: 700; color: #1a1a1a; margin: 0; }
    .edit-btn {
      display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0;
      background: #f0f9f3; color: #2d7d46;
      border: 1.5px solid #c8e6c9; border-radius: 10px;
      padding: 0.45rem 1rem; font-size: 0.85rem; font-weight: 600;
      cursor: pointer; transition: all 0.18s; font-family: inherit;
    }
    .edit-btn:hover { background: #e0f2e8; border-color: #2d7d46; }
    .stats {
      display: flex; gap: 1.5rem;
      background: #f8fdf9; border-radius: 12px;
      padding: 1rem 1.2rem; margin-bottom: 1.5rem;
    }
    .stat { display: flex; align-items: center; gap: 0.6rem; color: #2d7d46; }
    .stat div { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.1rem; font-weight: 700; color: #1a1a1a; line-height: 1; }
    .stat-label { font-size: 0.72rem; color: #888; }
    .section { margin-bottom: 1.4rem; }
    h3 { font-size: 0.95rem; font-weight: 700; color: #2d7d46; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 0.7rem; }
    .ingredients-list {
      list-style: none; padding: 0; margin: 0;
      display: flex; flex-direction: column; gap: 0.4rem;
    }
    .ingredients-list li {
      display: flex; gap: 0.7rem; align-items: baseline;
      padding: 0.4rem 0; border-bottom: 1px solid #f0f0f0;
    }
    .ing-amount { font-size: 0.85rem; color: #2d7d46; font-weight: 600; min-width: 80px; }
    .ing-name { font-size: 0.9rem; color: #333; }
    .instructions { font-size: 0.9rem; color: #444; line-height: 1.7; }
  `]
})
export class RecipeDetailComponent {
  @Input() recipe!: Recipe;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Recipe>();

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80';
  }
}
