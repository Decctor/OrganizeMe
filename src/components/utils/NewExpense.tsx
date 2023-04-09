import React, { useState, useEffect } from "react";
import { IoMdAddCircle } from "react-icons/io";
import NewCategory from "./NewCategory";
import NewMethod from "./NewMethod";
import { IUserProps } from "~/utils/types";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import { AiOutlineClose } from "react-icons/ai";
type ExpenseType = {
  description: string;
  category: string;
  method: string;
  value: number;
  purchaseDate: Date;
  installments: null | number;
};
type InsertExpenseObj = {
  description: string;
  category: string;
  method: string;
  value: number;
  purchaseDate: Date;
  installments: null | number;
  maxLastInstallmentDate: null | Date;
  userId: string;
};

function addMonths(date: Date, monthsToAdd: number) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + monthsToAdd,
    date.getDate(),
    date.getHours()
  );
}

const expenseInput = z.object({
  description: z
    .string({ required_error: "Descreva o gasto." })
    .min(5, { message: "Por favor, descreva o gasto em ao menos 5 letras." }),
  category: z.string({ required_error: "Preencha um categoria de gasto." }),
  method: z.string({ required_error: "Preencha o método de pagamento." }),
  value: z
    .number({ required_error: "Preencha o valor do gasto." })
    .min(1, { message: "O valor mínimo do gasto é R$ 1,00." }),
  installments: z
    .number()
    .min(1, { message: "O número minímo de parcelas é 1." })
    .max(60, { message: "O número máximo de parcelas é 60." })
    .nullable(),
});
function NewExpense({ user, setUserInfo }: IUserProps & any) {
  const trpc = api.useContext();
  const [expenseInfo, setExpenseInfo] = useState<ExpenseType>({
    description: "",
    category: "NÃO DEFINIDO",
    method: "NÃO DEFINIDO",
    value: 0,
    purchaseDate: new Date(),
    installments: null,
  });
  const [aditionalInfo, setAditionalInfo] = useState({
    startPaymentAtPurchaseDate: false,
  });

  const [newCategoryVisible, setNewCategoryVisible] = useState(false);
  const [newMethodVisible, setNewMethodVisible] = useState(false);
  // Expense creation methods
  const { mutate: createExpense, isLoading } =
    api.finances.createExpense.useMutation({
      onSuccess: async (response) => {
        try {
          setExpenseInfo({
            description: "",
            category: "NÃO DEFINIDO",
            method: "NÃO DEFINIDO",
            value: 0,
            purchaseDate: new Date(),
            installments: null,
          });
          toast.success("Gasto adicionado !");
          await trpc.users.getUser.invalidate();
          await trpc.finances.getMonthExpenses.invalidate();
          await trpc.finances.getUserFinancialBalance.invalidate();
        } catch (error) {
          toast.error("Erro na invalidação de queries.");
        }
      },
    });
  const { mutate: createManyExpenses } =
    api.finances.createManyExpenses.useMutation({
      onSuccess: async (response) => {
        try {
          await trpc.users.getUser.invalidate();
          await trpc.finances.getMonthExpenses.invalidate();
          await trpc.finances.getUserFinancialBalance.invalidate();
          setExpenseInfo({
            description: "",
            category: "NÃO DEFINIDO",
            method: "NÃO DEFINIDO",
            value: 0,
            purchaseDate: new Date(),
            installments: null,
          });
          toast.success("Gastos adicionado !");
        } catch (error) {
          toast.error("Erro na invalidação de queries.");
        }
      },
    });

  // User expense categories and methods creation
  const { mutate: createCategory } = api.finances.createCategory.useMutation({
    onSuccess(data, variables, context) {
      trpc.users.getUser.invalidate();
      if (newCategoryVisible) setNewCategoryVisible(false);
      toast.success("Categoria criada !");
      trpc.users.getUser.invalidate();
      return;
    },
  });
  const { mutate: createMethod } = api.finances.createMethod.useMutation({
    onSuccess(data, variables, context) {
      trpc.users.getUser.invalidate();
      if (newMethodVisible) setNewMethodVisible(false);
      toast.success("Método de pagamento criado !");
      trpc.users.getUser.invalidate();
      return;
    },
  });

  // Handler
  async function handleExpenseAdd() {
    const result = await expenseInput.safeParseAsync(expenseInfo);
    if (expenseInfo.category == "NÃO DEFINIDO") {
      toast.error("Categoria não pode ser NÃO DEFINIDO");
      return;
    }
    if (expenseInfo.method == "NÃO DEFINIDO") {
      toast.error("Método de pagamento não pode ser NÃO DEFINIDO");
      return;
    }
    if (result.success === false) {
      toast.error(
        result.error.issues[0]?.message
          ? result.error.issues[0]?.message
          : "Erro no formulário"
      );
    } else {
      // Passed through validations
      if (expenseInfo.installments && expenseInfo.installments > 0) {
        // For expenses with installments, create multiple documents
        var arrObjs = [];
        for (let i = 0; i < expenseInfo.installments; i++) {
          let monthsToAdd = aditionalInfo.startPaymentAtPurchaseDate
            ? i
            : i + 1;
          let obj = {
            description: expenseInfo.description,
            category: expenseInfo.category,
            method: expenseInfo.method,
            value: Number(
              (expenseInfo.value / expenseInfo.installments).toFixed(2)
            ),
            purchaseDate: expenseInfo.purchaseDate,
            paymentDate: addMonths(expenseInfo.purchaseDate, monthsToAdd),
            installments: expenseInfo.installments,
            installmentIdentifier: i + 1,
            userId: user ? user.id : "",
          };
          arrObjs.push(obj);
        }
        console.log("ARRAY DE EXPENSES", arrObjs);
        if (user) createManyExpenses(arrObjs);
      } else {
        // For expenses with no installments, create individual document
        if (user)
          console.log("EXPENSE INDIVIDUAL", {
            ...expenseInfo,
            paymentDate: expenseInfo.purchaseDate,
            userId: user.id,
          });
        createExpense({
          ...expenseInfo,
          paymentDate: expenseInfo.purchaseDate,
          userId: user.id,
        });
      }
    }
  }
  async function handleCreateCategory(name: string) {
    if (user?.id) {
      createCategory({ name: name, userId: user.id });
    }
  }
  async function handleCreateMethod(name: string) {
    if (user?.id) {
      createMethod({ name: name, userId: user.id });
      return;
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full flex-col items-center">
        <h1 className="w-full  text-center font-[Roboto] text-lg font-bold text-[#353432]">
          DESCRIÇÃO DO GASTO
        </h1>
        <input
          value={expenseInfo.description}
          onChange={(e) =>
            setExpenseInfo({ ...expenseInfo, description: e.target.value })
          }
          type="text"
          className="w-full p-2 text-center text-xs outline-none"
          placeholder="DESCREVA AQUI O GASTO"
        />
      </div>
      <div className="flex w-full flex-col items-center gap-1">
        <div className="flex w-full items-center justify-center gap-2">
          <h1 className="text-center font-[Roboto] text-lg font-bold text-[#353432]">
            CATEGORIA DO GASTO
          </h1>
          {newCategoryVisible ? (
            <AiOutlineClose
              onClick={() => setNewCategoryVisible(false)}
              style={{ color: "rgb(239,68,68)", cursor: "pointer" }}
            />
          ) : (
            <IoMdAddCircle
              onClick={() => setNewCategoryVisible(true)}
              style={{ color: "rgb(34,197,94)", cursor: "pointer" }}
            />
          )}
        </div>
        {newCategoryVisible ? (
          <NewCategory handleCreateCategory={handleCreateCategory} />
        ) : (
          <div className="flex w-full items-center gap-2">
            {user?.categories && user?.categories?.length > 0 ? (
              <select
                value={expenseInfo.category}
                onChange={(e) =>
                  setExpenseInfo({
                    ...expenseInfo,
                    category: e.target.value,
                  })
                }
                className="grow bg-transparent p-2 text-center text-xs outline-none"
              >
                {user.categories.map((category: { name: string }) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
                <option value={"NÃO DEFINIDO"}>NÃO DEFINIDO</option>
              </select>
            ) : (
              <p className="grow text-center text-xs italic text-gray-500">
                Sem categorias cadastradas
              </p>
            )}
          </div>
        )}
      </div>
      <div className="flex w-full flex-col items-center gap-1">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-center font-[Roboto] text-lg font-bold text-[#353432]">
            MÉTODO DE PAGAMENTO
          </h1>
          {newMethodVisible ? (
            <AiOutlineClose
              onClick={() => setNewMethodVisible(false)}
              style={{ color: "rgb(239,68,68)", cursor: "pointer" }}
            />
          ) : (
            <IoMdAddCircle
              onClick={() => setNewMethodVisible(true)}
              style={{ color: "rgb(34,197,94)", cursor: "pointer" }}
            />
          )}
        </div>
        {newMethodVisible ? (
          <NewMethod handleCreateMethod={handleCreateMethod} />
        ) : (
          <div className="flex w-full items-center gap-2">
            {user?.methods && user?.methods?.length > 0 ? (
              <select
                value={expenseInfo.method}
                onChange={(e) =>
                  setExpenseInfo({ ...expenseInfo, method: e.target.value })
                }
                className="grow bg-transparent p-2 text-center text-xs outline-none"
              >
                {user.methods.map((method: { name: string }) => (
                  <option key={method.name} value={method.name}>
                    {method.name}
                  </option>
                ))}
                <option value={"NÃO DEFINIDO"}>NÃO DEFINIDO</option>
              </select>
            ) : (
              <p className="grow text-center text-xs italic text-gray-500">
                Sem métodos de pagamento adicionados
              </p>
            )}
          </div>
        )}
      </div>
      <div className="flex w-full flex-col items-center gap-1">
        <h1 className="text-center font-[Roboto] text-lg font-bold text-[#353432]">
          DATA DE COMPRA
        </h1>
        <input
          value={dayjs(expenseInfo.purchaseDate).format("YYYY-MM-DD")}
          onChange={(e) =>
            setExpenseInfo({
              ...expenseInfo,
              purchaseDate: dayjs(e.target.value).isValid()
                ? new Date(dayjs(e.target.value).add(4, "hours").toISOString())
                : new Date(),
            })
          }
          type="date"
          className="w-full grow bg-transparent p-2 text-center text-xs outline-none"
        />
      </div>
      <div className="flex w-full flex-col items-center gap-1">
        <h1 className="text-center font-[Roboto] text-lg font-bold text-[#353432]">
          VALOR GASTO
        </h1>
        <input
          value={expenseInfo.value.toString()}
          onChange={(e) =>
            setExpenseInfo({
              ...expenseInfo,
              value: Number(e.target.value),
            })
          }
          type="number"
          className="w-full grow bg-transparent p-2 text-center text-xs outline-none"
          placeholder="DESCREVA AQUI O VALOR GASTO"
        />
      </div>
      <div className="flex w-full flex-col items-center gap-1">
        <h1 className="text-center font-[Roboto] text-lg font-bold text-[#353432]">
          PARCELAMENTO
        </h1>
        <div className="flex-box flex w-full">
          <div className="flex w-full items-center justify-center gap-2">
            <input
              checked={
                expenseInfo.installments != null && expenseInfo.installments > 0
              }
              onChange={(e) =>
                setExpenseInfo((prev) => ({
                  ...prev,
                  installments: prev.installments ? null : 1,
                }))
              }
              name={"applyInstallments"}
              id={"applyInstallments"}
              type={"checkbox"}
            />
            <label
              htmlFor="applyInstallments"
              className="text-xs text-gray-500"
            >
              {!expenseInfo.installments ? "NÃO PARCELADO" : "PARCELADO"}
            </label>
          </div>
        </div>
        {expenseInfo.installments && expenseInfo.installments > 0 ? (
          <>
            <h1 className="mt-2 w-full text-center text-xs font-medium text-[#2b4e72]">
              NÚMERO DE PARCELAS
            </h1>
            <input
              value={expenseInfo.installments.toString()}
              onChange={(e) =>
                setExpenseInfo({
                  ...expenseInfo,
                  installments: Math.ceil(Number(e.target.value)),
                })
              }
              type="number"
              className="w-full p-1 text-center text-xs outline-none"
              placeholder="DESCREVA AQUI O VALOR GASTO"
            />
            <select
              value={
                aditionalInfo.startPaymentAtPurchaseDate
                  ? "INICIAR PARCELAMENTO NO MÊS DE COMPRA"
                  : "INICIAR PARCELAMENTO NO MÊS SEGUINTE"
              }
              onChange={(e) =>
                setAditionalInfo({
                  ...aditionalInfo,
                  startPaymentAtPurchaseDate:
                    e.target.value == "INICIAR PARCELAMENTO NO MÊS DE COMPRA",
                })
              }
              className="grow text-center text-xs outline-none"
            >
              <option value={"INICIAR PARCELAMENTO NO MÊS DE COMPRA"}>
                INICIAR PARCELAMENTO NO MÊS DE COMPRA
              </option>
              <option value={"INICIAR PARCELAMENTO NO MÊS SEGUINTE"}>
                INICIAR PARCELAMENTO NO MÊS SEGUINTE
              </option>
            </select>
          </>
        ) : null}
      </div>
      <div className="mb-2 flex items-center justify-center">
        <button
          disabled={isLoading}
          onClick={handleExpenseAdd}
          className="rounded border border-[#2b4e72] p-2  text-sm font-bold text-[#2b4e72] duration-300 ease-in-out disabled:border-gray-400 disabled:bg-gray-400 disabled:text-white  enabled:hover:scale-105 enabled:hover:bg-[#2b4e72] enabled:hover:text-white"
        >
          {isLoading ? "CARREGANDO" : "ADICIONAR GASTO"}
        </button>
      </div>
    </div>
  );
}

export default NewExpense;
