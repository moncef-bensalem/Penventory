"use client"

import * as React from "react"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const RadioGroupContext = React.createContext({
  value: '',
  onValueChange: () => {}
})

const RadioGroup = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div
        ref={ref}
        className={cn("grid gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef(({ className, value, id, children, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = React.useContext(RadioGroupContext)
  const isChecked = selectedValue === value
  
  return (
    <div className="flex items-center space-x-2">
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isChecked}
        id={id}
        onClick={() => onValueChange(value)}
        className={cn(
          "flex items-center justify-center aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? "bg-primary border-primary" : "border-gray-300",
          className
        )}
        {...props}
      >
        {isChecked && (
          <div className="flex items-center justify-center">
            <Circle className="h-2.5 w-2.5 fill-white text-white" />
          </div>
        )}
      </button>
      {children}
    </div>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
