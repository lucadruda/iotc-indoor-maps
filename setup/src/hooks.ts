import React, { useCallback, useState } from "react";

export function useSteps(start?: number): [number, () => void, () => void] {
  const [current, setCurrent] = useState<number>(start || 0);

  const next = useCallback(() => {
    setCurrent((current) => current + 1);
  }, [setCurrent]);

  const previous = useCallback(() => {
    setCurrent((current) => current - 1);
  }, [setCurrent]);

  return [current, next, previous];
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export type Submit = {
  submitting: boolean;
  submit: () => void;
  reset: () => void;
};
export function useSubmit(init: boolean) {
  const [value, setValue] = useState(init);

  const reset = useCallback(() => {
    setValue(false);
  }, [setValue]);

  const set = useCallback(() => {
    setValue(true);
  }, [setValue]);

  return { submitting: value, set, reset };
}

export type StepProps = {
  visible: boolean;
  submit: boolean;
  resetSubmit: () => void;
  enableNext: () => void;
};