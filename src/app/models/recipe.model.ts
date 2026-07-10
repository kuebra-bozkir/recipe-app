export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  ingredients: Ingredient[];
  instructions: string;
  cookingTime: number;
  calories: number;
  servings: number;
  tags: string[];
  createdAt: string;
  favourite?: boolean;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

export interface MealDay {
  day: string;
  meals: Record<MealType, Recipe | null>;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  unit: string;
  checked: boolean;
  recipeIds: string[];
}
