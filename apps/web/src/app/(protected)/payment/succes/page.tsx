import { Suspense } from "react";
import PaymentSucces from "./paymentSucces";

export default async function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Cargando...
        </div>
      }
    >
      <PaymentSucces />
    </Suspense>
  );
}
