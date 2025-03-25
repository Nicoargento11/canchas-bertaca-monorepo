"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardModal } from "@/context/dashboardModalContext";
import { ProductInterface } from "@/types/db";
import { Suspense, lazy, useState } from "react";
import { Search, Edit } from "lucide-react";

const LazyComponent = lazy(
  () => import("../../_components/dashboard/editProductModal")
);

type ListProductsProps = {
  products: ProductInterface[] | null;
};
const ListProducts: React.FC<ListProductsProps> = ({ products }) => {
  const [searchProducts, setSearchProducts] = useState(products);

  const {
    produtsSale,
    setProdutsSale,
    handleChangeSale,
    handleChangeCreateProduct,
    handleChangeEditProduct,
    setDataEditProduct,
    isOpenEditProduct,
  } = useDashboardModal();
  const handleSearch = (value: string) => {
    const filterProducts = searchProducts?.filter((product) =>
      product.name.toLowerCase().includes(value.toLowerCase())
    );

    setSearchProducts(
      value == "" || !filterProducts || !filterProducts?.length
        ? products
        : filterProducts
    );
  };
  return (
    <section className="w-full p-2  ">
      <div className="flex justify-between bg-white rounded-t-md ">
        <div className="w-full sm:w-auto relative m-2">
          <Search className="absolute top-1/2 left-[3px]  -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="buscar"
            className="w-auto px-5"
            onChange={(e) => handleSearch(e.target.value)}
          ></Input>
        </div>
        <Button
          size={"sm"}
          className="bg-Primary-light m-2 rounded-full text-lg sm:text-sm"
          onClick={handleChangeCreateProduct}
        >
          + <span className="hidden sm:block"> Nuevo producto</span>
        </Button>
      </div>
      {/* productos */}
      <div className="max-h-80 overflow-y-auto  drop-shadow-md">
        <Table className="bg-white rounded-b-md">
          <TableHeader className="sticky top-0 bg-gradient-to-tr from-green-200 to-green-100">
            <TableRow className="text-center text-sm font-semibold ">
              <TableHead className="text-center font-semibold sm:font-semibold text-Primary-darker">
                Bebida
              </TableHead>
              <TableHead className="text-center font-semibold text-Primary-darker">
                Cantidad en stock
              </TableHead>
              <TableHead className="text-center font-semibold text-Primary-darker">
                Precio
              </TableHead>
              <TableHead className=" font-semibold text-Primary-darker">
                Transferencia
              </TableHead>
              <TableHead className=" font-semibold text-Primary-darker">
                Efectivo
              </TableHead>
              <TableHead className="text-center font-semibold text-Primary-darker">
                Editar
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {searchProducts &&
              searchProducts.map((product, index) => (
                <TableRow key={index} className="text-center">
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="Transferencia"
                      value={produtsSale[product.id]?.transfer || ""}
                      onChange={(e) =>
                        handleChangeSale(
                          product.id,
                          "transfer",
                          parseInt(e.target.value) || 0,
                          product.price,
                          setProdutsSale
                        )
                      }
                      className="w-20 sm:w-auto border border-gray-400 "
                    ></Input>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      placeholder="Efectivo"
                      value={produtsSale[product.id]?.cash || ""}
                      onChange={(e) =>
                        handleChangeSale(
                          product.id,
                          "cash",
                          parseInt(e.target.value) || 0,
                          product.price,
                          setProdutsSale
                        )
                      }
                      className="w-20 sm:w-auto border border-gray-400 "
                    ></Input>
                  </TableCell>
                  <TableCell className="">
                    <Edit
                      size={20}
                      onClick={() => {
                        setDataEditProduct(product);
                        handleChangeEditProduct();
                      }}
                      className="text-Primary-dark hover:cursor-pointer w-full"
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      {isOpenEditProduct && <LazyComponent />}
    </section>
  );
};

export default ListProducts;
