import type { ColumnDef } from "@tanstack/react-table";

import type { Event } from "../types";
import { EventStatusBadge } from "./EventStatusBadge";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

const moneyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Colunas do painel do organizador. `enableSorting: false` em todas: a rota
 * `GET /events/mine` (03-eventos-e-catalogo.md) não documenta parâmetro de
 * ordenação — mostrar a seta de "coluna ordenável" sem um backend que
 * responda a isso seria um controle que finge funcionar.
 */
export const dashboardEventColumns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: "Título",
    enableSorting: false,
    meta: { label: "Título" },
    cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    meta: { label: "Status" },
    cell: ({ row }) => <EventStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "venue",
    header: "Local",
    enableSorting: false,
    meta: { label: "Local" },
  },
  {
    id: "date",
    header: "Data",
    enableSorting: false,
    meta: { label: "Data" },
    cell: ({ row }) =>
      row.original.date ? dateFormatter.format(new Date(row.original.date)) : "—",
  },
  {
    id: "capacity",
    header: "Capacidade",
    enableSorting: false,
    meta: { label: "Capacidade" },
    cell: ({ row }) => row.original.capacity,
  },
  {
    id: "price",
    header: "Preço",
    enableSorting: false,
    meta: { label: "Preço" },
    cell: ({ row }) => moneyFormatter.format(row.original.price),
  },
];
