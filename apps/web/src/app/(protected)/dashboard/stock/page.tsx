import CreateProductModal from "../../_components/dashboard/createProductModal";
import CreateReportModal from "../../_components/dashboard/createReportModal";
import ListProducts from "@/app/(protected)/_components/dashboard/listProducts";
import getProducts from "@/actions/product/getProducts";
import FooterStock from "../../_components/dashboard/footerStock";
import ListCourts from "../../_components/dashboard/listCourts";
import ListOthers from "../../_components/dashboard/listOthers";
import dateLocal from "@/utils/dateLocal";
import { format } from "date-fns";
import getReserveByDayNoTransform from "@/actions/reserve/get-reserve-day-notransform";
import { SideBarButton } from "../../_components/dashboard/sideBarButton";

const PageStock = async () => {
  const products = await getProducts();
  const localDate = format(dateLocal(), "dd/MM/yyyy");
  const dailyReserves = await getReserveByDayNoTransform(localDate);

  const countReservationsByType = () => {
    let webReservations = 0;
    let manualReservations = 0;

    dailyReserves.forEach((reservation) => {
      if (reservation.status === "APPROVED") {
        if (reservation.paymentId) {
          webReservations++;
        } else {
          manualReservations++;
        }
      }
    });

    return { webReservations, manualReservations };
  };
  return (
    <div className="w-full flex  flex-col justify-between bg-gradient-to-tr from-Neutral to-Neutral-light">
      <div className="p-2 w-full flex justify-end">
        <SideBarButton />
      </div>

      <ListProducts products={products} />
      <div className="w-full flex flex-wrap">
        {/* canchas */}
        <ListCourts />
        <ListOthers />
      </div>
      <FooterStock />

      <CreateProductModal />
      <CreateReportModal totalReservations={countReservationsByType()} />
    </div>
  );
};

export default PageStock;
