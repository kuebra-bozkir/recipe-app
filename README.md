# Recipe App

A personal recipe management web application built with **Angular 19**.

## Overview

Recipe App is a single-page application that helps users organize their cooking. It covers three main areas:

1. **Recipe Gallery** — browse, create, edit, and delete recipes. Recipes can be marked as favourites (shown at the top) and filtered by meal type (Breakfast, Lunch, Dinner, Snacks).

2. **Weekly Meal Planner** — a 7-day × 4-meal-type grid where recipes are assigned to time slots via drag-and-drop (Angular CDK) or a click-to-pick modal with search. Slots can be swapped, cleared individually, or reset entirely.

3. **Shopping List** — automatically generated from all ingredients in the active meal plan. Items can be ticked off as purchased, and checked items can be removed in bulk. Progress is shown as a percentage bar.

All data (recipes and the meal plan) is persisted in the browser's `localStorage` so nothing is lost on page refresh. The app ships with 38 built-in sample recipes covering all four meal types.

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Angular 19 (standalone components, Signals) |
| Drag & drop | Angular CDK `DragDropModule` |
| Styling | Component-scoped CSS (no external UI library) |
| State | Angular `signal` / `computed` |
| Persistence | Browser `localStorage` |
| Language | TypeScript 5.7 |

## Project Structure

```
src/app/
├── models/          # Recipe, Ingredient, MealDay, ShoppingItem interfaces
├── services/        # RecipeService, MealPlanService (signal-based state)
└── components/
    ├── navbar/          # Top navigation bar
    ├── recipe-gallery/  # Main recipe grid with filters and favourites
    ├── recipe-card/     # Single recipe card
    ├── recipe-detail/   # Full-screen recipe detail modal
    ├── add-recipe/      # Create / edit recipe form
    ├── meal-planner/    # Weekly drag-and-drop planner
    └── shopping-list/   # Auto-generated ingredient checklist
```

## Running Locally

**Prerequisites:** Node.js ≥ 18, Angular CLI (`npm install -g @angular/cli`)

```bash
npm install
ng serve
```

Open `http://localhost:4200` in your browser.
