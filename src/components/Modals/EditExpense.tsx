import { Categories, Expenses } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import {
  backdropFramerMotionConfig,
  modalFramerMotionConfig,
} from "~/utils/constants";
import TextInput from "../Inputs/TextInput";
import { ExpenseType } from "~/utils/types";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/methods/formatting";
import SelectInput from "../Inputs/SelectInput";
import NewCategory from "../utils/NewCategory";
import NumberInput from "../Inputs/NumberInput";
import NewMethod from "../utils/NewMethod";
import toast from "react-hot-toast";
type EditExpenseProps = {
  closeModal: () => void;
  expense: Expenses;
  userId: string;
};
function EditExpense({ closeModal, expense, userId }: EditExpenseProps) {
  const trpc = api.useContext();
  const { data: paymentMethods } =
    api.finances.getUserPaymentMethods.useQuery(userId);
  const { data: expenseCategories } =
    api.finances.getUserExpenseCategories.useQuery(userId);

  const [newCategoryVisible, setNewCategoryVisible] = useState(false);
  const [newMethodVisible, setNewMethodVisible] = useState(false);
  const [infoHolder, setInfoHolder] = useState<Expenses>(expense);
  const [aditionalInfo, setAditionalInfo] = useState({
    startPaymentAtPurchaseDate: false,
  });
  // User expense categories and payment methods creation
  const { mutate: createCategory } = api.finances.createCategory.useMutation({
    onMutate: async (newCategory) => {
      await trpc.finances.getUserExpenseCategories.cancel();
      const previousCategories =
        await trpc.finances.getUserExpenseCategories.getData();
      trpc.finances.getUserExpenseCategories.setData(userId, (old) => {
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
        userId,
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
      trpc.finances.getUserPaymentMethods.setData(userId, (old) => {
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
      trpc.finances.getUserPaymentMethods.setData(userId, ctx?.previousMethods);
      toast.error(
        "Oops, algo deu errado na criação de uma novo método de pagamento."
      );
    },
    onSettled() {
      trpc.finances.getUserPaymentMethods.invalidate();
    },
  });

  // Edit api call
  const { mutate: saveChanges, isLoading: changesLoading } =
    api.finances.editExpense.useMutation({
      onMutate: async () => {
        toast.success("Despesa alterada com sucesso!");
        await trpc.finances.getMonthExpenses.cancel();
      },
      onSettled: async () => {
        await trpc.finances.getMonthExpenses.invalidate();
      },
    });
  async function handleCreateCategory(name: string) {
    createCategory({ name: name, userId: userId });
  }

  async function handleCreateMethod(name: string) {
    createMethod({ name: name, userId: userId });
    return;
  }
  console.log(expense);
  return (
    <AnimatePresence>
      <motion.div
        variants={backdropFramerMotionConfig}
        initial="hidden"
        animate="visible"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,.85)",
          zIndex: 1000,
        }}
      >
        <motion.div
          variants={modalFramerMotionConfig}
          initial="hidden"
          animate="visible"
          className={
            "fixed left-[50%] top-[50%] z-[1000] flex h-fit max-h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-[#fff] p-3 lg:h-[50%] lg:w-[50%]"
          }
        >
          <div className="flex w-full items-center justify-between border-b border-gray-200 p-2">
            <h1 className="text-sm font-bold text-[#2b4e72]">
              EDIÇÃO DE DESPESA
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
          <div className="overscroll-y flex w-full flex-1 flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
            <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
              <div className="w-full lg:w-[50%]">
                <TextInput
                  label="DESCRIÇÃO"
                  placeholder="Descreva ou nomeie aqui o gasto..."
                  value={infoHolder.description}
                  handleChange={(value) =>
                    setInfoHolder((prev) => ({ ...prev, description: value }))
                  }
                />
              </div>
              <div className="w-full lg:w-[50%]">
                <div className={`flex w-full flex-col gap-1`}>
                  <label
                    htmlFor={"purchaseDate"}
                    className={
                      "font-Poppins text-sm font-black tracking-tight text-gray-700"
                    }
                  >
                    DATA DE COMPRA
                  </label>
                  <input
                    value={formatDate(infoHolder.purchaseDate)}
                    onChange={(e) =>
                      setInfoHolder((prev) => ({
                        ...prev,
                        purchaseDate:
                          e.target.value != "" ? e.target.value : null,
                      }))
                    }
                    onReset={() =>
                      setInfoHolder((prev) => ({
                        ...prev,
                        purchaseDate: new Date(),
                      }))
                    }
                    id={"purchaseDate"}
                    type="date"
                    placeholder={"Preencha aqui a data de compra..."}
                    className="w-full rounded-md border border-gray-200 p-3 text-sm outline-none placeholder:italic"
                  />
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
              <div className="flex w-full flex-col gap-1 lg:w-[50%]">
                <SelectInput
                  label="CATEGORIA"
                  value={infoHolder.category}
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
                    setInfoHolder((prev) => ({ ...prev, category: value }))
                  }
                  selectedItemLabel="NÃO DEFINIDO"
                  width="100%"
                  onReset={() =>
                    setInfoHolder((prev) => ({ ...prev, category: null }))
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
                    className="w-full cursor-pointer text-center text-sm italic text-green-400 duration-500 ease-in-out"
                  >
                    Adicionar nova categoria de gastos
                  </p>
                )}
              </div>
              <div className="flex w-full flex-col gap-1 lg:w-[50%]">
                <SelectInput
                  label="MÉTODO"
                  value={infoHolder.method}
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
                    setInfoHolder((prev) => ({ ...prev, method: value }))
                  }
                  selectedItemLabel="NÃO DEFINIDO"
                  width="100%"
                  onReset={() =>
                    setInfoHolder((prev) => ({ ...prev, method: null }))
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
                    className="w-full cursor-pointer text-center text-sm italic text-green-400 duration-500 ease-in-out"
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
                  value={infoHolder.value}
                  handleChange={(value) =>
                    setInfoHolder((prev) => ({ ...prev, value: value }))
                  }
                  width="100%"
                />
              </div>
              <div className="w-full lg:w-[50%]">
                <div className={`flex w-full flex-col gap-1`}>
                  <label
                    htmlFor={"paymentDate"}
                    className={
                      "font-Poppins text-sm font-black tracking-tight text-gray-700"
                    }
                  >
                    DATA DE PAGAMENTO
                  </label>
                  <input
                    value={formatDate(infoHolder.paymentDate)}
                    onChange={(e) =>
                      setInfoHolder((prev) => ({
                        ...prev,
                        paymentDate: new Date(e.target.value),
                      }))
                    }
                    onReset={() =>
                      setInfoHolder((prev) => ({
                        ...prev,
                        paymentDate: new Date(),
                      }))
                    }
                    id={"paymentDate"}
                    type="date"
                    placeholder={"Preencha aqui a data de compra..."}
                    className="w-full rounded-md border border-gray-200 p-3 text-sm outline-none placeholder:italic"
                  />
                </div>
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
                      infoHolder.installments != null &&
                      infoHolder.installments > 0
                    }
                    onChange={(e) =>
                      setInfoHolder((prev) => ({
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
                    {!infoHolder.installments ? "NÃO PARCELADO" : "PARCELADO"}
                  </label>
                </div>
              </div>
              {infoHolder.installments && infoHolder.installments > 0 ? (
                <>
                  <h1 className="mt-2 w-full text-center text-xs font-medium text-[#2b4e72]">
                    NÚMERO DE PARCELAS
                  </h1>
                  <input
                    value={infoHolder.installments.toString()}
                    onChange={(e) =>
                      setInfoHolder({
                        ...infoHolder,
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
                          e.target.value ==
                          "INICIAR PARCELAMENTO NO MÊS DE COMPRA",
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
              <div className="flex w-full items-center justify-center">
                <button
                  disabled={changesLoading}
                  onClick={() => saveChanges(infoHolder)}
                  className="rounded border border-[#2b4e72] p-2  text-sm font-bold text-[#2b4e72] duration-300 ease-in-out disabled:border-gray-400 disabled:bg-gray-400 disabled:text-white  enabled:hover:scale-105 enabled:hover:bg-[#2b4e72] enabled:hover:text-white"
                >
                  {changesLoading ? "CARREGANDO" : "SALVAR ALTERAÇÕES"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default EditExpense;
