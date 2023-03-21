import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { Methods } from "~/utils/types";
function NewMethod({
  handleCreateMethod,
}: {
  handleCreateMethod: (name: string) => void;
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
      <button
        onClick={() => {
          handleCreateMethod(methodInfo.name);
        }}
        className="text-md text-green-500"
      >
        <IoMdAdd />
      </button>
    </div>
  );
}

export default NewMethod;
