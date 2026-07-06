"use client";

import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { CartDrawer } from "@/components/CartDrawer";
import { TrackingBar } from "@/components/TrackingBar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <>
      <Navbar onOffersClick={() => router.push("/offers")} />
      <main className="mx-auto max-w-5xl px-0 sm:px-4 pb-28 sm:pb-8 min-h-[calc(100vh-3.5rem)]">
        {children}
      </main>
      <CartDrawer />
      <TrackingBar />
      <BottomNav />
    </>
  );
}
