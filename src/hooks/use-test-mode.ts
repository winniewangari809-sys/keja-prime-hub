import { useState, useCallback, useEffect } from "react";
import type { AppRole } from "./use-auth";

const STORAGE_KEY = "kejahub-test-mode";

export interface TestModeState {
  isTestMode: boolean;
  previewRole: AppRole | null;
  enterTestMode: (role: AppRole) => void;
  exitTestMode: () => void;
}

export function useTestMode(): TestModeState {
  const [previewRole, setPreviewRole] = useState<AppRole | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setPreviewRole(stored as AppRole);
  }, []);

  const enterTestMode = useCallback((role: AppRole) => {
    sessionStorage.setItem(STORAGE_KEY, role);
    setPreviewRole(role);
  }, []);

  const exitTestMode = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setPreviewRole(null);
  }, []);

  return {
    isTestMode: previewRole !== null,
    previewRole,
    enterTestMode,
    exitTestMode,
  };
}
