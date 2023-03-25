import dayjs from "dayjs";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { api } from "~/utils/api";
import { IUserProps } from "~/utils/types";
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

  const { mutate: createEarning } = api.finances.createEarning.useMutation({
    async onSuccess(data, variables, context) {
      try {
        await trpc.users.getUser.invalidate();
        await trpc.finances.getEarnings.invalidate();
        setEarningInfo({
          description: "",
          value: 0,
          date: new Date(),
        });
        toast.success("Entrada adicionada !");
      } catch (error) {
        toast.error("Erro na invalidação de queries.");
      }
    },
  });
  async function handleEarningAdd() {
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
    <>
      <div className="flex w-full flex-col items-center gap-1">
        <h1 className="text-center font-[Roboto] text-lg font-bold text-[#2790b0]">
          DESCRIÇÃO DA GANHO
        </h1>
        <input
          value={earningInfo.description}
          onChange={(e) =>
            setEarningInfo({ ...earningInfo, description: e.target.value })
          }
          type="text"
          className="w-full p-1 text-center text-xs outline-none"
          placeholder="DESCREVA AQUI O GANHO"
        />
      </div>
      <div className="flex w-full flex-col items-center gap-1">
        <h1 className="text-center font-[Roboto] text-lg font-bold text-[#2790b0]">
          DATA DE RECEBIMENTO
        </h1>
        <input
          value={dayjs(earningInfo.date).format("YYYY-MM-DD")}
          onChange={(e) =>
            setEarningInfo({
              ...earningInfo,
              date: dayjs(e.target.value).isValid()
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
          VALOR RECEBIDO
        </h1>
        <input
          value={earningInfo.value}
          onChange={(e) =>
            setEarningInfo({
              ...earningInfo,
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
          onClick={async () => await handleEarningAdd()}
          className="rounded border border-[#2b4e72] p-2 text-sm font-bold text-[#2b4e72] duration-300 ease-in-out hover:scale-105 hover:bg-[#2b4e72] hover:text-white"
        >
          ADICIONAR ENTRADA
        </button>
      </div>
    </>
  );
}

export default NewEarning;
