import { Injectable, signal, computed } from '@angular/core';
import { Recipe, MealDay, MealType, MEAL_TYPES, ShoppingItem } from '../models/recipe.model';

const MEAL_PLAN_KEY = 'mealPlan';
const SHOPPING_KEY = 'shoppingList';
const WEEK_SELECTION_KEY = 'weekSelection';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

@Injectable({ providedIn: 'root' })
export class MealPlanService {
  private _mealPlan = signal<MealDay[]>(this.loadMealPlan());
  private _shoppingItems = signal<ShoppingItem[]>(this.loadShopping());
  private _weekSelection = signal<Set<string>>(this.loadWeekSelection());

  readonly mealPlan = this._mealPlan.asReadonly();
  readonly shoppingItems = this._shoppingItems.asReadonly();
  readonly weekSelectionIds = this._weekSelection.asReadonly();

  readonly shoppingList = computed(() => this._shoppingItems());

  private defaultMealPlan(): MealDay[] {
    return DAYS.map(day => ({
      day,
      meals: { breakfast: null, lunch: null, dinner: null, snacks: null },
    }));
  }

  private loadMealPlan(): MealDay[] {
    const stored = localStorage.getItem(MEAL_PLAN_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0 && 'recipe' in parsed[0]) {
          return this.defaultMealPlan();
        }
        return parsed;
      } catch {
        return this.defaultMealPlan();
      }
    }
    return this.defaultMealPlan();
  }

  private loadShopping(): ShoppingItem[] {
    const stored = localStorage.getItem(SHOPPING_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private loadWeekSelection(): Set<string> {
    const stored = localStorage.getItem(WEEK_SELECTION_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  }

  private saveMealPlan() {
    localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(this._mealPlan()));
  }

  private saveShopping() {
    localStorage.setItem(SHOPPING_KEY, JSON.stringify(this._shoppingItems()));
  }

  private saveWeekSelection() {
    localStorage.setItem(WEEK_SELECTION_KEY, JSON.stringify([...this._weekSelection()]));
  }

  isSelectedForWeek(id: string): boolean {
    return this._weekSelection().has(id);
  }

  toggleWeekSelection(id: string) {
    this._weekSelection.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    this.saveWeekSelection();
  }

  assignRecipe(day: string, mealType: MealType, recipe: Recipe) {
    this._mealPlan.update(plan =>
      plan.map(d => d.day === day
        ? { ...d, meals: { ...d.meals, [mealType]: recipe } }
        : d
      )
    );
    this.saveMealPlan();
    this.regenerateShoppingList();
  }

  swapSlots(dayA: string, mtA: MealType, dayB: string, mtB: MealType) {
    this._mealPlan.update(plan => {
      const recipeA = plan.find(d => d.day === dayA)?.meals[mtA] ?? null;
      const recipeB = plan.find(d => d.day === dayB)?.meals[mtB] ?? null;
      return plan.map(d => {
        if (dayA === dayB && d.day === dayA) {
          return { ...d, meals: { ...d.meals, [mtA]: recipeB, [mtB]: recipeA } };
        }
        if (d.day === dayA) return { ...d, meals: { ...d.meals, [mtA]: recipeB } };
        if (d.day === dayB) return { ...d, meals: { ...d.meals, [mtB]: recipeA } };
        return d;
      });
    });
    this.saveMealPlan();
    this.regenerateShoppingList();
  }

  removeRecipe(day: string, mealType: MealType) {
    this._mealPlan.update(plan =>
      plan.map(d => d.day === day
        ? { ...d, meals: { ...d.meals, [mealType]: null } }
        : d
      )
    );
    this.saveMealPlan();
    this.regenerateShoppingList();
  }

  assignedCount(): number {
    return this._mealPlan().reduce((acc, d) =>
      acc + MEAL_TYPES.filter(mt => d.meals[mt] !== null).length, 0
    );
  }

  regenerateShoppingList() {
    const recipes: Recipe[] = [];
    for (const day of this._mealPlan()) {
      for (const mt of MEAL_TYPES) {
        const r = day.meals[mt];
        if (r) recipes.push(r);
      }
    }

    const itemMap = new Map<string, ShoppingItem>();

    for (const recipe of recipes) {
      for (const ing of recipe.ingredients) {
        const key = `${ing.name.toLowerCase()}_${ing.unit.toLowerCase()}`;
        if (itemMap.has(key)) {
          const existing = itemMap.get(key)!;
          const existingNum = parseFloat(existing.amount);
          const newNum = parseFloat(ing.amount);
          if (!isNaN(existingNum) && !isNaN(newNum)) {
            itemMap.set(key, {
              ...existing,
              amount: String(existingNum + newNum),
              recipeIds: [...existing.recipeIds, recipe.id],
            });
          } else {
            itemMap.set(key, {
              ...existing,
              recipeIds: [...existing.recipeIds, recipe.id],
            });
          }
        } else {
          itemMap.set(key, {
            id: crypto.randomUUID(),
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            checked: false,
            recipeIds: [recipe.id],
          });
        }
      }
    }

    const prevItems = this._shoppingItems();
    const newItems = Array.from(itemMap.values()).map(item => {
      const prev = prevItems.find(p => p.name.toLowerCase() === item.name.toLowerCase() && p.unit === item.unit);
      return prev ? { ...item, checked: prev.checked } : item;
    });

    this._shoppingItems.set(newItems);
    this.saveShopping();
  }

  toggleShoppingItem(id: string) {
    this._shoppingItems.update(items =>
      items.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
    this.saveShopping();
  }

  clearChecked() {
    this._shoppingItems.update(items => items.filter(item => !item.checked));
    this.saveShopping();
  }

  resetMealPlan() {
    this._mealPlan.set(this.defaultMealPlan());
    this._shoppingItems.set([]);
    this._weekSelection.set(new Set());
    this.saveMealPlan();
    this.saveShopping();
    this.saveWeekSelection();
  }
}
