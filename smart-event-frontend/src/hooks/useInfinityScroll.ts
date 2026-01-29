import { useEffect, useRef, type RefObject } from "react";

type InfinityScrollProps = {
  loadmore: () => void;
  loading: boolean;
  hasmore: boolean;
  containerRef: RefObject<HTMLElement | null>,
  deps?: unknown[]; // extra deps from caller (e.g. items length)
};

const useInfinityScroll = ({containerRef, loadmore, loading, hasmore, deps = [] }: InfinityScrollProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasmore) {
          console.log("Intersecting:", entry?.isIntersecting)
          loadmore();
        }
      },
      {
        root: containerRef.current, 
        rootMargin: "0px 0px 300px 0px",
        threshold: 0,
      }
    );

    observerRef.current.observe(target);

    return () => observerRef.current?.disconnect();
  }, [loadmore, loading, hasmore, ...deps, containerRef]);

  return ref;
};

export default useInfinityScroll;
