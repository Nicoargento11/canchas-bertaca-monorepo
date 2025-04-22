"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Product, ProductCategory } from "@/services/product/product";

// export const financialColumns: ColumnDef<any>[] = [
//   {
//     accessorKey: "time",
//     header: "Hora",
//   },
//   {
//     accessorKey: "court",
//     header: "Cancha",
//   },
//   {
//     accessorKey: "client",
//     header: "Cliente",
//   },
//   {
//     accessorKey: "status",
//     header: "Estado",
//     cell: ({ row }) => (
//       <StatusBadge status={row.getValue("status")}>
//         {row.getValue("status")}
//       </StatusBadge>
//     ),
//   },
//   // ... más columnas
// ];

export const inventoryColumns: ColumnDef<Product, unknown>[] = [
  {
    accessorKey: "name",
    header: "Producto",
  },
  {
    accessorKey: "category",
    header: "Categoría",
    cell: ({ row }) => {
      const category = row.getValue("category") as ProductCategory;
      return <span className="capitalize">{category.toLowerCase()}</span>;
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      const minStock = row.original.minStock;
      return (
        <span className={stock < minStock ? "text-red-600 font-medium" : ""}>
          {stock}
        </span>
      );
    },
  },
  {
    accessorKey: "salePrice",
    header: "Precio",
    cell: ({ row }) => {
      const price = row.getValue("salePrice") as number;
      return `$${price.toFixed(2)}`;
    },
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isActive ? "Activo" : "Inactivo"}
        </span>
      );
    },
  },
];
