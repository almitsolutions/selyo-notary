import { Suspense } from "react";
import { BookingWizard } from "@/components/booking-wizard";

export default function NewNotarizationPage() {
  return (
    <Suspense>
      <BookingWizard />
    </Suspense>
  );
}
