import React from "react";

export default function SelectInput({
  label,
  name,
  register,
  className = "sm:col-span-2",
  options = [],
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-sm font-medium leading-6 dark:text-slate-50 text-slate-800 mb-2"
      >
        {label}
      </label>
      <div className="mt-2">
        <select
          {...register(`${name}`)}
          id={name}
          name={name}
          className="block w-full rounded-md border-0 py-3 dark:text-slate-50 text-gray-800 shadow-sm ring-1 ring-inset ring-slate-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 dark:bg-transparent"
        >
          {options.map((option, i) => {
            return (
              <option key={i} value={option.title} className="dark:bg-slate-600 hover:bg-orange-500 ml-6 ">
                {option.title}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}