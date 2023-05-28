import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { toast } from "react-hot-toast";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { RxUpload, RxDownload } from "react-icons/rx";
import { BiTrendingDown, BiTrendingUp } from "react-icons/bi";
import { AiFillCaretRight, AiFillCaretLeft } from "react-icons/ai";
import FullScreenWrapper from "../../components/wrappers/FullScreenWrapper";
import Header from "../../components/Header";
import NewFinancialMove from "~/components/Modals/NewFinancialMove";
import { api } from "~/utils/api";
import {
  IUserProps,
  ExpenseType,
  EarningType,
  monthExpense,
} from "~/utils/types";
import { parseCookies } from "nookies";
import LoadingPage from "~/components/utils/LoadingPage";
import Link from "next/link";

type NewFinancialMovementModalProps = {
  state: boolean;
  moveType: "SAÍDA" | "ENTRADA";
};

type MonthsTextReferenceType = {
  [key: number]: string;
};
const monthsTextReference: MonthsTextReferenceType = {
  0: "JANEIRO",
  1: "FEVEREIRO",
  2: "MARÇO",
  3: "ABRIL",
  4: "MAIO",
  5: "JUNHO",
  6: "JULHO",
  7: "AGOSTO",
  8: "SETEMBRO",
  9: "OUTUBRO",
  10: "NOVEMBRO",
  11: "DEZEMBRO",
};
function getMonthDiff(d1: Date, d2: Date) {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}
const dateFilterStartReference = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  1
);

function FinancesMainPage() {
  var { userId } = parseCookies(null);
  const trpc = api.useContext();

  const [dateFilter, setDateFilter] = useState(dateFilterStartReference);

  const [newFinancialMovementModalIsOpen, setNewFinancialMovementModalIsOpen] =
    useState<NewFinancialMovementModalProps>({
      state: false,
      moveType: "SAÍDA",
    });

  const { data: user, isLoading: userLoading } = api.users.getUser.useQuery(
    userId ? userId : ""
  );

  const { data: userFinancialBalance } =
    api.finances.getUserFinancialBalance.useQuery(user ? user.id : "", {
      enabled: !!user,
    });
  const {
    data: expenses,
    isFetching,
    isLoading,
    isSuccess: expensesFetchSuccessfully,
    isError: expensesFetchError,
    status,
  } = api.finances.getMonthExpenses.useQuery(
    {
      id: user ? user.id : "",
      date: dateFilter,
    },
    {
      enabled: !!user,
    }
  );
  const {
    data: earnings,
    isFetching: areEarningsFetching,
    isLoading: areEarningsLoading,
    isSuccess: earningsFetchSuccessfully,
    status: earningAPIStatus,
  } = api.finances.getMonthEarnings.useQuery(
    {
      id: user ? user.id : "",
      date: dateFilter,
    },
    { enabled: !!user }
  );

  const { mutate: deleteExpense } = api.finances.deleteExpense.useMutation({
    onSuccess(data, variables, context) {
      trpc.finances.getMonthExpenses.invalidate();
      trpc.finances.getUserFinancialBalance.invalidate();
      toast.success("Gasto excluído !");
    },
    onError(error, variables, context) {
      toast.error(error.message);
    },
  });
  const { mutate: deleteEarning } = api.finances.deleteEarning.useMutation({
    onSuccess(data, variables, context) {
      trpc.finances.getMonthEarnings.invalidate();
      trpc.finances.getUserFinancialBalance.invalidate();
      toast.success("Ganho excluído !");
    },
    onError(error, variables, context) {
      toast.error(error.message);
    },
  });
  function getTotalSpend(expenses: ExpenseType[]): number {
    var totalSum = 0;
    if (expenses && expenses.length > 0) {
      for (let i = 0; i < expenses.length; i++) {
        const item = expenses[i];
        if (item) {
          let expenseValue = 0;
          expenseValue = item.value ? item.value : 0;

          totalSum = totalSum + expenseValue;
        }
      }
      return totalSum;
    } else return totalSum;
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
    } else return totalSum;
  }
  //   .color1 { #4e4d4a };
  // .color2 { #353432 };
  // .color3 { #94ba65 };
  // color {#ccff33}
  // .color4 { #2790b0 };
  // .color5 { #2b4e72 };
  // #ff0054
  function getPeriodText() {
    let month = dateFilter.getMonth();
    let monthText = monthsTextReference[month];
    let currentYear = dateFilter.getFullYear();
    return `${monthText} de ${currentYear}`;
  }
  function formatTextValueWithInstallments(
    value: number,
    installments: number,
    installmentIdentifier: number
  ) {
    return `${value}(${installmentIdentifier}/${installments})`;
  }
  console.log("BALANCE", userFinancialBalance);

  if (userLoading) return <LoadingPage />;
  return (
    <FullScreenWrapper>
      <Header />
      <div className="flex w-full grow flex-col bg-[#f8f9fa] p-6">
        <div className="mb-4 flex w-full flex-col items-start">
          <h1 className="w-full text-center text-xl font-bold lg:text-start">
            Olá,{" "}
            <strong className="text-[#2790b0]">
              {user?.name ? user.name : "..."}
            </strong>{" "}
            !
          </h1>
          <p className="w-full text-center text-sm text-gray-500 lg:text-start">
            Aqui você pode visualizar um resumo das suas movimentações
            financeiras.
          </p>
        </div>
        <div className="flex w-full flex-col rounded-xl bg-[#ccff33] p-2">
          <h1 className="w-full text-center text-xl font-light">MEU SALDO</h1>
          {expensesFetchSuccessfully && earningsFetchSuccessfully ? (
            <p className="w-full text-center text-xl">
              R$
              <strong className="ml-1 text-2xl">
                {userFinancialBalance?.toLocaleString("pt-br", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </p>
          ) : (
            <p className="w-full animate-pulse text-center">...</p>
          )}

          <div className="my-4 flex flex-col items-center justify-center gap-2 lg:flex-row">
            <button
              onClick={() =>
                setNewFinancialMovementModalIsOpen({
                  state: true,
                  moveType: "ENTRADA",
                })
              }
              className="flex w-[140px] items-center justify-center gap-2 rounded-xl bg-[#2790b0] p-2 text-xs font-medium text-white duration-300 ease-in hover:scale-105 lg:w-fit lg:text-base"
            >
              <RxDownload style={{ fontSize: "18px" }} />
              <p>Adicionar Entrada</p>
            </button>
            <button
              onClick={() =>
                setNewFinancialMovementModalIsOpen({
                  state: true,
                  moveType: "SAÍDA",
                })
              }
              className="flex w-[140px] items-center  justify-center gap-2 rounded-xl bg-[#ff0054] p-2 text-xs font-medium duration-300 ease-in hover:scale-105 lg:w-fit lg:text-base"
            >
              <RxUpload style={{ fontSize: "18px" }} />
              <p>Adicionar Gasto</p>
            </button>
          </div>

          <div className="flex flex-col">
            <p className="mb-2 text-center text-xl font-light">
              VISÃO GERAL DO PERÍODO
            </p>
            <div className="my-2 mb-5 flex items-center justify-center gap-4">
              <button
                onClick={() =>
                  setDateFilter(
                    (prevState) =>
                      new Date(
                        prevState.getFullYear(),
                        prevState.getMonth() - 1,
                        1
                      )
                  )
                }
                className="text-lg duration-300 ease-in-out hover:scale-110"
              >
                <AiFillCaretLeft />
              </button>
              <h1 className="font-medium">{getPeriodText()}</h1>
              <button
                onClick={() =>
                  setDateFilter(
                    (prevState) =>
                      new Date(
                        prevState.getFullYear(),
                        prevState.getMonth() + 1,
                        1
                      )
                  )
                }
                className="text-lg duration-300 ease-in-out hover:scale-110"
              >
                <AiFillCaretRight />
              </button>
            </div>
            <div className="flex w-full items-center justify-around gap-2">
              <div className="flex w-1/2 flex-col rounded-xl bg-[#fff] p-2 lg:w-1/3">
                <div className="grid w-full grid-cols-1  items-center lg:grid-cols-3">
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gray-800 text-white lg:h-[40px] lg:w-[40px]">
                    <RxDownload />
                  </div>
                  <h1 className="hidden text-center font-medium text-gray-500 lg:block">
                    ENTRADAS
                  </h1>
                  {/* <div className="flex items-center gap-1 text-[#2790b0]">
                    <BiTrendingUp />
                    <p>2,55%</p>
                  </div> */}
                  <div></div>
                </div>
                <h1 className="mt-2 block text-center text-xs font-light text-gray-500 lg:hidden">
                  ENTRADAS
                </h1>
                {earnings ? (
                  <p className="mt-2 w-full text-center text-2xl font-medium text-green-500">
                    R${" "}
                    {getTotalEarned(earnings).toLocaleString("pt-br", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                ) : (
                  <p className="w-full text-center text-2xl font-medium">...</p>
                )}
              </div>
              <div className="flex w-1/2 flex-col rounded-xl bg-[#fff] p-2 lg:w-1/3">
                <div className="grid w-full grid-cols-3 items-center">
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gray-800 text-white lg:h-[40px] lg:w-[40px]">
                    <RxUpload />
                  </div>
                  <h1 className="hidden text-center font-medium text-gray-500 lg:block">
                    SAÍDAS
                  </h1>
                  {/* <div className="flex items-center gap-1 text-[#2790b0]">
                    <BiTrendingUp />
                    <p>2,55%</p>
                  </div> */}
                  <div></div>
                </div>
                <h1 className="mt-2 block text-center text-xs font-light text-gray-500 lg:hidden">
                  SAÍDAS
                </h1>
                {expenses ? (
                  <p className="mt-2 w-full text-center text-2xl font-medium text-[#ff0054]">
                    R${" "}
                    {getTotalSpend(expenses).toLocaleString("pt-br", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                ) : (
                  <p className="w-full text-center text-2xl font-medium">...</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="my-4 flex w-full flex-col items-center">
          <p className="w-full text-center text-lg font-medium text-gray-500">
            Gostaria de uma análise mais detalhada ? Acesse a área de Analytics:
          </p>
          <Link href="/finances/analytics">
            <p className="text-md w-full cursor-pointer text-center font-medium text-[#2790b0] underline underline-offset-1">
              Clique aqui
            </p>
          </Link>
        </div>
        <div className="flex w-full flex-col py-2">
          <h1 className="mb-3 font-bold text-[#2790b0]">MEUS GANHOS</h1>
          <div className="flex grow flex-col flex-wrap gap-3 lg:flex-row lg:justify-start">
            {earnings?.map((earning) => (
              <div
                key={earning.id}
                className="flex max-h-[150px] w-full flex-col rounded border border-gray-200 bg-[#fff] p-4 shadow-md lg:w-[450px]"
              >
                <div className="flex items-center justify-between">
                  <h1 className="font-bold text-[#353432]">
                    {earning.description}
                  </h1>
                  <h1 className="font-bold text-green-500">
                    + R$ {earning.value.toFixed(2).replace(".", ",")}
                  </h1>
                </div>
                <div className="flex items-center justify-end text-xs">
                  <h1 className="text-[##4e4d4a]">
                    {new Date(earning.date).toLocaleDateString()}
                  </h1>
                </div>
                <div className="mt-2 flex items-center justify-end">
                  {/* <button className="text-xl text-orange-300 duration-300 ease-in-out hover:scale-110 hover:text-orange-500">
                    <FaEdit />
                  </button> */}
                  <button
                    onClick={() => deleteEarning(earning.id)}
                    className="text-xl text-red-300 duration-300 ease-in-out hover:scale-110 hover:text-[#ff0054]"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col  py-2 ">
          <h1 className="mb-3 font-bold text-[#ff0054]">MEUS GASTOS</h1>
          <div className="flex grow flex-col flex-wrap gap-3 lg:flex-row lg:justify-start">
            {expenses &&
              expenses?.map((expense) => (
                <div
                  key={expense.id}
                  className="flex max-h-[150px] w-full flex-col rounded border border-gray-200 bg-[#fff] p-4 shadow-lg lg:w-[450px]"
                >
                  <div className="flex items-center justify-between">
                    <h1 className="font-bold text-[#353432]">
                      {expense.description}
                    </h1>
                    <h1 className="font-bold text-red-500">
                      - R${" "}
                      {expense.installments && expense.installmentIdentifier
                        ? formatTextValueWithInstallments(
                            expense.value,
                            expense.installments,
                            expense.installmentIdentifier
                          )
                        : expense.value.toFixed(2).replace(".", ",")}
                    </h1>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <h1 className="font-medium text-[#2790b0]">
                      {expense.category}
                    </h1>
                    <h1 className="break-all text-[##4e4d4a]">
                      {new Date(expense.purchaseDate).toLocaleDateString()}
                    </h1>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <h1 className="text-xs font-medium text-[#4e4d4a]">
                      {expense.method}
                    </h1>
                    <div className="items-centert flex gap-3 lg:gap-1">
                      {/* <button className="text-xl text-orange-300 duration-300 ease-in-out hover:scale-110 hover:text-orange-500">
                        <FaEdit />
                      </button> */}
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="text-xl text-red-300 duration-300 ease-in-out hover:scale-110 hover:text-[#ff0054]"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* <div
          onClick={() => setNewFinancialMovementModalIsOpen(true)}
          className="left-150 text-md fixed bottom-10 cursor-pointer rounded-lg bg-[#2b4e72] p-3 text-white duration-300 ease-in-out hover:scale-110 hover:bg-[#2790b0]"
        >
          <IoMdAdd />
        </div> */}
      </div>
      {newFinancialMovementModalIsOpen && user ? (
        <NewFinancialMove
          user={user}
          modalIsOpen={newFinancialMovementModalIsOpen.state}
          initialMoveType={newFinancialMovementModalIsOpen.moveType}
          closeModal={() =>
            setNewFinancialMovementModalIsOpen({
              ...newFinancialMovementModalIsOpen,
              state: false,
            })
          }
        />
      ) : null}
    </FullScreenWrapper>
  );
}

export default FinancesMainPage;
