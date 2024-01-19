import { useEffect, useRef } from 'react';

export const useStateUpdatesListener = (state: any, callback: () => void) => {
  const prevStateRef = useRef(null);

  useEffect(() => {
    if (state !== prevStateRef.current) {
      callback();
      prevStateRef.current = state;
    }
  }, [callback, state]);
};
