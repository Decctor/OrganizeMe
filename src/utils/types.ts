import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "~/server/api/root";

export type Categories = {
  name: string;
};
export type Methods = {
  name: string;
};
type RouterOutput = inferRouterOutputs<AppRouter>;
type monthExpensesOutput = RouterOutput["finances"]["getMonthExpenses"];
export type monthExpense = monthExpensesOutput[number];

export type analyticsOutput = RouterOutput["finances"]["getAnalytics"];

export type ExpenseType = {
  id: string;
  description: string;
  category: string;
  method: string;
  value: number;
  purchaseDate: Date;
  paymentDate: Date;
  installments?: number | null;
  installmentIdentifier?: number | null;
};
export type EarningType = {
  id: string;
  description: string;
  value: number;
  date: Date;
};
export type IUserProps = {
  user?: {
    id: string;
    name: string;
    email: string;
    categories?: Array<Categories>;
    methods?: Array<Methods>;
    expenses?: Array<object>;
    budgets?: Array<object>;
  };
};
export type ActivityItem = {
  id?: string;
  description: string;
  done: boolean;
};
export interface Activity {
  id?: string;
  title: string;
  items: ActivityItem[];
  userId?: String;
  dueDate?: Date | string | null;
  createdAt?: Date | string;
  concludedAt?: Date | string | null;
}
