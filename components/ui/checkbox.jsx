"use client"

import * as React from "react"
import { Check } from "lucide-react"

// Fonction utilitaire pour combiner des classes conditionnellement
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState(checked || false);

  React.useEffect(() => {
    setIsChecked(checked || false);
  }, [checked]);

  const handleChange = (e) => {
    const newChecked = e.target.checked;
    setIsChecked(newChecked);
    if (onCheckedChange) {
      onCheckedChange(newChecked);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        ref={ref}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div 
        className={cn(
          "h-4 w-4 shrink-0 rounded-sm border border-gray-300 flex items-center justify-center",
          isChecked ? "bg-orange-500 border-orange-500" : "bg-white",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className
        )}
        onClick={() => {
          if (!disabled) {
            const newChecked = !isChecked;
            setIsChecked(newChecked);
            if (onCheckedChange) {
              onCheckedChange(newChecked);
            }
          }
        }}
      >
        {isChecked && <Check className="h-3 w-3 text-white" />}
      </div>
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox }
