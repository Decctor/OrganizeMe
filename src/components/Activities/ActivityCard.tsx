import React from "react";
import { Activity } from "~/utils/types";
import CheckboxInput from "../Inputs/CheckboxInput";
import { CgCalendarToday } from "react-icons/cg";
import dayjs from "dayjs";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { BsCheck } from "react-icons/bs";
type ActivityCardProps = {
  activity: Activity;
};

function ActivityCard({ activity }: ActivityCardProps) {
  const trpc = api.useContext();

  const { mutate: updateItem } = api.activities.updateActivityItem.useMutation({
    onSuccess: async (response) => {
      await trpc.activities.getUserActivities.invalidate();
      toast.success(response);
    },
    onError: async (error) => {
      toast.error(
        "Houve um erro na atualizão do status do item. Tente novamente mais tarde."
      );
    },
  });
  const { mutate: updateActivity } =
    api.activities.updateActivityStatus.useMutation({
      onSuccess: async (response) => {
        await trpc.activities.getUserActivities.invalidate();
        toast.success(response);
      },
      onError: async (error) => {
        toast.error(
          "Houve um erro na atualizão do status da atividade. Tente novamente mais tarde."
        );
      },
    });
  return (
    <div className="flex h-fit w-full flex-col rounded-md border border-[#fff] bg-[#202124] p-3 shadow-sm md:w-[400px]">
      <h1 className="w-full text-center text-white">{activity.title}</h1>
      <div className="flex w-full grow flex-col py-4">
        {activity.items.length > 0 ? (
          activity.items?.map((item, index) => (
            <div key={index} className="flex w-full items-center justify-start">
              <div className="flex w-fit justify-start">
                <CheckboxInput
                  labelFalse={item.description}
                  labelTrue={item.description}
                  labelClassName="cursor-pointer text-white"
                  checked={item.done || !!activity.concludedAt}
                  handleChange={() =>
                    updateItem({ id: item.id ? item.id : "", done: !item.done })
                  }
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-sm italic text-gray-300">
            Sem itens vinculados...
          </p>
        )}
      </div>

      <div className="flex w-full items-center justify-between">
        {activity.dueDate ? (
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-0.5 text-sm text-gray-200 opacity-50">
            <CgCalendarToday />
            <p>{dayjs(activity.dueDate).format("DD/MM HH:mm")}</p>
          </div>
        ) : (
          <div></div>
        )}

        <div
          className={`flex h-[16px] w-[16px] cursor-pointer items-center justify-center  rounded-sm border-2 border-[#00C16C] ${
            activity.concludedAt ? "bg-[#00C16C]" : ""
          }`}
          onClick={() =>
            updateActivity({
              id: activity.id ? activity.id : "",
              done: !activity.concludedAt,
            })
          }
        >
          {activity.concludedAt ? <BsCheck style={{ color: "white" }} /> : null}
        </div>
      </div>
    </div>
  );
}

export default ActivityCard;
