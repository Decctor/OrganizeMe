import React, { useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import AnimatedModalWrapper from "../wrappers/AnimatedModalWrapper";
import { toast } from "react-hot-toast";
import { boolean, z } from "zod";
import { IoMdAddCircle } from "react-icons/io";
import { api } from "~/utils/api";
import { IUserProps } from "~/utils/types";
import NewCategory from "../utils/NewCategory";
import NewMethod from "../utils/NewMethod";
import NewExpense from "../utils/NewExpense";
import NewEarning from "../utils/NewEarning";

type NewFinancialMoveProps = {
  modalIsOpen: boolean;
  closeModal: () => void;
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
  const [moveType, setMoveType] = useState<"SAÍDA" | "ENTRADA">("SAÍDA");

  const [userInfo, setUserInfo] = useState(user);

  // Create function from server
  // const { mutate: createExpense } = api.finances.createExpense.useMutation({
  //   onSuccess: async (response) => {
  //     trpc.users.getUser.invalidate();
  //     trpc.finances.getExpenses.invalidate();
  //     toast.success("Gasto adicionado !");
  //   },
  // });
  // const { mutate: createCategory } = api.finances.createCategory.useMutation({
  //   onSuccess(data, variables, context) {
  //     console.log("PASSEI AQUI", data, variables, context);
  //     if (data) setUserInfo(data);
  //     if (newCategoryVisible) setNewCategoryVisible(false);
  //     toast.success("Categoria criada !");
  //     trpc.users.getUser.invalidate();
  //     return;
  //   },
  // });
  // const { mutate: createMethod } = api.finances.createMethod.useMutation({
  //   onSuccess(data, variables, context) {
  //     console.log("PASSEI AQUI", data, variables, context);
  //     if (data) setUserInfo(data);
  //     if (newMethodVisible) setNewMethodVisible(false);
  //     toast.success("Método de pagamento criado !");
  //     trpc.users.getUser.invalidate();
  //     return;
  //   },
  // });

  // async function handleExpenseAdd() {
  //   let result = await expenseInput.safeParseAsync(expenseInfo);
  //   if (expenseInfo.category == "NÃO DEFINIDO") {
  //     toast.error("Categoria não pode ser NÃO DEFINIDO");
  //     return;
  //   }
  //   if (expenseInfo.method == "NÃO DEFINIDO") {
  //     toast.error("Método de pagamento não pode ser NÃO DEFINIDO");
  //     return;
  //   }
  //   if (result.success === false) {
  //     toast.error(
  //       result.error.issues[0]?.message
  //         ? result.error.issues[0]?.message
  //         : "Erro no formulário"
  //     );
  //   } else {
  //     if (user) createExpense({ ...expenseInfo, userId: user.id });
  //   }

  //   // if (result.success)
  //   //   mutate({ ...expenseInfo, userId: "clfe9204c0000uxb4e0bo4uqz" });
  //   // else {
  //   //   console.log(result);
  //   //   toast.error(result.error.format()._errors.join("\n"));
  //   // }
  // }
  // async function handleCreateCategory(name: string) {
  //   console.log("CATEGORY");
  //   if (user?.id) {
  //     createCategory({ name: name, userId: user.id });
  //   }
  // }
  // async function handleCreateMethod(name: string) {
  //   if (user?.id) {
  //     createMethod({ name: name, userId: user.id });
  //     return;
  //   }
  // }
  // console.log(user);
  // console.log("Query status", status);
  return (
    <AnimatedModalWrapper modalIsOpen={modalIsOpen} height="50%" width="30%">
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 p-2">
          <h1 className="text-sm font-bold text-[#2b4e72]">
            NOVA MOVIMENTAÇÃO FINANCEIRA
          </h1>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => closeModal()}
              className="flex items-center justify-center transition duration-300 ease-in-out hover:scale-125"
            >
              <VscChromeClose style={{ color: "red" }} />
            </button>
          </div>
        </div>
        <div className="overscroll-y my-2 flex grow flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
          <div className="flex items-center justify-center gap-2">
            <h1
              onClick={() => setMoveType("SAÍDA")}
              className={`cursor-pointer rounded border-2 border-red-500 p-1 font-bold text-red-500 ${
                moveType == "SAÍDA" ? "opacity-100" : "opacity-30"
              }`}
            >
              SAÍDA
            </h1>
            <h1
              onClick={() => setMoveType("ENTRADA")}
              className={`cursor-pointer rounded border-2 border-green-500 p-1 font-bold text-green-500 ${
                moveType == "ENTRADA" ? "opacity-100" : "opacity-30"
              }`}
            >
              ENTRADA
            </h1>
          </div>
          {moveType == "SAÍDA" ? (
            <NewExpense user={userInfo} setUserInfo={setUserInfo} />
          ) : null}
          {moveType == "ENTRADA" ? <NewEarning user={userInfo} /> : null}
        </div>
      </div>
    </AnimatedModalWrapper>
  );
}

export default NewFinancialMove;
