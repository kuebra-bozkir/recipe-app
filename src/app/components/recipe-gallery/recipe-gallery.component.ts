import { Component, signal, computed } from '@angular/core';
import { RecipeService } from '../../services/recipe.service';
import { MealPlanService } from '../../services/meal-plan.service';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { RecipeDetailComponent } from '../recipe-detail/recipe-detail.component';
import { AddRecipeComponent } from '../add-recipe/add-recipe.component';
import { Recipe } from '../../models/recipe.model';

const FILTERS = ['all', 'breakfast', 'lunch', 'dinner', 'snacks'] as const;
type FilterKey = typeof FILTERS[number];

@Component({
  selector: 'app-recipe-gallery',
  standalone: true,
  imports: [RecipeCardComponent, RecipeDetailComponent, AddRecipeComponent],
  template: `
    <div class="gallery-page">
      <div class="page-header">
        <div>
          <h1>My Recipes</h1>
          <p class="subtitle">{{ recipeService.recipes().length }} recipes saved</p>
        </div>
        <div class="header-right">
          @if (weekCount() > 0) {
            <span class="week-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {{ weekCount() }} selected for this week
            </span>
          }
          <button class="add-btn" (click)="editingRecipe.set(null); showAddModal.set(true)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Recipe
          </button>
        </div>
      </div>

      <!-- Meal type filter tabs -->
      <div class="filter-tabs">
        @for (f of FILTERS; track f) {
          <button
            class="filter-tab"
            [class.active]="activeFilter() === f"
            (click)="activeFilter.set(f)"
          >{{ f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) }}</button>
        }
      </div>

      @if (recipeService.recipes().length > 0) {
        @if (filteredFavourites().length > 0) {
          <div class="section-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#2d7d46" stroke="#2d7d46" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            Favourites
          </div>
          <div class="gallery">
            @for (recipe of filteredFavourites(); track recipe.id) {
              <app-recipe-card
                [recipe]="recipe"
                [isSelectedForWeek]="mealPlanService.isSelectedForWeek(recipe.id)"
                [isFavourite]="true"
                (view)="selectedRecipe.set($event)"
                (delete)="deleteRecipe($event)"
                (toggleWeekSelect)="mealPlanService.toggleWeekSelection($event)"
                (toggleFavourite)="recipeService.toggleFavourite($event)"
              />
            }
          </div>
          @if (filteredNonFavourites().length > 0) {
            <div class="section-divider"></div>
            @if (activeFilter() === 'all') {
              <div class="section-label">All Recipes</div>
            }
          }
        }
        @if (filteredNonFavourites().length > 0) {
          <div class="gallery">
            @for (recipe of filteredNonFavourites(); track recipe.id) {
              <app-recipe-card
                [recipe]="recipe"
                [isSelectedForWeek]="mealPlanService.isSelectedForWeek(recipe.id)"
                [isFavourite]="false"
                (view)="selectedRecipe.set($event)"
                (delete)="deleteRecipe($event)"
                (toggleWeekSelect)="mealPlanService.toggleWeekSelection($event)"
                (toggleFavourite)="recipeService.toggleFavourite($event)"
              />
            }
          </div>
        } @else if (activeFilter() !== 'all' && filteredFavourites().length === 0) {
          <div class="filter-empty">No {{ activeFilter() }} recipes yet.</div>
        }
      } @else {
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#c8e6c9" stroke-width="1.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M12 8v8M8 12h8"/>
          </svg>
          <h3>No recipes yet</h3>
          <p>Add your first recipe to get started!</p>
          <button class="add-btn" (click)="editingRecipe.set(null); showAddModal.set(true)">Add Recipe</button>
        </div>
      }
    </div>

    @if (selectedRecipe()) {
      <app-recipe-detail
        [recipe]="selectedRecipe()!"
        (close)="selectedRecipe.set(null)"
        (edit)="startEdit($event)"
      />
    }

    @if (showAddModal()) {
      <app-add-recipe
        [editRecipe]="editingRecipe()"
        (close)="closeModal()"
        (save)="addRecipe($event)"
        (update)="updateRecipe($event)"
      />
    }
  `,
  styles: [`
    .filter-tabs {
      display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;
    }
    .filter-tab {
      padding: 6px 16px; border-radius: 20px; border: 1.5px solid #e0ece3;
      background: #fff; color: #555; font-size: 0.85rem; font-weight: 600;
      cursor: pointer; transition: all 0.18s; font-family: inherit;
    }
    .filter-tab:hover { border-color: #2d7d46; color: #2d7d46; }
    .filter-tab.active { background: #2d7d46; border-color: #2d7d46; color: #fff; }
    .filter-empty { color: #bbb; font-size: 0.9rem; padding: 2rem 0; }
    .gallery-page { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }
    .page-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;
    }
    h1 { font-size: 1.9rem; font-weight: 800; color: #1a1a1a; margin: 0 0 0.2rem; }
    .subtitle { color: #888; font-size: 0.9rem; margin: 0; }
    .header-right { display: flex; align-items: center; gap: 0.8rem; }
    .week-pill {
      display: flex; align-items: center; gap: 0.4rem;
      background: #e8f5e9; color: #2d7d46;
      font-size: 0.82rem; font-weight: 600;
      padding: 6px 12px; border-radius: 20px;
    }
    .add-btn {
      display: flex; align-items: center; gap: 0.5rem;
      background: #2d7d46; color: #fff; border: none; border-radius: 12px;
      padding: 0.65rem 1.3rem; font-size: 0.9rem; font-weight: 600;
      cursor: pointer; transition: background 0.2s, transform 0.1s; font-family: inherit;
    }
    .add-btn:hover { background: #245f37; transform: translateY(-1px); }
    .gallery {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.4rem;
    }
    .section-label {
      display: flex; align-items: center; gap: 0.4rem;
      font-size: 0.8rem; font-weight: 700; color: #555;
      text-transform: uppercase; letter-spacing: 0.5px;
      margin-bottom: 1rem;
    }
    .section-divider {
      height: 1px; background: #f0f0f0; margin: 2rem 0 1.5rem;
    }
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 4rem 2rem; color: #bbb; gap: 0.5rem;
    }
    .empty-state h3 { color: #aaa; font-size: 1.2rem; margin: 0.5rem 0 0; }
    .empty-state p { color: #bbb; font-size: 0.9rem; margin: 0 0 1rem; }
  `]
})
export class RecipeGalleryComponent {
  readonly FILTERS = FILTERS;

  selectedRecipe = signal<Recipe | null>(null);
  showAddModal = signal(false);
  editingRecipe = signal<Recipe | null>(null);
  activeFilter = signal<FilterKey>('all');

  constructor(
    public recipeService: RecipeService,
    public mealPlanService: MealPlanService,
  ) {}

  startEdit(recipe: Recipe) {
    this.selectedRecipe.set(null);
    this.editingRecipe.set(recipe);
    this.showAddModal.set(true);
  }

  closeModal() {
    this.showAddModal.set(false);
    this.editingRecipe.set(null);
  }

  updateRecipe(recipe: Recipe) {
    const { id, createdAt, ...data } = recipe;
    this.recipeService.update(id, data);
    this.closeModal();
  }

  weekCount() {
    return this.mealPlanService.weekSelectionIds().size;
  }

  favouriteRecipes() {
    return this.recipeService.recipes().filter(r => r.favourite);
  }

  filteredFavourites() {
    const f = this.activeFilter();
    return this.recipeService.recipes().filter(r =>
      r.favourite && (f === 'all' || r.tags.some(t => t.toLowerCase() === f))
    );
  }

  filteredNonFavourites() {
    const f = this.activeFilter();
    return this.recipeService.recipes().filter(r =>
      !r.favourite && (f === 'all' || r.tags.some(t => t.toLowerCase() === f))
    );
  }

  deleteRecipe(id: string) {
    if (confirm('Delete this recipe?')) {
      this.recipeService.delete(id);
    }
  }

  addRecipe(data: Omit<Recipe, 'id' | 'createdAt'>) {
    this.recipeService.add(data);
    this.showAddModal.set(false);
  }
}
