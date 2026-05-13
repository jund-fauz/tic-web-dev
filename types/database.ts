export interface Meal {
  id: string;
  meal_plan_id: string;
  day_number: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description?: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  recipe?: any;
  is_eaten: boolean;
  created_at: string;
  updated_at: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  status: 'planned' | 'completed';
  created_at: string;
  updated_at: string;
  meals?: Meal[];
}
