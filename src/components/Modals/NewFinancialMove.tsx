import React, { useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import AnimatedModalWrapper from "../wrappers/AnimatedModalWrapper";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { IoMdAddCircle } from "react-icons/io";
import { api } from "~/utils/api";
import { IUserProps } from "~/utils/types";
import NewCategory from "../utils/NewCategory";
import NewMethod from "../utils/NewMethod";
const MODAL_STYLES = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-50%)",
  backgroundColor: "#fff",
  minWidth: "40%",
  height: "87%",
  borderRadius: "5px",
  padding: "10px",
  zIndex: 1000,
};
const OVERLAY_STYLES = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,.7)",
  zIndex: 1000,
};
type NewFinancialMoveProps = {
  modalIsOpen: boolean;
  closeModal: any;
};
type ExpenseType = {
  description: string;
  category: string;
  method: string;
  value: number;
};
const expenseInput = z.object({
  description: z
    .string({ required_error: "Descreva o gasto." })
    .min(5, { message: "Por favor, descreva o gasto em ao menos 5 letras." }),
  category: z.string({ required_error: "Preencha um categoria de gasto." }),
  method: z.string({ required_error: "Preencha o método de pagamento." }),
  value: z
    .number({ required_error: "Preencha o valor do gasto." })
    .min(1, { message: "O valor mínimo do gasto é R$1." }),
});
function NewFinancialMove({
  modalIsOpen,
  closeModal,
  user,
}: NewFinancialMoveProps & IUserProps) {
  const trpc = api.useContext();

  const [newCategoryVisible, setNewCategoryVisible] = useState(false);
  const [newMethodVisible, setNewMethodVisible] = useState(false);

  const [userInfo, setUserInfo] = useState(user);
  const [expenseInfo, setExpenseInfo] = useState<ExpenseType>({
    description: "",
    category: "NÃO DEFINIDO",
    method: "NÃO DEFINIDO",
    value: 0,
  });
  // Create function from server
  const { mutate: createExpense } = api.finances.createExpense.useMutation({
    onSuccess: async (response) => {
      trpc.users.getUser.invalidate();
      trpc.finances.getExpenses.invalidate();
      toast.success("Gasto adicionado !");
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
    onSettled: async (response) => {
      if (newMethodVisible) setNewMethodVisible(false);

      trpc.users.getUser.refetch();
    },
  });

  async function handleExpenseAdd() {
    let result = await expenseInput.safeParseAsync(expenseInfo);
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
      await createMethod({ name: name, userId: user.id });
      return;
    }
  }
  // console.log(user);
  // console.log("Query status", status);
  return (
    <AnimatedModalWrapper modalIsOpen={modalIsOpen} height="60%" width="40%">
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 p-2">
          <h1 className="text-sm font-bold text-[#2b4e72]">
            NOVA MOVIMENTAÇÃO FINANCEIRA
          </h1>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => closeModal()}
              className="flex items-center justify-center transition duration-300 ease-in-out hover:scale-125"
            >
              <VscChromeClose style={{ color: "red" }} />
            </button>
          </div>
        </div>
        <div className="overscroll-y scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 my-2 flex grow flex-col gap-2 overflow-y-auto">
          <div className="flex w-full flex-col items-center gap-1">
            <h1 className="text-center font-[Roboto] text-sm font-bold text-[#2790b0]">
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
              <h1 className="text-center font-[Roboto] text-sm font-bold text-[#2790b0]">
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
                {userInfo?.categories && userInfo?.categories?.length > 0 ? (
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
                    {userInfo.categories.map((category) => (
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
              <h1 className="text-center font-[Roboto] text-sm font-bold text-[#2790b0]">
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
                {userInfo?.methods && userInfo?.methods?.length > 0 ? (
                  <select
                    value={expenseInfo.method}
                    onChange={(e) =>
                      setExpenseInfo({ ...expenseInfo, method: e.target.value })
                    }
                    className="grow text-center text-xs outline-none"
                  >
                    {userInfo.methods.map((method) => (
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
            <h1 className="text-center font-[Roboto] text-sm font-bold text-[#2790b0]">
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
              className="rounded border border-[#2b4e72] p-2 text-xs font-bold text-[#2b4e72] duration-300 ease-in-out hover:scale-105 hover:bg-[#2b4e72] hover:text-white"
            >
              ADICIONAR GASTO
            </button>
          </div>
        </div>
      </div>
    </AnimatedModalWrapper>
  );
}

export default NewFinancialMove;
