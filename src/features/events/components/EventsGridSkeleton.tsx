import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder de carregamento com a mesma silhueta do grid de EventCard. */
export function EventsGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-lg border border-border p-2">
          <Skeleton className="aspect-16/9 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
