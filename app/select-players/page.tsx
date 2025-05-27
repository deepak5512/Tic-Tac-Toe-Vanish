import { Suspense } from "react";
import SelectPageClient from "./SelectPageClient";

export default function SelectPlayersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SelectPageClient />
    </Suspense>
  );
}
