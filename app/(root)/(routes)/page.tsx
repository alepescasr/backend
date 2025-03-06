"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const SetupPage = () => {
  const router = useRouter();
  const { userId } = useAuth();

  useEffect(() => {
    // Si el usuario está autenticado, redirigir al dashboard
    if (userId) {
      router.push("/dashboard");
    }
  }, [router, userId]);

  return null;
};

export default SetupPage;
