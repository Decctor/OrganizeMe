import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { VscChromeClose } from "react-icons/vsc";
import { Methods } from "~/utils/types";
function NewMethod({
  handleCreateMethod,
  closeMenu,
}: {
  handleCreateMethod: (name: string) => void;
  closeMenu: () => void;
}) {
  const [methodInfo, setMethodInfo] = useState<Methods>({
    name: "",
  });
  return (
    <div className="my-2 flex w-full items-center justify-center">
      <input
        value={methodInfo.name}
        onChange={(e) => setMethodInfo({ name: e.target.value })}
        className="grow p-1 text-center text-xs outline-none"
        placeholder="NOME DO MÉTODO PARA ADICIONAR"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            handleCreateMethod(methodInfo.name);
          }}
          className="text-md text-green-500"
        >
          <IoMdAdd />
        </button>
        <button
          onClick={() => {
            closeMenu();
          }}
          className="text-md text-red-500"
        >
          <VscChromeClose />
        </button>
      </div>
    </div>
  );
}

export default NewMethod;
