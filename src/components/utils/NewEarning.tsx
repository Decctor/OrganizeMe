import dayjs from "dayjs";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { api } from "~/utils/api";
import { IUserProps } from "~/utils/types";
import TextInput from "../Inputs/TextInput";
import { formatDate } from "~/utils/methods/formatting";
import NumberInput from "../Inputs/NumberInput";
type EarningType = {
  description: string;
  value: number;
  date: Date;
};
const earningInput = z.object({
  description: z
    .string({ required_error: "Descreva o ganho." })
    .min(5, { message: "Por favor, descreva o ganho em ao menos 5 letras" }),
  value: z
    .number({ required_error: "Por favor, preencha o valor recebido." })
    .min(5, { message: "O valor mínimo de ganho é R$ 5,00." }),
});
function NewEarning({ user }: IUserProps) {
  const trpc = api.useContext();
  const [earningInfo, setEarningInfo] = useState<EarningType>({
    description: "",
    value: 0,
    date: new Date(),
  });

  const { mutate: createEarning, isLoading } =
    api.finances.createEarning.useMutation({
      async onSuccess(data, variables, context) {
        try {
          setEarningInfo({
            description: "",
            value: 0,
            date: new Date(),
          });
          toast.success("Entrada adicionada !");
          await trpc.users.getUser.invalidate();
          await trpc.finances.getMonthEarnings.invalidate();
          await trpc.finances.getUserFinancialBalance.invalidate();
        } catch (error) {
          toast.error("Erro na invalidação de queries.");
        }
      },
    });
  async function handleEarningAdd() {
    console.log("FUI CHAMADO");
    const result = await earningInput.safeParseAsync(earningInfo);
    if (result.success === false) {
      toast.error(
        result.error.issues[0]?.message
          ? result.error.issues[0]?.message
          : "Erro no formulário"
      );
    } else {
      if (user) createEarning({ ...earningInfo, userId: user.id });
    }
  }
  return (
    <div className="flex w-full flex-col gap-3 overflow-x-hidden">
      <div className="flex w-full flex-col items-center gap-1">
        <TextInput
          label="DESCRIÇÃO"
          placeholder="Preencha aqui a descrição ou nome do ganho"
          value={earningInfo.description}
          handleChange={(value) =>
            setEarningInfo((prev) => ({ ...prev, description: value }))
          }
        />
      </div>
      <div className="w-full">
        <div className={`flex w-full flex-col gap-1`}>
          <label
            htmlFor={"date"}
            className={
              "font-Poppins text-sm font-black tracking-tight text-gray-700"
            }
          >
            DATA DE RECEBIMENTO
          </label>
          <input
            value={formatDate(earningInfo.date)}
            onChange={(e) =>
              setEarningInfo((prev) => ({
                ...prev,
                date: new Date(e.target.value),
              }))
            }
            onReset={() =>
              setEarningInfo((prev) => ({
                ...prev,
                date: new Date(),
              }))
            }
            id={"date"}
            type="date"
            placeholder={"Preencha aqui a data de recebimento do ganho..."}
            className="w-full rounded-md border border-gray-200 p-3 text-sm outline-none placeholder:italic"
          />
        </div>
      </div>
      <NumberInput
        label="VALOR RECEBIDO"
        placeholder="Preencha aqui o valor recebido..."
        value={earningInfo.value}
        handleChange={(value) =>
          setEarningInfo((prev) => ({ ...prev, value: value }))
        }
        width="100%"
      />
      <div className="mb-2 flex items-center justify-center">
        <button
          disabled={isLoading}
          onClick={handleEarningAdd}
          className="rounded border border-[#2b4e72] p-2  text-sm font-bold text-[#2b4e72] duration-300 ease-in-out disabled:border-gray-400 disabled:bg-gray-400 disabled:text-white  enabled:hover:scale-105 enabled:hover:bg-[#2b4e72] enabled:hover:text-white"
        >
          {isLoading ? "CARREGANDO" : "ADICIONAR GANHO"}
        </button>
      </div>
    </div>
  );
}

export default NewEarning;
