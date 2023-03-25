import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { toast } from "react-hot-toast";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

import FullScreenWrapper from "../../components/wrappers/FullScreenWrapper";
import Header from "../../components/Header";
import NewFinancialMove from "~/components/Modals/NewFinancialMove";
import { api } from "~/utils/api";
import { IUserProps, ExpenseType, EarningType } from "~/utils/types";
function FinancesMainPage({ user }: IUserProps) {
  const trpc = api.useContext();
  const [newFinancialMovementModalIsOpen, setNewFinancialMovementModalIsOpen] =
    useState(false);
  const {
    data: expenses,
    isFetching,
    isLoading,
    status,
  } = api.finances.getExpenses.useQuery(user ? user.id : "");
  const {
    data: earnings,
    isFetching: areEarningsFetching,
    isLoading: areEarningsLoading,
    status: earningAPIStatus,
  } = api.finances.getEarnings.useQuery(user ? user.id : "");
  const { mutate: deleteExpense } = api.finances.deleteExpense.useMutation({
    onSuccess(data, variables, context) {
      trpc.finances.getExpenses.invalidate();
      toast.success("Gasto excluído !");
    },
    onError(error, variables, context) {
      toast.error(error.message);
    },
  });

  function getTotalSpend(expenses: ExpenseType[]) {
    var totalSum = 0;
    if (expenses && expenses.length > 0) {
      for (let i = 0; i < expenses.length; i++) {
        if (expenses[i] != null && expenses[i] != undefined) {
          let expenseValue = expenses[i]?.value ? expenses[i]?.value : 0;
          if (expenseValue) totalSum = totalSum + expenseValue;
          else totalSum = totalSum;
        }
      }
      return totalSum;
    }
  }
  function getTotalEarned(earnings: EarningType[]) {
    var totalSum = 0;
    if (earnings && earnings.length > 0) {
      for (let i = 0; i < earnings.length; i++) {
        if (earnings[i] != null && earnings[i] != undefined) {
          let expenseValue = earnings[i]?.value ? earnings[i]?.value : 0;
          if (expenseValue) totalSum = totalSum + expenseValue;
          else totalSum = totalSum;
        }
      }
      return totalSum;
    }
  }
  //   .color1 { #4e4d4a };
  // .color2 { #353432 };
  // .color3 { #94ba65 };
  // .color4 { #2790b0 };
  // .color5 { #2b4e72 };
  console.log(earnings);
  console.log("IN FINANCES", user);
  return (
    <FullScreenWrapper>
      <Header />
      <div className="flex w-full grow flex-col p-6">
        <div className="flex w-full flex-col items-start border-b border-[#2b4e72] pb-2">
          <h1 className="mb-4 w-full text-center font-[Roboto] text-xl font-bold text-[#2b4e72] lg:text-start">
            CONTROLE DE FINANÇAS
          </h1>
          <div className="flex w-full flex-col items-center justify-center gap-2 lg:flex-row">
            {earnings ? (
              <div className="flex flex-col items-center">
                <p className="text-md font-bold text-green-800">TOTAL GANHO</p>
                <p className="text-lg font-bold text-green-500">
                  R$ {getTotalEarned(earnings)?.toFixed(2).replace(".", ",")}
                </p>
              </div>
            ) : null}
            {expenses ? (
              <div className="flex flex-col items-center">
                <p className="text-md font-bold text-red-800">TOTAL GASTO</p>
                <p className="text-lg font-bold text-red-500">
                  R$ {getTotalSpend(expenses)?.toFixed(2).replace(".", ",")}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-col  py-2 ">
          <h1 className="font-bold text-green-500">GANHOS</h1>
          <div className="flex grow flex-col flex-wrap gap-3 lg:flex-row lg:justify-center">
            {earnings?.map((earning) => (
              <div
                key={earning.id}
                className="flex max-h-[100px] w-full flex-col rounded border border-[#2b4e72] p-3 shadow-lg lg:w-[450px]"
              >
                <div className="flex items-center justify-between">
                  <h1 className="font-bold text-[#2790b0]">
                    {earning.description}
                  </h1>
                  <h1 className="font-bold text-green-500">
                    + R$ {earning.value.toFixed(2).replace(".", ",")}
                  </h1>
                </div>
                <div className="flex items-center justify-end text-xs">
                  <h1 className="text-[##4e4d4a]">
                    {new Date(earning.date).toLocaleString()}
                  </h1>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col  py-2 ">
          <h1 className="font-bold text-red-500">GASTOS</h1>
          <div className="flex grow flex-col flex-wrap gap-3 lg:flex-row lg:justify-center">
            {expenses?.map((expense) => (
              <div
                key={expense.id}
                className="flex max-h-[100px] w-full flex-col gap-1 rounded border border-[#2b4e72] p-3 shadow-lg lg:w-[450px]"
              >
                <div className="flex items-center justify-between">
                  <h1 className="font-bold text-[#2790b0]">
                    {expense.description}
                  </h1>
                  <h1 className="font-bold text-red-500">
                    - R$ {expense.value.toFixed(2).replace(".", ",")}
                  </h1>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <h1 className="font-semibold text-[#94ba65]">
                    {expense.category}
                  </h1>
                  <h1 className="break-all text-[##4e4d4a]">
                    {new Date(expense.purchaseDate).toLocaleDateString()}
                  </h1>
                </div>
                <div className="mt-2 flex items-center justify-end">
                  <button className="text-xl text-orange-300 duration-300 ease-in-out hover:scale-110 hover:text-orange-500">
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-xl text-red-300 duration-300 ease-in-out hover:scale-110 hover:text-red-500"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          onClick={() => setNewFinancialMovementModalIsOpen(true)}
          className="left-150 text-md fixed bottom-10 cursor-pointer rounded-lg bg-[#2b4e72] p-3 text-white duration-300 ease-in-out hover:scale-110 hover:bg-[#2790b0]"
        >
          <IoMdAdd />
        </div>
      </div>
      {newFinancialMovementModalIsOpen ? (
        <NewFinancialMove
          user={user}
          modalIsOpen={newFinancialMovementModalIsOpen}
          closeModal={() => setNewFinancialMovementModalIsOpen(false)}
        />
      ) : null}
    </FullScreenWrapper>
  );
}

export default FinancesMainPage;
