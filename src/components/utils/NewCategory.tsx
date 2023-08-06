import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { VscChromeClose } from "react-icons/vsc";
import { Categories } from "~/utils/types";
function NewCategory({
  handleCreateCategory,
  closeMenu,
}: {
  handleCreateCategory: (name: string) => void;
  closeMenu: () => void;
}) {
  const [categoryInfo, setCategoryInfo] = useState<Categories>({
    name: "",
  });
  return (
    <div className="my-2 flex w-full items-center justify-center">
      <input
        value={categoryInfo.name}
        onChange={(e) => setCategoryInfo({ name: e.target.value })}
        className="grow p-1 text-center text-xs outline-none"
        placeholder="NOME DA CATEGORIA PARA ADICIONAR"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            handleCreateCategory(categoryInfo.name);
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

export default NewCategory;
