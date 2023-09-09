import React from "react";
import { isEmpty } from "~/utils/methods/validating";
type NumberInputProps = {
  width?: string;
  label: string;
  value: number | null;
  editable?: boolean;
  placeholder: string;
  handleChange: (value: number) => void;
};
function NumberInput({
  width,
  label,
  value,
  editable = true,
  placeholder,
  handleChange,
}: NumberInputProps) {
  const inputIdentifier = label.toLowerCase().replace(" ", "_");
  return (
    <div
      className={`flex w-full flex-col gap-1 lg:w-[${width ? width : "350px"}]`}
    >
      <label
        htmlFor={inputIdentifier}
        className="font-Poppins text-sm font-black tracking-tighter text-gray-700"
      >
        {label}
      </label>
      <input
        readOnly={!editable}
        value={!isEmpty(value) ? value?.toString() : ""}
        onChange={(e) => handleChange(Number(e.target.value))}
        id={inputIdentifier}
        type="number"
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-200 p-3 text-sm outline-none placeholder:italic"
      />
    </div>
  );
}

export default NumberInput;
