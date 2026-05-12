"use client";

import { useEffect, useState } from "react";
import { syncMealsFromLocal } from "./actions";
import { useRouter } from "next/navigation";

export default function SyncLocalStorage() {
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const syncData = async () => {
      const localDataStr = localStorage.getItem("meals");
      if (!localDataStr) return;

      try {
        const localData = JSON.parse(localDataStr);
        // If we have days and meals, let's sync
        if (localData.days && Array.isArray(localData.days) && localData.days.length > 0) {
          setSyncing(true);
          const result = await syncMealsFromLocal(localData);
          
          if (result.success) {
            // Remove from localStorage after successful sync
            localStorage.removeItem("meals");
            router.refresh();
          }
        }
      } catch (e) {
        console.error("Failed to sync local storage", e);
      } finally {
        setSyncing(false);
      }
    };

    syncData();
  }, [router]);

  if (syncing) {
    return (
      <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse z-50">
        <span className="text-sm font-medium">Syncing your meal plan...</span>
      </div>
    );
  }

  return null;
}
