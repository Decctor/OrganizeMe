import React, { useState } from "react";
import { IoMdAddCircle } from "react-icons/io";
import NewCategory from "./NewCategory";
import NewMethod from "./NewMethod";
import { IUserProps } from "~/utils/types";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { api } from "~/utils/api";
import dayjs from "dayjs";
type ExpenseType = {
  description: string;
  category: string;
  method: string;
  value: number;
  purchaseDate: Date;
};

const expenseInput = z.object({
  description: z
    .string({ required_error: "Descreva o gasto." })
    .min(5, { message: "Por favor, descreva o gasto em ao menos 5 letras." }),
  category: z.string({ required_error: "Preencha um categoria de gasto." }),
  method: z.string({ required_error: "Preencha o método de pagamento." }),
  value: z
    .number({ required_error: "Preencha o valor do gasto." })
    .min(1, { message: "O valor mínimo do gasto é R$ 1,00." }),
});
function NewExpense({ user, setUserInfo }: IUserProps & any) {
  const trpc = api.useContext();
  const [expenseInfo, setExpenseInfo] = useState<ExpenseType>({
    description: "",
    category: "NÃO DEFINIDO",
    method: "NÃO DEFINIDO",
    value: 0,
    purchaseDate: new Date(),
  });
  const [newCategoryVisible, setNewCategoryVisible] = useState(false);
  const [newMethodVisible, setNewMethodVisible] = useState(false);

  const { mutate: createExpense } = api.finances.createExpense.useMutation({
    onSuccess: async (response) => {
      try {
        await trpc.users.getUser.invalidate();
        await trpc.finances.getExpenses.invalidate();
        setExpenseInfo({
          description: "",
          category: "NÃO DEFINIDO",
          method: "NÃO DEFINIDO",
          value: 0,
          purchaseDate: new Date(),
        });
        toast.success("Gasto adicionado !");
      } catch (error) {
        toast.error("Erro na invalidação de queries.");
      }
    },
  });
  const { mutate: createCategory } = api.finances.createCategory.useMutation({
    onSuccess(data, variables, context) {
      console.log("PASSEI AQUI", data, variables, context);

      if (data) setUserInfo(data);
      if (newCategoryVisible) setNewCategoryVisible(false);
      toast.success("Categoria criada !");
      trpc.users.getUser.invalidate();
      return;
    },
  });
  const { mutate: createMethod } = api.finances.createMethod.useMutation({
    onSuccess(data, variables, context) {
      console.log("PASSEI AQUI", data, variables, context);
      if (data) setUserInfo(data);
      if (newMethodVisible) setNewMethodVisible(false);
      toast.success("Método de pagamento criado !");
      trpc.users.getUser.invalidate();
      return;
    },
  });

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
      if (user) createExpense({ ...expenseInfo, userId: user.id });
    }

    // if (result.success)
    //   mutate({ ...expenseInfo, userId: "clfe9204c0000uxb4e0bo4uqz" });
    // else {
    //   console.log(result);
    //   toast.error(result.error.format()._errors.join("\n"));
    // }
  }
  async function handleCreateCategory(name: string) {
    console.log("CATEGORY");
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
    <>
      <div className="flex w-full flex-col items-center gap-1">
        <h1 className="text-center font-[Roboto] text-lg font-bold text-[#2790b0]">
          DESCRIÇÃO DO GASTO
        </h1>
        <input
          value={expenseInfo.description}
          onChange={(e) =>
            setExpenseInfo({ ...expenseInfo, description: e.target.value })
          }
          type="text"
          className="w-full p-1 text-center text-xs outline-none"
          placeholder="DESCREVA AQUI O GASTO"
        />
      </div>
      <div className="flex w-full flex-col items-center gap-1">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-center font-[Roboto] text-lg font-bold text-[#2790b0]">
            CATEGORIA DO GASTO
          </h1>
          <IoMdAddCircle
            onClick={() => setNewCategoryVisible(true)}
            style={{ color: "rgb(34,197,94)", cursor: "pointer" }}
          />
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
                className="grow text-center text-xs outline-none"
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
          <h1 className="text-center font-[Roboto] text-lg font-bold text-[#2790b0]">
            MÉTODO DE PAGAMENTO
          </h1>
          <IoMdAddCircle
            onClick={() => setNewMethodVisible(true)}
            style={{ color: "rgb(34,197,94)", cursor: "pointer" }}
          />
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
                className="grow text-center text-xs outline-none"
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
        <h1 className="text-center font-[Roboto] text-lg font-bold text-[#2790b0]">
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
          className="w-full p-1 text-center text-xs outline-none"
        />
      </div>
      <div className="flex w-full flex-col items-center gap-1">
        <h1 className="text-center font-[Roboto] text-lg font-bold text-[#2790b0]">
          VALOR GASTO
        </h1>
        <input
          value={expenseInfo.value}
          onChange={(e) =>
            setExpenseInfo({
              ...expenseInfo,
              value: Number(e.target.value),
            })
          }
          type="number"
          className="w-full p-1 text-center text-xs outline-none"
          placeholder="DESCREVA AQUI O VALOR GASTO"
        />
      </div>
      <div className="flex items-center justify-center">
        <button
          onClick={handleExpenseAdd}
          className="rounded border border-[#2b4e72] p-2 text-sm font-bold text-[#2b4e72] duration-300 ease-in-out hover:scale-105 hover:bg-[#2b4e72] hover:text-white"
        >
          ADICIONAR GASTO
        </button>
      </div>
    </>
  );
}

export default NewExpense;
