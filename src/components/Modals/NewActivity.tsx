import React, { useState } from "react";
import AnimatedModalWrapper from "../wrappers/AnimatedModalWrapper";
import { VscChromeClose } from "react-icons/vsc";
import TextInput from "../Inputs/TextInput";
import { IoMdAddCircle } from "react-icons/io";
import { toast } from "react-hot-toast";
import { Activity, ActivityItem } from "~/utils/types";
import CheckboxInput from "../Inputs/CheckboxInput";
import { AiOutlineMinus } from "react-icons/ai";
import dayjs from "dayjs";
import { api } from "~/utils/api";
import { TRPCError } from "@trpc/server";
import { TRPCClientError } from "@trpc/client";
type NewActivityModalProps = {
  userId: string | undefined;
  isOpen: boolean;
  closeModal: () => void;
};
function NewActivityModal({
  isOpen,
  closeModal,
  userId,
}: NewActivityModalProps) {
  const [activityHolder, setActivityHolder] = useState<Activity>({
    title: "",
    items: [],
    dueDate: undefined,
  });
  const [itemHolder, setItemHolder] = useState<ActivityItem>({
    description: "",
    done: false,
  });

  const { mutate: createActivity } = api.activities.createActivity.useMutation({
    onSuccess: async (response) => {
      try {
        toast.success(response);
      } catch (error) {
        console.log("ERRO", error);
        if (error instanceof TRPCClientError) {
          toast.error("ERRO");
          return;
        }
        if (error instanceof Error) {
          let errorMsg = error.message;
          toast.error("ERRO");
          return;
        }
      }
    },
    onError: async (error) => {
      if (error instanceof TRPCClientError) {
        if (error.data?.zodError) {
          const message = error.data?.zodError?.fieldErrors.title[0];
          toast.error(message);
        } else {
          toast.error("ERRO");
        }

        return;
      }
      if (error instanceof Error) {
        console.log(error.data?.zodError?.fieldErrors.title);

        toast.error("ERRO");
        return;
      }
      console.log(error.data?.zodError?.fieldErrors.title);
    },
  });
  function addItem() {
    if (itemHolder.description.trim().length < 3) {
      toast.error("Preencha uma descrição de ao menos 3 letras para o item.");
      return;
    }
    var items = [...activityHolder.items];
    items.push({ ...itemHolder });
    setActivityHolder((prev) => ({ ...prev, items: items }));
    setItemHolder({
      description: "",
      done: false,
    });
  }
  function handleCreateActivity() {
    if (typeof userId === "string") {
      createActivity({ ...activityHolder, userId: userId });
    }
  }
  console.log(activityHolder);
  return (
    <AnimatedModalWrapper width={"40%"} height={"50%"} modalIsOpen={isOpen}>
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 py-2">
          <h1 className="text-sm font-bold text-[#2b4e72] ">NOVA ATIVIDADE</h1>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => closeModal()}
              className="flex items-center justify-center transition duration-300 ease-in-out hover:scale-125"
            >
              <VscChromeClose style={{ color: "red" }} />
            </button>
          </div>
        </div>
        <div className="flex grow flex-col overflow-y-auto overscroll-y-auto py-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
          <TextInput
            label="TÍTULO DA ATIVIDADE"
            value={activityHolder.title}
            labelClassName="font-medium text-gray-500 text-sm"
            placeholder="Preencha aqui o título da atividade"
            handleChange={(value) =>
              setActivityHolder((prev) => ({ ...prev, title: value }))
            }
          />
          <div className="my-2 flex flex-col">
            <h1 className="font-sans text-sm font-medium text-gray-500">
              DATA MÁXIMA PARA ATIVIDADE
            </h1>
            <input
              value={
                activityHolder.dueDate &&
                dayjs(activityHolder.dueDate).isValid()
                  ? dayjs(activityHolder.dueDate).format("YYYY-MM-DDThh:mm")
                  : undefined
              }
              onChange={(e) => {
                setActivityHolder((prev) => ({
                  ...prev,
                  dueDate:
                    e.target.value != ""
                      ? new Date(e.target.value).toISOString()
                      : undefined,
                }));
              }}
              id={"DATAVENCIMENTO"}
              onReset={() =>
                setActivityHolder((prev) => ({
                  ...prev,
                  dueDate: undefined,
                }))
              }
              type="datetime-local"
              className="w-full rounded-md border border-gray-200 p-3 text-sm outline-none placeholder:italic"
            />
          </div>
          <div className="mt-4 flex w-full flex-col">
            <h1 className="text-center text-sm font-bold text-gray-700">
              ADICIONAR ITEMS À ATIVIDADE
            </h1>
            <div className="flex w-full items-center gap-3">
              <div className="grow">
                <TextInput
                  label="DESCRIÇÃO"
                  value={itemHolder.description}
                  labelClassName="font-medium text-gray-500 text-sm"
                  placeholder="Descreva aqui o item..."
                  handleChange={(value) =>
                    setItemHolder((prev) => ({ ...prev, description: value }))
                  }
                />
              </div>
              <button
                onClick={addItem}
                className="flex h-full items-end justify-end py-4 text-green-500"
              >
                <IoMdAddCircle style={{ fontSize: "25px" }} />
              </button>
            </div>
            <div className="my-2 flex flex-col">
              {activityHolder.items.length > 0 ? (
                activityHolder.items.map((item, index, arr) => (
                  <div
                    key={index}
                    className="flex w-full  items-center justify-between px-2"
                  >
                    <div className="flex w-fit justify-start">
                      <CheckboxInput
                        checked={item.done}
                        labelFalse={item.description}
                        labelTrue={item.description}
                        handleChange={() => {
                          var items = [...activityHolder.items];

                          if (items[index]) {
                            const { done } = item;
                            items[index] = {
                              ...item,
                              done: !done,
                            };
                          }
                          setActivityHolder((prev) => ({
                            ...prev,
                            items: items,
                          }));
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        var items = activityHolder.items;
                        items.splice(index, 1);
                        setActivityHolder((prev) => ({
                          ...prev,
                          items: items,
                        }));
                      }}
                      className="text-red-500"
                    >
                      <AiOutlineMinus />
                    </button>
                  </div>
                ))
              ) : (
                <p className="py-2 text-center font-light italic text-gray-400">
                  Sem itens adicionados...
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex w-full justify-end border-t border-gray-200 p-2">
          <button
            onClick={handleCreateActivity}
            className="hover:text-[#00C16C] font-medium  text-[#398378] duration-300 ease-in-out hover:scale-105"
          >
            Criar atividade
          </button>
        </div>
      </div>
    </AnimatedModalWrapper>
  );
}

export default NewActivityModal;
