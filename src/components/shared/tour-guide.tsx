"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { markTourComplete } from "@/actions/tour";

type TourGuideProps = {
  hasCompletedTour: boolean;
};

export function TourGuide({ hasCompletedTour }: TourGuideProps) {
  useEffect(() => {
    if (hasCompletedTour) return;

    const timeout = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        progressText: "{{current}} dari {{total}}",
        nextBtnText: "Selanjutnya →",
        prevBtnText: "← Kembali",
        doneBtnText: "Selesai",
        allowClose: true,
        overlayOpacity: 0.4,
        stagePadding: 8,
        popoverClass: "bayaro-tour",
        steps: [
          {
            element: "[data-tour='dashboard']",
            popover: {
              title: "Dashboard",
              description:
                "Lihat ringkasan penjualan, transaksi terbaru, dan performa bisnis Anda di sini.",
              side: "right",
              align: "start",
            },
          },
          {
            element: "[data-tour='employees']",
            popover: {
              title: "Karyawan",
              description: "Kelola karyawan dan akses mereka ke outlet.",
              side: "right",
              align: "start",
            },
          },
          {
            element: "[data-tour='outlets']",
            popover: {
              title: "Outlet",
              description: "Kelola lokasi toko dan cabang bisnis Anda.",
              side: "right",
              align: "start",
            },
          },
          {
            element: "[data-tour='settings']",
            popover: {
              title: "Pengaturan",
              description: "Atur preferensi bisnis Anda kapan saja.",
              side: "right",
              align: "start",
            },
          },
        ],
        onDestroyStarted: async () => {
          driverObj.destroy();
          await markTourComplete();
        },
      });

      driverObj.drive();
    }, 800);

    return () => clearTimeout(timeout);
  }, [hasCompletedTour]);

  return null;
}
