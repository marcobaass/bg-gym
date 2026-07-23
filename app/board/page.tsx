import { Suspense } from "react";
import BoardPageClient from "./BoardPageClient";

export default function Board() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BoardPageClient />
    </Suspense>
  );
}
