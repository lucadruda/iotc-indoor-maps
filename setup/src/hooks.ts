import React, { useCallback, useState } from "react";

export function useSteps(steps: React.FC[]) {
  const [current, setCurrent] = useState<number>(0);

  const next = useCallback(() => {
    setCurrent((current) => current++);
  }, [setCurrent]);

  const previous = useCallback(() => {
    setCurrent((current) => current--);
  }, [setCurrent]);

  return [steps[current], next, previous];
}
