import React from "react";
import BiTableDay from "../_components/dashboard/dashboard/biTableDay";
import { getSession } from "@/services/auth/session";
import { getCourtByName } from "@/services/courts/courts";
import ReserveModal from "../_components/dashboard/dashboard/reserveModal";
import ReserveDetailsModal from "../_components/dashboard/dashboard/reserveDetailsModal";
import EditReserveModal from "../_components/dashboard/dashboard/editReserveModal";

const PageDashboard = async () => {
  const courtData = await getCourtByName("dimasf5");
  const sessionUser = await getSession();

  return (
    <>
      <BiTableDay
        userEmail={sessionUser?.user.email}
        userId={sessionUser?.user.id}
        courtData={courtData}
      />
      <ReserveModal />
      <ReserveDetailsModal />
      <EditReserveModal />
    </>
  );
};

export default PageDashboard;
