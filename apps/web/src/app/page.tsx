import { Home } from "@/components/home/home";
import LoginModal from "@/components/modals/loginModal";
import RegisterModal from "@/components/modals/registerModal";
import ReserveModal from "@/components/modals/reserveModal";
import ReviewModal from "@/components/modals/reviewModal";
import NavBar from "@/components/navbar/navBar";
import { getSession } from "@/services/auth/session";
import { getCourtByName } from "@/services/courts/courts";
import { getfixedSchedules } from "@/services/fixed-schedules/fixedSchedules";
import { getAvailableTurnsByDay } from "@/services/reserves/reserves";
import { getSchedules } from "@/services/schedule/schedule";
import { getScheduleDays } from "@/services/scheduleDay/scheduleDay";
import { getUnavailableDays } from "@/services/unavailableDay/unavailableDay";
import { format } from "date-fns";

export default async function HomePage() {
  const sessionUser = await getSession();
  const unavailableDays = await getUnavailableDays();
  const scheduleDays = await getScheduleDays();
  const fixedSchedules = await getfixedSchedules();
  const schedules = await getSchedules();

  const reservesDay = await getAvailableTurnsByDay(
    format(new Date(), "yyyy-MM-dd")
  );
  const courtData = await getCourtByName("dimasf5");

  return (
    <div className="">
      <NavBar currentUser={sessionUser} />
      <Home reservesDay={reservesDay} courtData={courtData} />
      <LoginModal />
      <RegisterModal />
      <ReserveModal
        currentUser={sessionUser}
        unavailableDays={unavailableDays}
        scheduleDays={scheduleDays}
        fixedSchedules={fixedSchedules}
        schedules={schedules}
      />
      <ReviewModal />
    </div>
  );
}
