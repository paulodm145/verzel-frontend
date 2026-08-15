import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = ["Assento", "Reserva", "Pagamento", "Ingresso"] as const;

export function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol aria-label="Etapas da compra" className="grid grid-cols-4 gap-1">
      {STEPS.map((label, index) => {
        const completed = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                completed && "border-primary bg-primary text-primary-foreground",
                active && "border-primary text-primary",
                !completed && !active && "border-border text-muted-foreground",
              )}
            >
              {completed ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden truncate text-xs sm:inline",
                active ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
