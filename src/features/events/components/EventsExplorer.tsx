"use client";

import { useState } from "react";

import { isApiError } from "@/lib/api-errors";
import { messages } from "@/lib/messages";

import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useEvents } from "../hooks/useEvents";
import { EventCard } from "./EventCard";
import { EventFilters } from "./EventFilters";
import { EventsEmptyState } from "./EventsEmptyState";
import { EventsErrorState } from "./EventsErrorState";
import { EventsGridSkeleton } from "./EventsGridSkeleton";
import { EventsPagination } from "./EventsPagination";

/** Orquestra busca, paginação e os quatro estados da listagem pública de eventos. */
export function EventsExplorer({ pageSize = 20 }: { pageSize?: number }) {
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, isError, error } = useEvents({
    search: debouncedSearch || undefined,
    skip,
    take: pageSize,
  });

  function handleSearchChange(value: string) {
    setSearch(value);
    setSkip(0); // toda nova busca volta para a primeira página
  }

  return (
    <div className="flex flex-col gap-4">
      <EventFilters value={search} onChange={handleSearchChange} />

      {isLoading && <EventsGridSkeleton />}

      {isError && (
        <EventsErrorState
          message={isApiError(error) ? error.message : messages.network.unexpected}
          requestId={isApiError(error) ? error.requestId : undefined}
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EventsEmptyState search={debouncedSearch} />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data.items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <EventsPagination skip={skip} take={pageSize} total={data.total} onSkipChange={setSkip} />
        </>
      )}
    </div>
  );
}
