import { Injectable } from '@angular/core';
import { Meal, Targets } from '../models/meal.model';

const TARGETS_KEY = 'bju_targets';
const MEALS_KEY = 'bju_meals';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  getTargets(): Targets | null {
    const data = localStorage.getItem(TARGETS_KEY);
    return data ? JSON.parse(data) : null;
  }

  saveTargets(targets: Targets): void {
    localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
  }

  getMeals(date: string): Meal[] {
    const data = localStorage.getItem(MEALS_KEY);
    if (!data) return [];
    
    const allMeals: { [date: string]: Meal[] } = JSON.parse(data);
    return allMeals[date] || [];
  }

  saveMeal(date: string, meal: Omit<Meal, 'id'>): Meal {
    const mealWithId: Meal = {
      ...meal,
      id: this.generateId()
    };
    
    const allMeals = this.getAllMealsData();
    if (!allMeals[date]) {
      allMeals[date] = [];
    }
    allMeals[date].push(mealWithId);
    localStorage.setItem(MEALS_KEY, JSON.stringify(allMeals));
    
    return mealWithId;
  }

  updateMeal(date: string, mealId: string, meal: Omit<Meal, 'id' | 'time'>): void {
    const allMeals = this.getAllMealsData();
    if (!allMeals[date]) return;
    
    const index = allMeals[date].findIndex(m => m.id === mealId);
    if (index !== -1) {
      const existingMeal = allMeals[date][index];
      allMeals[date][index] = {
        ...existingMeal,
        ...meal
      };
      localStorage.setItem(MEALS_KEY, JSON.stringify(allMeals));
    }
  }

  deleteMeal(date: string, mealId: string): void {
    const allMeals = this.getAllMealsData();
    if (!allMeals[date]) return;
    
    allMeals[date] = allMeals[date].filter(m => m.id !== mealId);
    localStorage.setItem(MEALS_KEY, JSON.stringify(allMeals));
  }

  getAllMeals(): { [date: string]: Meal[] } {
    return this.getAllMealsData();
  }

  private getAllMealsData(): { [date: string]: Meal[] } {
    const data = localStorage.getItem(MEALS_KEY);
    return data ? JSON.parse(data) : {};
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getTodayDate(): string {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
}

