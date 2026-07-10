import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MealPlanService } from '../../services/meal-plan.service';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="shopping-page">
      <div class="page-header">
        <div>
          <h1>Shopping List</h1>
          <p class="subtitle">Generated from your weekly meal plan</p>
        </div>
        <div class="header-actions">
          <button class="clear-btn" (click)="mealPlanService.clearChecked()" [disabled]="!hasChecked()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            </svg>
            Remove checked
          </button>
        </div>
      </div>

      @if (mealPlanService.shoppingItems().length === 0) {
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#c8e6c9" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
          </svg>
          <h3>Your shopping list is empty</h3>
          <p>Assign recipes to days in the meal planner to generate your list.</p>
          <a routerLink="/meal-planner" class="btn-primary">Go to Meal Planner</a>
        </div>
      } @else {
        <div class="progress-bar-wrap">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progressPercent()"></div>
          </div>
          <span class="progress-label">{{ checkedCount() }} of {{ mealPlanService.shoppingItems().length }} items</span>
        </div>

        <div class="list-card">
          @for (item of mealPlanService.shoppingItems(); track item.id) {
            <div
              class="list-item"
              [class.checked]="item.checked"
              (click)="mealPlanService.toggleShoppingItem(item.id)"
            >
              <div class="checkbox" [class.checked]="item.checked">
                @if (item.checked) {
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                }
              </div>
              <div class="item-content">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-amount">{{ item.amount }} {{ item.unit }}</span>
              </div>
            </div>
          }
        </div>

        @if (checkedCount() === mealPlanService.shoppingItems().length && mealPlanService.shoppingItems().length > 0) {
          <div class="all-done">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2d7d46" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>All done! Happy cooking!</span>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .shopping-page { max-width: 680px; margin: 0 auto; padding: 2rem 1.5rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.8rem; }
    h1 { font-size: 1.9rem; font-weight: 800; color: #1a1a1a; margin: 0 0 0.2rem; }
    .subtitle { color: #888; font-size: 0.9rem; margin: 0; }
    .header-actions { display: flex; gap: 0.75rem; }
    .clear-btn {
      display: flex; align-items: center; gap: 0.4rem;
      background: #fff; border: 1.5px solid #e0e0e0; border-radius: 10px;
      padding: 7px 14px; font-size: 0.85rem; font-weight: 600; color: #666;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .clear-btn:hover:not(:disabled) { border-color: #e53935; color: #e53935; }
    .clear-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .progress-bar-wrap { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem; }
    .progress-bar { flex: 1; height: 8px; background: #e8f5e9; border-radius: 99px; overflow: hidden; }
    .progress-fill { height: 100%; background: #2d7d46; border-radius: 99px; transition: width 0.3s ease; }
    .progress-label { font-size: 0.82rem; color: #888; white-space: nowrap; }
    .list-card { background: #fff; border-radius: 16px; border: 1px solid #f0f0f0; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
    .list-item {
      display: flex; align-items: center; gap: 1rem; padding: 1rem 1.2rem;
      cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #f7f7f7;
    }
    .list-item:last-child { border-bottom: none; }
    .list-item:hover { background: #f8fdf9; }
    .list-item.checked { opacity: 0.5; }
    .checkbox {
      width: 22px; height: 22px; border: 2px solid #d0d0d0; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: all 0.15s; color: #fff;
    }
    .checkbox.checked { background: #2d7d46; border-color: #2d7d46; }
    .item-content { flex: 1; display: flex; align-items: baseline; justify-content: space-between; }
    .item-name { font-size: 0.95rem; color: #1a1a1a; font-weight: 500; }
    .list-item.checked .item-name { text-decoration: line-through; }
    .item-amount { font-size: 0.85rem; color: #2d7d46; font-weight: 600; }
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 4rem 2rem; gap: 0.5rem; color: #bbb;
    }
    .empty-state h3 { color: #aaa; font-size: 1.2rem; margin: 0.5rem 0 0; }
    .empty-state p { color: #bbb; font-size: 0.9rem; margin: 0 0 1rem; text-align: center; }
    .btn-primary {
      display: inline-block; background: #2d7d46; color: #fff; text-decoration: none;
      padding: 0.65rem 1.3rem; border-radius: 12px; font-size: 0.9rem; font-weight: 600; transition: background 0.2s;
    }
    .btn-primary:hover { background: #245f37; }
    .all-done {
      display: flex; align-items: center; justify-content: center; gap: 0.7rem;
      margin-top: 1.5rem; padding: 1rem; background: #f8fdf9; border-radius: 14px;
      color: #2d7d46; font-weight: 600; font-size: 1rem;
    }
  `]
})
export class ShoppingListComponent {
  constructor(public mealPlanService: MealPlanService) {}

  checkedCount() {
    return this.mealPlanService.shoppingItems().filter(i => i.checked).length;
  }

  hasChecked() {
    return this.mealPlanService.shoppingItems().some(i => i.checked);
  }

  progressPercent() {
    const items = this.mealPlanService.shoppingItems();
    if (!items.length) return 0;
    return (this.checkedCount() / items.length) * 100;
  }
}
