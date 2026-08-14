import { describe, expect, it } from "vitest";

import type { Seat } from "../types";
import { groupSeatsByRow } from "./seat-grouping";

function seat(id: string, label: string, available = true): Seat {
  return { id, label, available };
}

describe("groupSeatsByRow", () => {
  it("agrupa assentos pela primeira letra do rótulo", () => {
    const seats = [seat("1", "A1"), seat("2", "B1"), seat("3", "A2")];

    const rows = groupSeatsByRow(seats);

    expect(rows.map((r) => r.row)).toEqual(["A", "B"]);
    expect(rows[0].seats.map((s) => s.label)).toEqual(["A1", "A2"]);
    expect(rows[1].seats.map((s) => s.label)).toEqual(["B1"]);
  });

  it("ordena numericamente uma fileira com assento de dois dígitos", () => {
    // A API devolve os itens em ordem de string ("A1", "A10", "A11", ...,
    // "A2", ...), não numérica — é esse desvio que o teste prova que a
    // função corrige.
    const seats = [
      seat("1", "A1"),
      seat("10", "A10"),
      seat("11", "A11"),
      seat("2", "A2"),
      seat("20", "A20"),
    ];

    const rows = groupSeatsByRow(seats);

    expect(rows[0].seats.map((s) => s.label)).toEqual(["A1", "A2", "A10", "A11", "A20"]);
  });

  it("preserva a disponibilidade de cada assento", () => {
    const seats = [seat("1", "A1", true), seat("2", "A2", false)];

    const rows = groupSeatsByRow(seats);

    expect(rows[0].seats.map((s) => s.available)).toEqual([true, false]);
  });
});
