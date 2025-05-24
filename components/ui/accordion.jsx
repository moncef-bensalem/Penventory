"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionContext = React.createContext({
  expanded: null,
  setExpanded: () => {}
})

const Accordion = ({ children, type = "single", ...props }) => {
  const [expanded, setExpanded] = React.useState(null)
  
  return (
    <AccordionContext.Provider value={{ expanded, setExpanded }}>
      <div className="space-y-1" {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

const AccordionItem = React.forwardRef(({ className, value, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("border-b", className)}
      {...props}
    />
  )
})
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { expanded, setExpanded } = React.useContext(AccordionContext)
  const isExpanded = expanded === props.value
  
  const handleClick = () => {
    setExpanded(isExpanded ? null : props.value)
  }
  
  return (
    <div className="flex">
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown 
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isExpanded ? "rotate-180" : ""
          )} 
        />
      </button>
    </div>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { expanded } = React.useContext(AccordionContext)
  const isExpanded = expanded === value
  
  if (!isExpanded) return null
  
  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-sm",
        className
      )}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
