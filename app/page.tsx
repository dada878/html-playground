import { Suspense } from "react";
import Workspace from "./_components/workspace";

export default function Home() {
  return (
    <Suspense>
      <Workspace />
    </Suspense>
  );
}
