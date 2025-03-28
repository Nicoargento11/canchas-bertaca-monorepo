import { Suspense } from "react";
import PaymentFailure from "./paymentFailure";

export default async function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Cargando...
        </div>
      }
    >
      <PaymentFailure />
    </Suspense>
  );
}
