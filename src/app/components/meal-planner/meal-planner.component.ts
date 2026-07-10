import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { RecipeService } from '../../services/recipe.service';
import { MealPlanService } from '../../services/meal-plan.service';
import { Recipe, MealType, MEAL_TYPES } from '../../models/recipe.model';

interface DragData {
  recipe: Recipe;
  fromDay: string | null;
  fromMealType: MealType | null;
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

@Component({
  selector: 'app-meal-planner',
  standalone: true,
  imports: [RouterLink, DragDropModule],
  template: `
    <div class="planner-page">
      <div class="page-header">
        <div>
          <h1>Weekly Meal Planner</h1>
          <p class="subtitle">Drag a recipe into any slot, or click an empty slot to pick one</p>
        </div>
        <div class="header-actions">
          <span class="assigned-count">{{ mealPlanService.assignedCount() }} / 28 slots filled</span>
          <button class="reset-btn" (click)="resetPlan()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.6"/>
            </svg>
            Reset
          </button>
        </div>
      </div>

      <!-- Rows = meal types, cols = days -->
      <div class="grid-scroll">
        <div class="planner-grid">
          <!-- Header row: empty corner + 7 day labels -->
          <div class="corner-cell"></div>
          @for (dayPlan of mealPlanService.mealPlan(); track dayPlan.day) {
            <div class="day-header-cell">{{ dayPlan.day.slice(0, 3) }}</div>
          }

          <!-- One row per meal type -->
          @for (mealType of MEAL_TYPES; track mealType) {
            <div class="meal-label-cell">{{ MEAL_LABELS[mealType] }}</div>
            @for (dayPlan of mealPlanService.mealPlan(); track dayPlan.day) {
              <div
                cdkDropList
                [id]="dayPlan.day + '-' + mealType"
                [cdkDropListConnectedTo]="allDropIds()"
                (cdkDropListDropped)="onDropToSlot($event, dayPlan.day, mealType)"
                class="slot-cell"
                [class.filled]="dayPlan.meals[mealType]"
                (click)="!dayPlan.meals[mealType] && openPicker(dayPlan.day, mealType)"
              >
                @if (dayPlan.meals[mealType]; as recipe) {
                  <div
                    class="slot-content"
                    cdkDrag
                    [cdkDragData]="{ recipe: recipe, fromDay: dayPlan.day, fromMealType: mealType }"
                  >
                    <div *cdkDragPreview class="drag-preview">
                      <img [src]="recipe.image" (error)="onImgError($event)" />
                      <span>{{ recipe.name }}</span>
                    </div>
                    <div *cdkDragPlaceholder class="drag-placeholder"></div>
                    <img [src]="recipe.image" [alt]="recipe.name" (error)="onImgError($event)" />
                    <span class="slot-name">{{ recipe.name }}</span>
                    <button
                      class="slot-remove"
                      (click)="$event.stopPropagation(); removeRecipe(dayPlan.day, mealType)"
                      title="Remove"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                } @else {
                  <div class="empty-slot">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d0e8d8" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>

      @if (mealPlanService.shoppingItems().length > 0) {
        <div class="shopping-preview">
          <div class="shopping-preview-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
            <span>{{ mealPlanService.shoppingItems().length }} items on your shopping list</span>
            <a routerLink="/shopping-list" class="view-list-link">View list →</a>
          </div>
        </div>
      }

      <!-- Recipe strip: grouped by meal type -->
      <div class="strip-section">
        <div class="strip-header">
          <span class="strip-label">Drag a recipe into any slot</span>
        </div>

        @for (mealType of MEAL_TYPES; track mealType) {
          @if (recipesByMealType(mealType).length > 0) {
            <div class="strip-row">
              <div class="strip-row-label">{{ MEAL_LABELS[mealType] }}</div>
              <div
                class="recipe-strip"
                [id]="'strip-' + mealType"
                cdkDropList
                cdkDropListOrientation="horizontal"
                [cdkDropListConnectedTo]="slotIds()"
                (cdkDropListDropped)="onDropToPanel($event)"
              >
                @for (recipe of recipesByMealType(mealType); track recipe.id) {
                  <div
                    class="strip-card"
                    [class.this-week]="mealPlanService.isSelectedForWeek(recipe.id)"
                    cdkDrag
                    [cdkDragData]="{ recipe, fromDay: null, fromMealType: null }"
                  >
                    <div *cdkDragPreview class="drag-preview">
                      <img [src]="recipe.image" (error)="onImgError($event)" />
                      <span>{{ recipe.name }}</span>
                    </div>
                    <div *cdkDragPlaceholder class="strip-placeholder"></div>
                    <img [src]="recipe.image" [alt]="recipe.name" (error)="onImgError($event)" />
                    <span class="strip-card-name">{{ recipe.name }}</span>
                    @if (mealPlanService.isSelectedForWeek(recipe.id)) {
                      <span class="strip-week-dot"></span>
                    }
                  </div>
                }
              </div>
            </div>
          }
        }

        @if (untaggedRecipes().length > 0) {
          <div class="strip-row">
            <div class="strip-row-label">Other</div>
            <div
              class="recipe-strip"
              id="strip-other"
              cdkDropList
              cdkDropListOrientation="horizontal"
              [cdkDropListConnectedTo]="slotIds()"
              (cdkDropListDropped)="onDropToPanel($event)"
            >
              @for (recipe of untaggedRecipes(); track recipe.id) {
                <div
                  class="strip-card"
                  [class.this-week]="mealPlanService.isSelectedForWeek(recipe.id)"
                  cdkDrag
                  [cdkDragData]="{ recipe, fromDay: null, fromMealType: null }"
                >
                  <div *cdkDragPreview class="drag-preview">
                    <img [src]="recipe.image" (error)="onImgError($event)" />
                    <span>{{ recipe.name }}</span>
                  </div>
                  <div *cdkDragPlaceholder class="strip-placeholder"></div>
                  <img [src]="recipe.image" [alt]="recipe.name" (error)="onImgError($event)" />
                  <span class="strip-card-name">{{ recipe.name }}</span>
                  @if (mealPlanService.isSelectedForWeek(recipe.id)) {
                    <span class="strip-week-dot"></span>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Click-to-pick modal -->
    @if (pickerSlot()) {
      <div class="picker-overlay" (click)="pickerSlot.set(null)">
        <div class="picker-modal" (click)="$event.stopPropagation()">
          <div class="picker-header">
            <h3>{{ MEAL_LABELS[pickerSlot()!.mealType] }} — {{ pickerSlot()!.day }}</h3>
            <button class="close-btn" (click)="pickerSlot.set(null)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="picker-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Search recipes..."
              (input)="filterQuery.set($any($event.target).value)"
              [value]="filterQuery()"
            />
          </div>
          <div class="picker-list">
            @if (matchingTypeRecipes().length > 0) {
              <div class="picker-section-label">{{ MEAL_LABELS[pickerSlot()!.mealType] }}</div>
              @for (recipe of matchingTypeRecipes(); track recipe.id) {
                <div class="picker-item" (click)="assignFromPicker(recipe)">
                  <img [src]="recipe.image" [alt]="recipe.name" (error)="onImgError($event)" />
                  <div class="picker-item-info">
                    <span class="picker-item-name">{{ recipe.name }}</span>
                    <div class="picker-item-meta">
                      <span>{{ recipe.cookingTime }} min</span><span>·</span><span>{{ recipe.calories }} kcal</span>
                    </div>
                  </div>
                </div>
              }
            }
            @if (matchingTypeRecipes().length > 0 && otherPickerRecipes().length > 0) {
              <div class="picker-divider"></div>
              <div class="picker-section-label">Other Recipes</div>
            }
            @for (recipe of otherPickerRecipes(); track recipe.id) {
              <div class="picker-item" (click)="assignFromPicker(recipe)">
                <img [src]="recipe.image" [alt]="recipe.name" (error)="onImgError($event)" />
                <div class="picker-item-info">
                  <span class="picker-item-name">{{ recipe.name }}</span>
                  <div class="picker-item-meta">
                    <span>{{ recipe.cookingTime }} min</span><span>·</span><span>{{ recipe.calories }} kcal</span>
                  </div>
                </div>
              </div>
            }
            @if (!hasAnyResults()) {
              <div class="picker-empty">No recipes found</div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .planner-page { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    h1 { font-size: 1.9rem; font-weight: 800; color: #1a1a1a; margin: 0 0 0.2rem; }
    .subtitle { color: #888; font-size: 0.9rem; margin: 0; }
    .header-actions { display: flex; align-items: center; gap: 1rem; }
    .assigned-count {
      font-size: 0.85rem; font-weight: 600; color: #2d7d46;
      background: #e8f5e9; padding: 6px 14px; border-radius: 20px;
    }
    .reset-btn {
      display: flex; align-items: center; gap: 0.4rem;
      background: #fff; border: 1.5px solid #e0e0e0; border-radius: 10px;
      padding: 6px 14px; font-size: 0.85rem; font-weight: 600; color: #666;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .reset-btn:hover { border-color: #e53935; color: #e53935; }

    /* Grid */
    .grid-scroll { overflow-x: auto; margin-bottom: 1.25rem; }
    .planner-grid {
      display: grid;
      grid-template-columns: 80px repeat(7, minmax(120px, 1fr));
      gap: 4px;
      min-width: 920px;
    }

    .corner-cell { /* top-left spacer */ }

    .day-header-cell {
      text-align: center;
      padding: 0.55rem 0;
      font-size: 0.72rem; font-weight: 700; color: #2d7d46;
      text-transform: uppercase; letter-spacing: 0.6px;
      background: #f0f9f3; border-radius: 8px;
    }

    .meal-label-cell {
      display: flex; align-items: center; justify-content: flex-end;
      padding-right: 0.6rem;
      font-size: 0.7rem; font-weight: 700; color: #2d7d46;
      letter-spacing: 0.3px;
    }

    .slot-cell {
      background: #fff;
      border: 1.5px dashed #dceedd;
      border-radius: 10px;
      min-height: 108px;
      cursor: pointer;
      transition: border-color 0.18s, background 0.18s;
      overflow: hidden;
      position: relative;
    }
    .slot-cell:hover:not(.filled) { border-color: #2d7d46; background: #f8fdf9; }
    .slot-cell.filled { border-style: solid; border-color: #b8dcc3; cursor: default; }
    .slot-cell.cdk-drop-list-receiving {
      border-color: #2d7d46 !important; background: #f0f9f3 !important;
      box-shadow: 0 0 0 3px rgba(45,125,70,0.18) !important;
    }

    .empty-slot {
      height: 108px; display: flex; align-items: center; justify-content: center;
    }

    .slot-content {
      position: relative; height: 100%; min-height: 108px;
      display: flex; flex-direction: column; cursor: grab;
    }
    .slot-content:active { cursor: grabbing; }
    .slot-content > img { width: 100%; height: 60px; object-fit: cover; flex-shrink: 0; }

    .slot-name {
      font-size: 0.7rem; font-weight: 600; color: #1a1a1a;
      padding: 0.28rem 0.4rem;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
      line-height: 1.3; flex: 1;
    }

    .slot-remove {
      position: absolute; top: 4px; right: 4px;
      background: rgba(255,255,255,0.92); border: none; border-radius: 50%;
      width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #e53935; opacity: 0; transition: opacity 0.18s;
    }
    .slot-cell:hover .slot-remove { opacity: 1; }

    .drag-placeholder { width: 100%; height: 108px; background: #e8f5e9; border-radius: 8px; }
    .slot-cell .cdk-drag-placeholder { display: none; }

    /* Shopping preview */
    .shopping-preview {
      background: #f8fdf9; border: 1.5px solid #c8e6c9; border-radius: 14px;
      padding: 0.9rem 1.2rem; margin-bottom: 1.5rem;
    }
    .shopping-preview-header {
      display: flex; align-items: center; gap: 0.7rem; color: #2d7d46; font-size: 0.9rem; font-weight: 600;
    }
    .view-list-link { margin-left: auto; color: #2d7d46; text-decoration: none; font-weight: 700; font-size: 0.85rem; }
    .view-list-link:hover { text-decoration: underline; }

    /* Recipe strip */
    .strip-section {
      background: #fff; border: 1.5px solid #e8f5e9; border-radius: 16px;
      padding: 1rem 1.2rem; overflow: hidden;
    }
    .strip-header { margin-bottom: 0.9rem; }
    .strip-label {
      display: inline-flex; align-items: center; gap: 0.4rem;
      font-size: 0.78rem; font-weight: 700; color: #2d7d46;
      text-transform: uppercase; letter-spacing: 0.4px;
    }
    .strip-row {
      display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem;
    }
    .strip-row:last-child { margin-bottom: 0; }
    .strip-row-label {
      flex-shrink: 0; width: 72px;
      font-size: 0.72rem; font-weight: 700; color: #2d7d46;
      text-align: right; letter-spacing: 0.2px;
    }
    .recipe-strip {
      display: flex; gap: 0.75rem; flex-direction: row;
      overflow-x: auto; padding-bottom: 0.5rem;
      scrollbar-width: thin; scrollbar-color: #c8e6c9 transparent;
    }
    .recipe-strip::-webkit-scrollbar { height: 4px; }
    .recipe-strip::-webkit-scrollbar-thumb { background: #c8e6c9; border-radius: 99px; }

    .strip-card {
      position: relative; flex-shrink: 0; width: 110px;
      background: #f9fafb; border: 1.5px solid #e8f5e9; border-radius: 12px;
      overflow: hidden; cursor: grab;
      transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
      display: flex; flex-direction: column;
    }
    .strip-card:active { cursor: grabbing; }
    .strip-card:hover { border-color: #a5d6b0; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(45,125,70,0.1); }
    .strip-card.this-week { border-color: #2d7d46; background: #f8fdf9; }
    .strip-card > img { width: 100%; height: 72px; object-fit: cover; }
    .strip-card-name {
      font-size: 0.72rem; font-weight: 600; color: #333;
      padding: 0.35rem 0.4rem 0.4rem;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
      line-height: 1.3;
    }
    .strip-week-dot {
      position: absolute; top: 5px; right: 5px;
      width: 8px; height: 8px; border-radius: 50%; background: #2d7d46;
    }
    .strip-placeholder {
      flex-shrink: 0; width: 110px; height: 110px;
      background: #e8f5e9; border: 2px dashed #a5d6b0; border-radius: 12px;
    }

    .drag-preview {
      display: flex; align-items: center; gap: 0.6rem;
      background: #fff; border-radius: 12px; padding: 0.5rem 0.8rem 0.5rem 0.5rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      pointer-events: none; max-width: 220px;
    }
    .drag-preview img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
    .drag-preview span { font-size: 0.85rem; font-weight: 600; color: #1a1a1a; line-height: 1.3; }

    /* Picker modal */
    .picker-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
      backdrop-filter: blur(3px); animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    .picker-modal {
      background: #fff; border-radius: 20px; width: 100%; max-width: 480px; max-height: 80vh;
      display: flex; flex-direction: column; animation: slideUp 0.25s ease;
    }
    @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
    .picker-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.2rem 1.3rem 0.8rem; border-bottom: 1px solid #f0f0f0;
    }
    .picker-header h3 { font-size: 1rem; font-weight: 700; color: #1a1a1a; margin: 0; }
    .close-btn {
      background: none; border: none; cursor: pointer; color: #888;
      border-radius: 50%; padding: 4px; display: flex; transition: background 0.2s;
    }
    .close-btn:hover { background: #f0f0f0; color: #333; }
    .picker-search {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.8rem 1.3rem; border-bottom: 1px solid #f0f0f0;
    }
    .picker-search input { border: none; outline: none; font-size: 0.9rem; width: 100%; color: #333; }
    .picker-list { overflow-y: auto; flex: 1; padding: 0.5rem; }
    .picker-item {
      display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem;
      border-radius: 12px; cursor: pointer; transition: background 0.15s;
    }
    .picker-item:hover { background: #f8fdf9; }
    .picker-item img { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; }
    .picker-item-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .picker-item-name { font-size: 0.9rem; font-weight: 600; color: #1a1a1a; }
    .picker-item-meta { display: flex; gap: 0.4rem; font-size: 0.78rem; color: #888; }
    .picker-empty { text-align: center; color: #bbb; padding: 2rem; font-size: 0.9rem; }
    .picker-section-label {
      font-size: 0.7rem; font-weight: 700; color: #2d7d46;
      text-transform: uppercase; letter-spacing: 0.5px;
      padding: 0.5rem 0.7rem 0.25rem; display: flex; align-items: center; gap: 0.4rem;
    }
    .picker-divider { height: 1px; background: #f0f0f0; margin: 0.3rem 0.5rem; }
  `]
})
export class MealPlannerComponent {
  readonly MEAL_TYPES = MEAL_TYPES;
  readonly MEAL_LABELS = MEAL_LABELS;

  pickerSlot = signal<{ day: string; mealType: MealType } | null>(null);
  filterQuery = signal('');

  constructor(
    public recipeService: RecipeService,
    public mealPlanService: MealPlanService,
  ) {}

  slotIds(): string[] {
    const ids: string[] = [];
    for (const dayPlan of this.mealPlanService.mealPlan()) {
      for (const mt of MEAL_TYPES) {
        ids.push(`${dayPlan.day}-${mt}`);
      }
    }
    return ids;
  }

  stripIds(): string[] {
    return [...MEAL_TYPES.map(mt => `strip-${mt}`), 'strip-other'];
  }

  allDropIds(): string[] {
    return [...this.slotIds(), ...this.stripIds()];
  }

  recipesByMealType(mealType: MealType): Recipe[] {
    const selected = this.mealPlanService.weekSelectionIds();
    const matches = this.recipeService.recipes().filter(r =>
      r.tags.some(t => t.toLowerCase() === mealType)
    );
    return [
      ...matches.filter(r => selected.has(r.id)),
      ...matches.filter(r => !selected.has(r.id)),
    ];
  }

  untaggedRecipes(): Recipe[] {
    const selected = this.mealPlanService.weekSelectionIds();
    const untagged = this.recipeService.recipes().filter(r =>
      !MEAL_TYPES.some(mt => r.tags.some(t => t.toLowerCase() === mt))
    );
    return [
      ...untagged.filter(r => selected.has(r.id)),
      ...untagged.filter(r => !selected.has(r.id)),
    ];
  }

  matchingTypeRecipes(): Recipe[] {
    const slot = this.pickerSlot();
    if (!slot) return [];
    const q = this.filterQuery().toLowerCase();
    const mt = slot.mealType;
    return this.recipeService.recipes().filter(r =>
      r.tags.some(t => t.toLowerCase() === mt) &&
      (!q || r.name.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  otherPickerRecipes(): Recipe[] {
    const slot = this.pickerSlot();
    if (!slot) return [];
    const q = this.filterQuery().toLowerCase();
    const mt = slot.mealType;
    return this.recipeService.recipes().filter(r =>
      !r.tags.some(t => t.toLowerCase() === mt) &&
      (!q || r.name.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  hasAnyResults(): boolean {
    return this.matchingTypeRecipes().length + this.otherPickerRecipes().length > 0;
  }

  onDropToSlot(event: CdkDragDrop<string>, targetDay: string, targetMealType: MealType) {
    const data = event.item.data as DragData;
    if (!data) return;
    if (data.fromDay !== null && data.fromMealType !== null) {
      if (data.fromDay === targetDay && data.fromMealType === targetMealType) return;
      this.mealPlanService.swapSlots(data.fromDay, data.fromMealType, targetDay, targetMealType);
    } else if (data.fromDay === null) {
      this.mealPlanService.assignRecipe(targetDay, targetMealType, data.recipe);
    }
  }

  onDropToPanel(event: CdkDragDrop<any>) {
    const data = event.item.data as DragData;
    if (data?.fromDay && data?.fromMealType) {
      this.mealPlanService.removeRecipe(data.fromDay, data.fromMealType);
    }
  }

  openPicker(day: string, mealType: MealType) {
    this.filterQuery.set('');
    this.pickerSlot.set({ day, mealType });
  }

  assignFromPicker(recipe: Recipe) {
    const slot = this.pickerSlot();
    if (!slot) return;
    this.mealPlanService.assignRecipe(slot.day, slot.mealType, recipe);
    this.pickerSlot.set(null);
  }

  removeRecipe(day: string, mealType: MealType) {
    this.mealPlanService.removeRecipe(day, mealType);
  }

  resetPlan() {
    if (confirm('Reset the entire meal plan?')) {
      this.mealPlanService.resetMealPlan();
    }
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80';
  }
}
