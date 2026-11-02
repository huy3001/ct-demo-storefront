import { useCallback, useEffect, useState } from 'react';

const useWindowLoaded = () => {
  const [windowLoaded, setWindowLoaded] = useState(false);

  const markWindowAsLoaded = useCallback(() => {
    setWindowLoaded(true);
  }, []);

  useEffect(() => {
    window.addEventListener('load', markWindowAsLoaded);

    return () => window.removeEventListener('load', markWindowAsLoaded);
  }, [markWindowAsLoaded]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (document.readyState === 'complete') setWindowLoaded(true);
  }, []);

  return windowLoaded;
};

export default useWindowLoaded;
