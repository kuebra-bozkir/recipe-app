import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-add-recipe',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="overlay" (click)="close.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ editId ? 'Edit Recipe' : 'Add New Recipe' }}</h2>
          <button class="close-btn" (click)="close.emit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <div class="form-grid">
            <div class="field full">
              <label>Recipe Name *</label>
              <input formControlName="name" placeholder="e.g. Spaghetti Carbonara" />
            </div>
            <div class="field full">
              <label>Image URL</label>
              <input formControlName="image" placeholder="https://example.com/image.jpg" />
            </div>
            <div class="field">
              <label>Cooking Time (min) *</label>
              <input type="number" formControlName="cookingTime" placeholder="30" min="1" />
            </div>
            <div class="field">
              <label>Calories (kcal) *</label>
              <input type="number" formControlName="calories" placeholder="400" min="0" />
            </div>
            <div class="field">
              <label>Servings *</label>
              <input type="number" formControlName="servings" placeholder="4" min="1" />
            </div>
            <div class="field">
              <label>Tags (comma-separated)</label>
              <input formControlName="tags" placeholder="dinner, healthy" />
            </div>
          </div>

          <div class="section-header">
            <label class="section-label">Ingredients *</label>
            <button type="button" class="add-btn-small" (click)="addIngredient()">+ Add</button>
          </div>
          <div formArrayName="ingredients" class="ingredients-list">
            @for (ing of ingredients.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="ingredient-row">
                <input formControlName="amount" placeholder="2" class="ing-amount" />
                <input formControlName="unit" placeholder="cups" class="ing-unit" />
                <input formControlName="name" placeholder="Ingredient name" class="ing-name" />
                <button type="button" class="remove-btn" (click)="removeIngredient(i)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            }
          </div>

          <div class="field full mt">
            <label>Instructions *</label>
            <textarea formControlName="instructions" rows="4" placeholder="Describe the cooking steps..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="close.emit()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="form.invalid">
              {{ editId ? 'Save Changes' : 'Save Recipe' }}
            </button>
          </div>
        </form>
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
      background: #fff; border-radius: 20px;
      width: 100%; max-width: 640px; max-height: 92vh; overflow-y: auto;
      animation: slideUp 0.25s ease;
    }
    @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.4rem 1.5rem 1rem; border-bottom: 1px solid #f0f0f0;
    }
    h2 { font-size: 1.2rem; font-weight: 700; color: #1a1a1a; margin: 0; }
    .close-btn {
      background: none; border: none; cursor: pointer; color: #666;
      display: flex; align-items: center; border-radius: 50%; padding: 4px; transition: background 0.2s;
    }
    .close-btn:hover { background: #f0f0f0; }
    .form { padding: 1.2rem 1.5rem 1.5rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; margin-bottom: 1.2rem; }
    .field { display: flex; flex-direction: column; gap: 0.35rem; }
    .field.full { grid-column: 1 / -1; }
    .field.mt { margin-top: 1rem; }
    label { font-size: 0.8rem; font-weight: 600; color: #444; text-transform: uppercase; letter-spacing: 0.3px; }
    input, textarea {
      border: 1.5px solid #e0e0e0; border-radius: 10px;
      padding: 0.55rem 0.8rem; font-size: 0.9rem; font-family: inherit;
      color: #1a1a1a; outline: none; transition: border-color 0.2s;
    }
    input:focus, textarea:focus { border-color: #2d7d46; }
    textarea { resize: vertical; }
    .section-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;
    }
    .section-label { font-size: 0.8rem; font-weight: 600; color: #444; text-transform: uppercase; letter-spacing: 0.3px; }
    .add-btn-small {
      background: #e8f5e9; color: #2d7d46; border: none; border-radius: 8px;
      padding: 4px 12px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background 0.2s;
    }
    .add-btn-small:hover { background: #c8e6c9; }
    .ingredients-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.5rem; }
    .ingredient-row {
      display: grid; grid-template-columns: 70px 80px 1fr 32px; gap: 0.5rem; align-items: center;
    }
    .ing-amount, .ing-unit { text-align: center; }
    .remove-btn {
      background: none; border: none; cursor: pointer; color: #e53935;
      border-radius: 6px; padding: 4px; display: flex; align-items: center; transition: background 0.2s;
    }
    .remove-btn:hover { background: #ffebee; }
    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.4rem; }
    .btn-secondary {
      padding: 0.65rem 1.4rem; border: 1.5px solid #e0e0e0; border-radius: 10px;
      background: #fff; color: #555; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .btn-secondary:hover { border-color: #bbb; }
    .btn-primary {
      padding: 0.65rem 1.6rem; border: none; border-radius: 10px;
      background: #2d7d46; color: #fff; font-size: 0.9rem; font-weight: 600;
      cursor: pointer; transition: background 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background: #245f37; }
    .btn-primary:disabled { background: #a5d6b0; cursor: not-allowed; }
  `]
})
export class AddRecipeComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Omit<Recipe, 'id' | 'createdAt'>>();
  @Output() update = new EventEmitter<Recipe>();

  editId: string | null = null;

  @Input() set editRecipe(recipe: Recipe | null | undefined) {
    if (!recipe) return;
    this.editId = recipe.id;
    this.form.patchValue({
      name: recipe.name,
      image: recipe.image,
      cookingTime: recipe.cookingTime,
      calories: recipe.calories,
      servings: recipe.servings,
      tags: recipe.tags.join(', '),
      instructions: recipe.instructions,
    });
    while (this.ingredients.length > 0) this.ingredients.removeAt(0);
    for (const ing of recipe.ingredients) {
      this.ingredients.push(this.fb.group({
        name: [ing.name, Validators.required],
        amount: [ing.amount, Validators.required],
        unit: [ing.unit],
      }));
    }
  }

  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: ['', Validators.required],
    image: [''],
    cookingTime: [30, [Validators.required, Validators.min(1)]],
    calories: [400, [Validators.required, Validators.min(0)]],
    servings: [2, [Validators.required, Validators.min(1)]],
    tags: [''],
    instructions: ['', Validators.required],
    ingredients: this.fb.array([this.createIngredient()]),
  });

  get ingredients() {
    return this.form.get('ingredients') as FormArray;
  }

  createIngredient() {
    return this.fb.group({
      name: ['', Validators.required],
      amount: ['', Validators.required],
      unit: [''],
    });
  }

  addIngredient() {
    this.ingredients.push(this.createIngredient());
  }

  removeIngredient(i: number) {
    if (this.ingredients.length > 1) this.ingredients.removeAt(i);
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const data: Omit<Recipe, 'id' | 'createdAt'> = {
      name: v.name!,
      image: v.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80',
      cookingTime: v.cookingTime!,
      calories: v.calories!,
      servings: v.servings!,
      tags: v.tags ? v.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      instructions: v.instructions!,
      ingredients: (v.ingredients as any[]).map(i => ({
        name: i.name,
        amount: i.amount,
        unit: i.unit || '',
      })),
    };
    if (this.editId) {
      this.update.emit({ ...data, id: this.editId, createdAt: '' });
    } else {
      this.save.emit(data);
    }
  }
}
