import React, { useState, useEffect } from "react";
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
  initialMoveType: "ENTRADA" | "SAÍDA";
  closeModal: () => void;
};

function NewFinancialMove({
  modalIsOpen,
  initialMoveType,
  closeModal,
  user,
}: NewFinancialMoveProps & IUserProps) {
  const [moveType, setMoveType] = useState<"ENTRADA" | "SAÍDA">(
    initialMoveType
  );

  const [userInfo, setUserInfo] = useState(user);
  useEffect(() => {
    setUserInfo(user);
  }, [user]);
  useEffect(() => {
    setMoveType(initialMoveType);
  }, [initialMoveType]);

  return (
    <AnimatedModalWrapper modalIsOpen={modalIsOpen} height="70%" width="30%">
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
        <div className="overscroll-y my-2  flex grow flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
          <div className="flex items-center justify-center gap-2  p-2">
            <h1
              onClick={() => setMoveType("SAÍDA")}
              className={`cursor-pointer rounded  bg-[#ff0054] p-1 font-bold text-white  ${
                moveType == "SAÍDA" ? "opacity-100" : "opacity-30"
              }`}
            >
              SAÍDA
            </h1>
            <h1
              onClick={() => setMoveType("ENTRADA")}
              className={`cursor-pointer rounded bg-[#2790b0]  p-1 font-bold text-white ${
                moveType == "ENTRADA" ? "opacity-100" : "opacity-40"
              }`}
            >
              ENTRADA
            </h1>
          </div>
          {moveType == "ENTRADA" ? <NewEarning user={userInfo} /> : null}
          {moveType == "SAÍDA" ? (
            <NewExpense user={userInfo} setUserInfo={setUserInfo} />
          ) : null}
        </div>
      </div>
    </AnimatedModalWrapper>
  );
}

export default NewFinancialMove;
