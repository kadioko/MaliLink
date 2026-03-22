"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function SessionMonitor() {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== "unauthenticated") {
      return;
    }

    const callbackUrl = pathname && pathname !== "/" ? pathname : "/dashboard";
    router.replace(`/login?reason=session-expired&callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }, [pathname, router, status]);

  return null;
}
