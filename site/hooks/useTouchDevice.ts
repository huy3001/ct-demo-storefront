import { useState } from 'react';

const useTouchDevice = () => {
  const [isTouchDevice] = useState(
    () =>
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );

  return { isTouchDevice };
};

export default useTouchDevice;
