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
  userId: string;
};

function ActivityCard({ activity, userId }: ActivityCardProps) {
  const trpc = api.useContext();

  const { mutate: updateItem } = api.activities.updateActivityItem.useMutation({
    onMutate: async (payload) => {
      console.log("PAYLOAD", payload);
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await trpc.activities.getUserActivities.cancel();

      const prevData = trpc.activities.getUserActivities.getData();

      // Dealing with optimistic changes
      trpc.activities.getUserActivities.setData(userId, (oldData) => {
        console.log("OLD DATA", oldData);
        // Giving that items should not be updated in closed activities, searching within the open activities
        // for the parent activity being updated
        const openActivities = oldData ? oldData.open : [];
        const updatingActivity = openActivities.find((act) =>
          act.items.some((i) => i.id == payload.id)
        );
        // Getting the item index whithin the activity
        if (updatingActivity) {
          const updatingActivityIndex = openActivities
            .map((act) => act.id)
            .indexOf(updatingActivity.id);
          const itemIndex = updatingActivity.items
            .map((i) => i.id)
            .indexOf(payload.id);
          console.log("LIST OF INDEXED", itemIndex);
          // Manually setting the done status for the item
          if (updatingActivity.items[itemIndex]?.id) {
            updatingActivity.items[itemIndex].done = payload.done;
          }

          openActivities[updatingActivityIndex] = updatingActivity;

          const dataStateObj = {
            open: openActivities,
            closed: oldData ? oldData.closed : [],
          };
          return dataStateObj;
        } else {
          return oldData;
        }
      });
      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
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
      onMutate: async (payload) => {
        // Cancel outgoing fetches (so they don't overwrite our optimistic update)
        await trpc.activities.getUserActivities.cancel();

        // Get the data from the queryCache
        const prevData = trpc.activities.getUserActivities.getData();

        // Dealing with optimistic changes
        trpc.activities.getUserActivities.setData(userId, (oldData) => {
          console.log("OLD DATA", oldData);
          const updatingId = payload.id;
          // If the payload done is true, then activity was "open", so change arrays
          if (payload.done == true) {
            // Getting updating activity to change arrays
            const previousOpenActivities = oldData ? oldData.open : [];
            const updatingActivity = previousOpenActivities.find(
              (act) => act.id == updatingId
            );
            if (updatingActivity) {
              updatingActivity.concludedAt = new Date();
              const newOpenActivities = previousOpenActivities.filter(
                (act) => act.id != updatingId
              );
              const newClosedActivities = oldData
                ? [...oldData.closed, updatingActivity]
                : [updatingActivity];
              const dataStateObj = {
                open: newOpenActivities,
                closed: newClosedActivities,
              };
              console.log("NOVO SET DE DADOS", dataStateObj);
              return dataStateObj;
            } else {
              return oldData;
            }
          } else {
            // else, then activity was closed, so change arrays
            const previousClosedActivities = oldData ? oldData.closed : [];
            const updatingActivity = previousClosedActivities.find(
              (act) => act.id == updatingId
            );
            if (updatingActivity) {
              updatingActivity.concludedAt = null;
              const newClosedActivities = previousClosedActivities.filter(
                (act) => act.id != updatingId
              );
              const newOpenActivities = oldData
                ? [...oldData.open, updatingActivity]
                : [updatingActivity];
              const dataStateObj = {
                open: newOpenActivities,
                closed: newClosedActivities,
              };
              console.log("NOVO SET DE DADOS", dataStateObj);
              return dataStateObj;
            } else return oldData;
          }
        });

        // Return the previous data so we can revert if something goes wrong
        return { prevData };
      },
      onSuccess: async (response) => {
        toast.success(response);
      },
      onSettled: async (response) => {
        await trpc.activities.getUserActivities.invalidate();
      },
      onError: async (error, payload, ctx) => {
        trpc.activities.getUserActivities.setData("", ctx?.prevData);
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
