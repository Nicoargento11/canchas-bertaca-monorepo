"use client";
import { ProductInterface } from "@/types/db";
import React, {
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

interface ModalProviderProps {
  children: React.ReactNode;
}
type product = {
  [key: string | number]: { cash: number; transfer: number; price: number };
};

type report = {
  totalBebidas: { transfer: number; cash: number };
  totalCanchas: { transfer: number; cash: number };
  totalOtros: { transfer: number; cash: number };
  totalTransferencia: number;
  totalEfectivo: number;
  totalNeto: number;
};
type ThemeContext = {
  dataEditProduct: ProductInterface | undefined;
  setDataEditProduct: React.Dispatch<
    React.SetStateAction<ProductInterface | undefined>
  >;

  produtsSale: product;
  setProdutsSale: React.Dispatch<React.SetStateAction<product>>;
  courtsSale: product;
  setCourtsSale: React.Dispatch<React.SetStateAction<product>>;
  othersSale: product;
  setOthersSale: React.Dispatch<React.SetStateAction<product>>;
  handleChangeSale: (
    name: string | number,
    type: "cash" | "transfer",
    value: number,
    price: number,
    set: (value: SetStateAction<product>) => void
  ) => void;

  report: report | undefined;
  setReport: React.Dispatch<React.SetStateAction<report | undefined>>;
  handleDailyReport: () => void;

  isOpenCreateProduct: boolean;
  isOpenCreateReport: boolean;
  isOpenEditProduct: boolean;
  handleChangeEditProduct: () => void;
  handleChangeCreateProduct: () => void;
  handleChangeCreateReport: () => void;
};

const DashboardModalContext = createContext<ThemeContext | null>(null);

export const useDashboardModal = () => {
  const context = useContext(DashboardModalContext);

  if (!context) throw new Error("useAuth must be used within a AuthProvider");
  return context;
};

export const DashboardModalProvider = ({ children }: ModalProviderProps) => {
  //modals
  const [isOpenCreateProduct, setisOpenCreateProduct] = useState(false);
  const [isOpenCreateReport, setisOpenCreateReport] = useState(false);
  const [isOpenEditProduct, setisOpenEditProduct] = useState(false);
  // data
  const [produtsSale, setProdutsSale] = useState<product>({});
  const [dataEditProduct, setDataEditProduct] = useState<
    ProductInterface | undefined
  >();
  const [courtsSale, setCourtsSale] = useState<product>({});
  const [othersSale, setOthersSale] = useState<product>({});
  //report
  const [report, setReport] = useState<report>();

  const handleChangeCreateProduct = () => {
    setisOpenCreateProduct((value) => !value);
  };

  const handleChangeCreateReport = () => {
    setisOpenCreateReport((value) => !value);
  };

  const handleChangeEditProduct = () => {
    setisOpenEditProduct((value) => !value);
  };

  const sumarPrecios = (ventas: product) => {
    let transfer = 0;
    let cash = 0;
    for (let sale in ventas) {
      const product = ventas[sale];
      if (product.transfer) {
        transfer += product.price
          ? product.transfer * product.price
          : product.transfer;
      }
      if (product.cash) {
        cash += product.price ? product.cash * product.price : product.cash;
      }
    }
    return { transfer, cash };
  };

  const handleDailyReport = () => {
    const totalBebidas = sumarPrecios(produtsSale);
    const totalCanchas = sumarPrecios(courtsSale);
    const totalOtros = sumarPrecios(othersSale);

    const totalTransferencia =
      totalBebidas.transfer + totalCanchas.transfer + totalOtros.transfer;
    const totalEfectivo =
      totalBebidas.cash + totalCanchas.cash + totalOtros.cash;
    const totalNeto = totalTransferencia + totalEfectivo;

    setReport({
      totalBebidas,
      totalCanchas,
      totalOtros,
      totalTransferencia,
      totalEfectivo,
      totalNeto,
    });
  };

  const handleChangeSale = useCallback(
    (
      name: string | number,
      type: "cash" | "transfer",
      value: number,
      price: number,
      setState: (value: SetStateAction<product>) => void
    ) => {
      setState((prevSales) => ({
        ...prevSales,
        [name]: {
          ...prevSales[name],
          [type]: value,
          price: price,
        },
      }));
    },
    []
  );

  return (
    <DashboardModalContext.Provider
      value={{
        isOpenCreateProduct,
        isOpenCreateReport,
        isOpenEditProduct,
        handleChangeCreateProduct,
        handleChangeCreateReport,
        handleChangeEditProduct,
        courtsSale,
        othersSale,
        produtsSale,
        setCourtsSale,
        setOthersSale,
        setProdutsSale,
        handleChangeSale,

        dataEditProduct,
        setDataEditProduct,

        report,
        setReport,
        handleDailyReport,
      }}
    >
      {children}
    </DashboardModalContext.Provider>
  );
};

export default DashboardModalContext;
