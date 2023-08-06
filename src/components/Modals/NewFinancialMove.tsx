import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VscChromeClose } from "react-icons/vsc";
import AnimatedModalWrapper from "../wrappers/AnimatedModalWrapper";
import { toast } from "react-hot-toast";
import { boolean, z } from "zod";
import { IoMdAddCircle } from "react-icons/io";
import { api } from "~/utils/api";
import { IUserProps } from "~/utils/types";
import NewExpense from "../utils/NewExpense";
import NewEarning from "../utils/NewEarning";
import {
  backdropFramerMotionConfig,
  modalFramerMotionConfig,
} from "~/utils/constants";

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
            "fixed left-[50%] top-[50%] z-[1000] h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#fff] p-3 lg:h-[60%] lg:w-[60%]"
          }
          // style={{
          //   position: "fixed",
          //   top: "50%",
          //   left: "50%",
          //   transform: "translate(-50%,-50%)",
          //   backgroundColor: "#fff",
          //   minWidth: width ? width : "93%",
          //   height: height ? height : "98%",
          //   borderRadius: "10px",
          //   padding: "10px",
          //   zIndex: 1000,
          // }}
        >
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
              <div className="flex w-full grow flex-col">
                {moveType == "ENTRADA" ? <NewEarning user={userInfo} /> : null}
                {moveType == "SAÍDA" ? (
                  <NewExpense user={userInfo} setUserInfo={setUserInfo} />
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default NewFinancialMove;
