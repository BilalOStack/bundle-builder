import { useEffect, useRef } from 'react';

/**
 * A collapsed accordion panel stays in the DOM so its height can animate, but
 * it must not be reachable by keyboard or announced by a screen reader.
 * `inert` is set imperatively because React 18's typings don't carry it.
 */
export function useInert<T extends HTMLElement>(inert: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (inert) node.setAttribute('inert', '');
    else node.removeAttribute('inert');
  }, [inert]);

  return ref;
}
