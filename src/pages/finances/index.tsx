import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import FullScreenWrapper from "../../components/wrappers/FullScreenWrapper";
import Header from "../../components/Header";
import NewFinancialMove from "~/components/Modals/NewFinancialMove";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { IUserProps } from "~/utils/types";
function FinancesMainPage({ user }: IUserProps) {
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
  const { mutate } = api.users.createUser.useMutation({
    onMutate: async (x) => {
      toast.success("Usuário adicionado!");
    },
  });
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
        <div className="flex w-full items-center border-b border-[#2b4e72] pb-2">
          <h1 className="font-[Roboto] text-xl font-bold text-[#2b4e72]">
            CONTROLE DE FINANÇAS
          </h1>
        </div>
        <div className="flex w-full flex-col  py-2 ">
          <h1 className="font-bold text-green-500">GANHOS</h1>
          <div className="flex grow flex-col flex-wrap gap-3 lg:flex-row lg:justify-center">
            {earnings?.map((earning) => (
              <div className="flex max-h-[100px] w-full flex-col rounded border border-[#2b4e72] p-3 shadow-lg lg:w-[450px]">
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
              <div className="flex max-h-[100px] w-full flex-col rounded border border-[#2b4e72] p-3 shadow-lg lg:w-[450px]">
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
                  <h1 className="text-[##4e4d4a]">
                    {new Date(expense.purchaseDate).toLocaleString()}
                  </h1>
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
