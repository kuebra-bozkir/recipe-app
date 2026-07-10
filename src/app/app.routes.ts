import { Routes } from '@angular/router';
import { RecipeGalleryComponent } from './components/recipe-gallery/recipe-gallery.component';
import { MealPlannerComponent } from './components/meal-planner/meal-planner.component';
import { ShoppingListComponent } from './components/shopping-list/shopping-list.component';

export const routes: Routes = [
  { path: '', component: RecipeGalleryComponent },
  { path: 'meal-planner', component: MealPlannerComponent },
  { path: 'shopping-list', component: ShoppingListComponent },
  { path: '**', redirectTo: '' },
];
