export type Categories = {
  name: string;
};
export type Methods = {
  name: string;
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
