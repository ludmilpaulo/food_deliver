import { useEffect } from 'react';

const useLoadScript = (url: string, callback: () => void) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.defer = true;
    script.onload = callback;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [url, callback]);
};

export default useLoadScript;
