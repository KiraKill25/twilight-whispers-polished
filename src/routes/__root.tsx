import { useState } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { SplashScreen } from "@/components/SplashScreen";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}
      <Outlet />
    </>
  );
}
