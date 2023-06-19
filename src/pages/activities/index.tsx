import { parseCookies } from "nookies";
import React, { useState } from "react";
import Header from "~/components/Header";
import CheckboxInput from "~/components/Inputs/CheckboxInput";
import NewActivityModal from "~/components/Modals/NewActivity";
import LoadingPage from "~/components/utils/LoadingPage";
import FullScreenWrapper from "~/components/wrappers/FullScreenWrapper";
import { CgCalendarToday } from "react-icons/cg";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import ActivityCard from "~/components/Activities/ActivityCard";

function ActivitiesMainPage() {
  var { userId } = parseCookies(null);
  const { data: user, isLoading: userLoading } = api.users.getUser.useQuery(
    userId ? userId : ""
  );
  const {
    data: activities,
    isLoading: activitiesLoading,
    isSuccess: activitiesSuccess,
  } = api.activities.getUserActivities.useQuery(userId ? userId : "");
  const [newActivityModalIsOpen, setNewActivityModalIsOpen] =
    useState<boolean>(false);
  if (userLoading) return <LoadingPage />;
  return (
    <FullScreenWrapper>
      <Header />
      <div className="flex w-full grow flex-col bg-[#202124] p-6">
        <div className="flex w-full flex-col items-center justify-between border-b border-gray-300 pb-2 lg:flex-row lg:pb-0">
          <div className="mb-4 flex flex-col items-start">
            <h1 className="w-full text-center text-xl font-bold text-white lg:text-start">
              Olá,{" "}
              <strong className="text-[#2790b0]">
                {user?.name ? user.name : "..."}
              </strong>{" "}
              !
            </h1>
            <p className="w-full text-center text-sm text-gray-300 lg:text-start">
              Aqui você pode programar e controlar a execução de suas
              atividades.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={() => setNewActivityModalIsOpen(true)}
              className="rounded bg-[#398378] px-2 py-1  font-medium text-white duration-300 ease-in-out hover:scale-105 hover:bg-[#00C16C]"
            >
              Nova Atividade
            </button>
          </div>
        </div>
        <div className="flex h-fit min-h-[400px] w-full flex-col flex-wrap items-center justify-start gap-2 py-2 md:flex-row md:items-start lg:justify-around">
          {activitiesLoading ? <LoadingPage /> : null}
          {activitiesSuccess && activities?.open.length > 0 ? (
            activities?.open.map((activity, index) => (
              <ActivityCard
                activity={activity}
                key={index}
                userId={userId ? userId : ""}
              />
            ))
          ) : (
            <div className="flex h-[400px] items-center justify-center">
              <p className="font-light italic text-gray-500">
                Sem atividades em aberto...
              </p>
            </div>
          )}
        </div>
        {activities && activities.closed.length > 0 ? (
          <div className="flex w-full flex-col">
            <h1 className="font-medium text-white">Atividades finalizadas</h1>
            <div className="flex h-fit w-full flex-col flex-wrap items-center justify-start gap-2 py-2 md:flex-row md:items-start lg:justify-around">
              {activities?.closed.map((activity, index) => (
                <ActivityCard
                  activity={activity}
                  key={index}
                  userId={userId ? userId : ""}
                />
              ))}
            </div>
          </div>
        ) : null}
        {newActivityModalIsOpen ? (
          <NewActivityModal
            userId={userId}
            isOpen={newActivityModalIsOpen}
            closeModal={() => setNewActivityModalIsOpen(false)}
          />
        ) : null}
      </div>
    </FullScreenWrapper>
  );
}

export default ActivitiesMainPage;
