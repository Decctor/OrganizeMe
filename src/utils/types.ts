export type Categories = {
  name: string;
};
export type Methods = {
  name: string;
};
export type ExpenseType = {
  id: string;
  description: string;
  category: string;
  method: string;
  value: number;
  purchaseDate: Date;
  installments?: number | null;
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
