import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { Categories } from "~/utils/types";
function NewCategory({
  handleCreateCategory,
}: {
  handleCreateCategory: (name: string) => void;
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
      <button
        onClick={() => {
          handleCreateCategory(categoryInfo.name);
        }}
        className="text-md text-green-500"
      >
        <IoMdAdd />
      </button>
    </div>
  );
}

export default NewCategory;
