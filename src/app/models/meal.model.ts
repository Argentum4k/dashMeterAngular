export interface Meal {
  id: string;
  time: string;
  proteins: number;
  fats: number;
  carbs: number;
}

export interface Targets {
  proteins: number;
  fats: number;
  carbs: number;
}

export interface DailyData {
  date: string;
  meals: Meal[];
}

