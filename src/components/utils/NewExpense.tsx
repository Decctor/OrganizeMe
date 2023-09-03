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
import TextInput from "../Inputs/TextInput";
import { formatDate } from "~/utils/methods/formatting";
import SelectInput from "../Inputs/SelectInput";
import NumberInput from "../Inputs/NumberInput";
import DateInput from "../Inputs/DateInput";
type ExpenseType = {
  description: string;
  category: string | null;
  method: string | null;
  value: number;
  purchaseDate: Date | string;
  paymentDate: Date | string;
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

  const { data: paymentMethods } = api.finances.getUserPaymentMethods.useQuery(
    user.id
  );
  const { data: expenseCategories } =
    api.finances.getUserExpenseCategories.useQuery(user.id);
  const [expenseInfo, setExpenseInfo] = useState<ExpenseType>({
    description: "",
    category: null,
    method: null,
    value: 0,
    purchaseDate: new Date().toISOString(),
    paymentDate: new Date().toISOString(),
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
            category: null,
            method: null,
            value: 0,
            purchaseDate: new Date(),
            paymentDate: new Date(),
            installments: null,
          });
          toast.success("Gasto adicionado !");
          await trpc.users.getUser.invalidate();
          await trpc.finances.getMonthExpenses.cancel();
          await trpc.finances.getUserFinancialBalance.cancel();
        } catch (error) {
          toast.error("Erro na invalidação de queries.");
        }
      },
      onSettled: async () => {
        await trpc.finances.getMonthExpenses.invalidate();
        await trpc.finances.getUserFinancialBalance.invalidate();
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
            category: null,
            method: null,
            value: 0,
            purchaseDate: new Date(),
            paymentDate: new Date(),
            installments: null,
          });
          toast.success("Gastos adicionado !");
        } catch (error) {
          toast.error("Erro na invalidação de queries.");
        }
      },
    });

  // User expense categories and payment methods creation
  const { mutate: createCategory } = api.finances.createCategory.useMutation({
    onMutate: async (newCategory) => {
      await trpc.finances.getUserExpenseCategories.cancel();
      const previousCategories =
        await trpc.finances.getUserExpenseCategories.getData();
      trpc.finances.getUserExpenseCategories.setData(user.id, (old) => {
        console.log("OLD CATEGORIES", old);
        if (old) return [...old, { ...newCategory, id: -1 }];
        else return [{ ...newCategory, id: -1 }];
      });
      toast.success("Categoria criada com sucesso! ");
      setNewCategoryVisible(false);
      return { previousCategories };
    },
    onError(err, newCategory, ctx) {
      // If the mutation fails, use the context-value from onMutate
      trpc.finances.getUserExpenseCategories.setData(
        user.id,
        ctx?.previousCategories
      );
      toast.error("Oops, algo deu errado na criação de uma nova categoria.");
    },
    onSettled() {
      trpc.finances.getUserExpenseCategories.invalidate();
    },
  });
  const { mutate: createMethod } = api.finances.createMethod.useMutation({
    onMutate: async (newMethod) => {
      await trpc.finances.getUserPaymentMethods.cancel();
      const previousMethods =
        await trpc.finances.getUserPaymentMethods.getData();
      trpc.finances.getUserPaymentMethods.setData(user.id, (old) => {
        console.log("OLD METHODS", old);
        if (old) return [...old, { ...newMethod, id: -1 }];
        else return [{ ...newMethod, id: -1 }];
      });
      toast.success("Método de pagamento criado com sucesso! ");
      setNewMethodVisible(false);
      return { previousMethods };
    },
    onError(err, newMethod, ctx) {
      // If the mutation fails, use the context-value from onMutate
      trpc.finances.getUserPaymentMethods.setData(
        user.id,
        ctx?.previousMethods
      );
      toast.error(
        "Oops, algo deu errado na criação de uma novo método de pagamento."
      );
    },
    onSettled() {
      trpc.finances.getUserPaymentMethods.invalidate();
    },
  });

  // Handler
  async function handleExpenseAdd() {
    const result = await expenseInput.safeParseAsync(expenseInfo);
    if (!expenseInfo.category) {
      toast.error("Categoria não pode ser NÃO DEFINIDO");
      return;
    }
    if (!expenseInfo.method) {
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
            purchaseDate: new Date(expenseInfo.purchaseDate),
            paymentDate: addMonths(
              new Date(expenseInfo.purchaseDate),
              monthsToAdd
            ),
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
        createExpense({
          ...expenseInfo,
          category: expenseInfo.category as string,
          method: expenseInfo.method as string,
          purchaseDate: new Date(expenseInfo.purchaseDate),
          paymentDate: new Date(expenseInfo.paymentDate),
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
  console.log(expenseInfo);
  return (
    <div className="flex w-full flex-col gap-3 overflow-x-hidden">
      <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
        <div className="w-full lg:w-[50%]">
          <TextInput
            label="DESCRIÇÃO"
            placeholder="Descreva ou nomeie aqui o gasto..."
            value={expenseInfo.description}
            handleChange={(value) =>
              setExpenseInfo((prev) => ({ ...prev, description: value }))
            }
          />
        </div>
        <div className="w-full lg:w-[50%]">
          <DateInput
            value={
              expenseInfo.purchaseDate
                ? formatDate(expenseInfo.purchaseDate)
                : undefined
            }
            showLabel={true}
            label="DATA DE COMPRA"
            editable={true}
            labelClassName="font-Poppins text-sm font-black tracking-tight text-gray-700"
            handleChange={(value) =>
              setExpenseInfo((prev) => ({
                ...prev,
                purchaseDate: value
                  ? new Date(value).toISOString()
                  : new Date().toISOString(),
              }))
            }
            width="100%"
          />
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
        <div className="flex w-full flex-col gap-1 lg:w-[50%]">
          <SelectInput
            label="CATEGORIA"
            value={expenseInfo.category}
            options={
              expenseCategories
                ? expenseCategories.map((category) => {
                    return {
                      id: category.id,
                      label: category.name,
                      value: category.name,
                    };
                  })
                : []
            }
            handleChange={(value) =>
              setExpenseInfo((prev) => ({ ...prev, category: value }))
            }
            selectedItemLabel="NÃO DEFINIDO"
            width="100%"
            onReset={() =>
              setExpenseInfo((prev) => ({ ...prev, category: null }))
            }
          />
          {newCategoryVisible ? (
            <NewCategory
              handleCreateCategory={handleCreateCategory}
              closeMenu={() => setNewCategoryVisible(false)}
            />
          ) : (
            <p
              onClick={() => setNewCategoryVisible(true)}
              className="w-full cursor-pointer text-center text-sm italic text-green-400 duration-500 ease-in-out hover:scale-105"
            >
              Adicionar nova categoria de gastos
            </p>
          )}
        </div>
        <div className="flex w-full flex-col gap-1 lg:w-[50%]">
          <SelectInput
            label="MÉTODO"
            value={expenseInfo.method}
            options={
              paymentMethods
                ? paymentMethods.map((method) => {
                    return {
                      id: method.id,
                      label: method.name,
                      value: method.name,
                    };
                  })
                : []
            }
            handleChange={(value) =>
              setExpenseInfo((prev) => ({ ...prev, method: value }))
            }
            selectedItemLabel="NÃO DEFINIDO"
            width="100%"
            onReset={() =>
              setExpenseInfo((prev) => ({ ...prev, method: null }))
            }
          />
          {newMethodVisible ? (
            <NewMethod
              handleCreateMethod={handleCreateMethod}
              closeMenu={() => setNewMethodVisible(false)}
            />
          ) : (
            <p
              onClick={() => setNewMethodVisible(true)}
              className="w-full cursor-pointer text-center text-sm italic text-green-400 duration-500 ease-in-out hover:scale-105"
            >
              Adicionar novo método de pagamento
            </p>
          )}
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
        <div className="w-full lg:w-[50%]">
          <NumberInput
            label="VALOR DO GASTO"
            placeholder="Preencha aqui o valor cheio do gasto..."
            value={expenseInfo.value}
            handleChange={(value) =>
              setExpenseInfo((prev) => ({ ...prev, value: value }))
            }
            width="100%"
          />
        </div>
        <div className="w-full lg:w-[50%]">
          <DateInput
            value={
              expenseInfo.paymentDate
                ? formatDate(expenseInfo.paymentDate)
                : undefined
            }
            showLabel={true}
            label="DATA DE PAGAMENTO"
            editable={true}
            labelClassName="font-Poppins text-sm font-black tracking-tight text-gray-700"
            handleChange={(value) =>
              setExpenseInfo((prev) => ({
                ...prev,
                paymentDate: value
                  ? new Date(value).toISOString()
                  : new Date().toISOString(),
              }))
            }
            width="100%"
          />
          {/* <div className={`flex w-full flex-col gap-1`}>
            <label
              htmlFor={"paymentDate"}
              className={
                "font-Poppins text-sm font-black tracking-tight text-gray-700"
              }
            >
              DATA DE PAGAMENTO
            </label>
            <input
              value={formatDate(expenseInfo.purchaseDate)}
              onChange={(e) =>
                setExpenseInfo((prev) => ({
                  ...prev,
                  purchaseDate: new Date(e.target.value),
                }))
              }
              onReset={() =>
                setExpenseInfo((prev) => ({
                  ...prev,
                  purchaseDate: new Date(),
                }))
              }
              id={"purchaseDate"}
              type="date"
              placeholder={"Preencha aqui a data de compra..."}
              className="w-full rounded-md border border-gray-200 p-3 text-sm outline-none placeholder:italic"
            />
          </div> */}
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-1">
        <h1 className="font-Poppins text-sm font-black tracking-tight text-gray-700">
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
