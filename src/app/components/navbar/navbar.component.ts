import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/>
          <path d="M12 6v2M12 16v2M6 12h2M16 12h2"/>
        </svg>
        <span>Recipeasy</span>
      </div>
      <div class="navbar-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          Recipes
        </a>
        <a routerLink="/meal-planner" routerLinkActive="active">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Meal Planner
        </a>
        <a routerLink="/shopping-list" routerLinkActive="active">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/>
            <line x1="9" y1="16" x2="13" y2="16"/>
          </svg>
          Shopping List
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 2rem; height: 64px; background: #fff;
      border-bottom: 1px solid #e8f5e9; position: sticky; top: 0; z-index: 100;
      box-shadow: 0 1px 8px rgba(45,125,70,0.07);
    }
    .navbar-brand {
      display: flex; align-items: center; gap: 0.6rem;
      color: #2d7d46; font-size: 1.25rem; font-weight: 700; letter-spacing: -0.3px;
    }
    .navbar-links { display: flex; gap: 0.25rem; }
    .navbar-links a {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 1rem; border-radius: 8px;
      color: #555; text-decoration: none; font-size: 0.9rem; font-weight: 500;
      transition: all 0.2s;
    }
    .navbar-links a:hover { background: #f1f8f3; color: #2d7d46; }
    .navbar-links a.active { background: #e8f5e9; color: #2d7d46; font-weight: 600; }
  `]
})
export class NavbarComponent {}
