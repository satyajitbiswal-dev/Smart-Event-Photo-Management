// import { useCallback, useEffect, useState } from "react"
// import useFetch from "./useFetch"

// const useInfinityPhoto = (url: string | null, event_id: string | null) => {
//   const [page, setPage] = useState(1)
//   const [loading, setLoading] = useState(false)
//   const [hasMore, setHasMore] = useState(true)

//   const data = useFetch(
//     url ? `${url}&page=${page}` : null,
//     event_id
//   )

//   /* reset when url / event changes */
//   useEffect(() => {
//     setPage(1)
//     setHasMore(true)
//   }, [url, event_id])

//   /* handle pagination meta only */
//   useEffect(() => {
//     if (!data) return
//     setHasMore(Boolean(data.next))
//     setLoading(false)
//   }, [data])

//   const loadmore = useCallback(() => {
//     if (loading || !hasMore) return
//     setLoading(true)
//     setPage(prev => prev + 1)
//   }, [loading, hasMore])

//   return {
//     loading,
//     loadmore,
//     hasmore: hasMore
//   }
// }

// export default useInfinityPhoto

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { fetchGalleryPhotos } from "../app/photoslice";
import { useCallback } from "react";

const useInfiniteGallery = (context: "event" | "favourites" | "tagged",event_id?: string) => {
  const dispatch = useDispatch<AppDispatch>();

  const pagination = useSelector((state: RootState) =>
    context === "event"
      ? state.photo.pagination.event[event_id!]
      : state.photo.pagination[context]
  );

  const loading = pagination?.loading ?? false;
  const hasMore = pagination?.hasMore ?? true;

   const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      dispatch(fetchGalleryPhotos({ context, event_id }));
    }
  }, [dispatch, context, event_id, loading, hasMore]);
  
  return { loading, hasMore, loadMore };
};

export default useInfiniteGallery;

