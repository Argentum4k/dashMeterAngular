import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { Meal, Targets } from '../../models/meal.model';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private storageService = inject(StorageService);

  proteins = signal(0);
  fats = signal(0);
  carbs = signal(0);
  editingMealId = signal<string | null>(null);

  targets = signal<Targets | null>(null);
  todayMeals = signal<Meal[]>([]);

  constructor() {
    this.loadTargets();
    this.loadTodayMeals();
  }

  eatenToday = computed(() => {
    const meals = this.todayMeals();
    return {
      proteins: meals.reduce((sum, meal) => sum + meal.proteins, 0),
      fats: meals.reduce((sum, meal) => sum + meal.fats, 0),
      carbs: meals.reduce((sum, meal) => sum + meal.carbs, 0)
    };
  });

  isEditing = computed(() => this.editingMealId() !== null);
  buttonText = computed(() => this.isEditing() ? 'сохранить изменения' : 'добавить прием пищи');

  adjustValue(type: 'proteins' | 'fats' | 'carbs', delta: number): void {
    const current = this[type]();
    const newValue = Math.max(0, this.roundToHalf(current + delta));
    this[type].set(newValue);
  }

  addOrUpdateMeal(): void {
    if (this.proteins() === 0 && this.fats() === 0 && this.carbs() === 0) {
      return;
    }

    const today = this.storageService.getTodayDate();

    if (this.editingMealId()) {
      const mealData = {
        proteins: this.proteins(),
        fats: this.fats(),
        carbs: this.carbs()
      };
      this.storageService.updateMeal(today, this.editingMealId()!, mealData);
      this.editingMealId.set(null);
    } else {
      const time = this.getCurrentTime();
      const mealData = {
        time,
        proteins: this.proteins(),
        fats: this.fats(),
        carbs: this.carbs()
      };
      this.storageService.saveMeal(today, mealData);
    }

    this.resetCounters();
    this.loadTodayMeals();
  }

  editMeal(meal: Meal): void {
    this.proteins.set(meal.proteins);
    this.fats.set(meal.fats);
    this.carbs.set(meal.carbs);
    this.editingMealId.set(meal.id);
  }

  cancelEdit(): void {
    this.resetCounters();
    this.editingMealId.set(null);
  }

  private resetCounters(): void {
    this.proteins.set(0);
    this.fats.set(0);
    this.carbs.set(0);
  }

  private loadTargets(): void {
    this.targets.set(this.storageService.getTargets());
  }

  private loadTodayMeals(): void {
    const today = this.storageService.getTodayDate();
    const meals = this.storageService.getMeals(today);
    this.todayMeals.set(meals);
  }

  private getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private roundToHalf(value: number): number {
    return Math.round(value * 2) / 2;
  }
}

