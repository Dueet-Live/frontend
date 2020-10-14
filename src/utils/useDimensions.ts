import { useEffect, useRef, useState } from 'react';

export type Dimensions = { width: number; height: number };

export const useDimensions = <T extends HTMLElement>(): [
  Dimensions,
  React.MutableRefObject<T | null>
] => {
  // the element that we want to observe the dimensions
  const ref = useRef<T>(null);
  const [dimensions, setDimension] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  const set = () =>
    setDimension(
      ref.current?.getBoundingClientRect() ?? { width: 0, height: 0 }
    );

  useEffect(() => {
    set();
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, []);

  return [dimensions, ref];
};
