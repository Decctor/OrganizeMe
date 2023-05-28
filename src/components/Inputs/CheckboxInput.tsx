import React from "react";
import { BsCheck } from "react-icons/bs";
type CheckboxInputProps = {
  checked: boolean;
  labelTrue: string;
  labelFalse: string;
  labelClassName?: string;
  handleChange: (value: boolean) => void;
  padding?: string;
};
function CheckboxInput({
  labelTrue,
  labelFalse,
  labelClassName,
  checked,
  handleChange,
  padding = "0.75rem",
}: CheckboxInputProps) {
  return (
    <div
      className={`flex w-full items-center justify-center gap-2 ${
        padding ? `p-[${padding}]` : "p-3"
      }`}
    >
      <div
        className={`flex h-[16px] w-[16px] cursor-pointer items-center justify-center  rounded-sm border-2 border-[#00C16C] ${
          checked ? "bg-[#00C16C]" : ""
        }`}
        onClick={() => handleChange(!checked)}
      >
        {checked ? <BsCheck style={{ color: "white" }} /> : null}
      </div>
      <p
        className={labelClassName ? labelClassName : "cursor-pointer"}
        onClick={() => handleChange(!checked)}
      >
        {checked ? labelTrue : labelFalse}
      </p>
    </div>
  );
}

export default CheckboxInput;
