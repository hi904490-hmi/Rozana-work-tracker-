export interface DailyRecord {
  id: string;
  date: string;
  orders: number;
  
  // Income details
  fixedIncome: number;
  orderBonus: number;
  peakBonus: number;
  weekendBonus: number;
  activityReward: number;

  // Expense details
  fuel: number;
  salik: number;
  fine: number;
  foodRent: number;
  others: number;
  
  // Totals
  totalIncome: number;
  totalExpense: number;
}
