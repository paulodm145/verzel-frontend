import type { ColumnDef } from "@tanstack/react-table";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DataTable } from "./DataTable";

interface Row {
  id: string;
  name: string;
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Nome", meta: { label: "Nome" } },
];

describe("DataTable", () => {
  it("chama onChange de ordenação ao clicar no cabeçalho de uma coluna ordenável", () => {
    const onSortingChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={[{ id: "1", name: "Show A" }]}
        sorting={{ state: [], onChange: onSortingChange }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /nome/i }));

    expect(onSortingChange).toHaveBeenCalledWith([{ id: "name", desc: false }]);
  });

  it("avança a página chamando pagination.onChange com o próximo skip", () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={[{ id: "1", name: "Show A" }]}
        totalCount={40}
        pagination={{ skip: 0, take: 20, onChange: onPageChange }}
      />,
    );

    fireEvent.click(screen.getByLabelText("Próxima página"));

    expect(onPageChange).toHaveBeenCalledWith({ skip: 20, take: 20 });
  });

  it("mostra o estado vazio quando não há dados, sem carregar nem erro", () => {
    render(<DataTable columns={columns} data={[]} />);

    expect(screen.getByText("Nenhum registro encontrado.")).toBeInTheDocument();
  });

  it("mostra skeleton em vez do estado vazio enquanto isLoading", () => {
    render(<DataTable columns={columns} data={[]} isLoading />);

    expect(screen.queryByText("Nenhum registro encontrado.")).not.toBeInTheDocument();
  });
});
