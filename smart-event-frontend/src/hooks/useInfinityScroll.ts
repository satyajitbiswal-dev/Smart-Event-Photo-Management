import { useEffect, useRef } from "react";

type InfinityScrollProps = {
  loadmore: () => void;
  loading: boolean;
  hasmore: boolean;
  deps?: unknown[]; // extra deps from caller (e.g. items length)
};

const useInfinityScroll = ({ loadmore, loading, hasmore, deps = [] }: InfinityScrollProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const target = ref.current;
    // console.log("🔍 useInfinityScroll effect", {
    //   hasTarget: Boolean(target),
    //   loading,
    //   hasmore,
    // });

    if (!target) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // console.log("👁️ IntersectionObserver callback", {
        //   isIntersecting: entry.isIntersecting,
        //   ratio: entry.intersectionRatio,
        //   loading,
        //   hasmore,
        // });

        if (entry.isIntersecting && !loading && hasmore) {
          // console.log("🔁 Infinite scroll: load more", { loading, hasmore });
          loadmore();
        }
      },
      {
        root: null,
        rootMargin: "200px 0px 0px 0px",
        threshold: 0,
      }
    );

    observerRef.current.observe(target);

    return () => observerRef.current?.disconnect();
  }, [loadmore, loading, hasmore, deps]);

  return ref;
};

export default useInfinityScroll;
