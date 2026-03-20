"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ScrollToProducts() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.get("search");

    if (search) {
      const el = document.getElementById("products-section");

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [searchParams]);

  return null;
}
