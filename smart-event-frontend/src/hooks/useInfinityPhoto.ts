import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { fetchGalleryPhotos } from "../app/photoslice";
import { useCallback, useEffect } from "react";

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
  
  useEffect(() => {
    if (!pagination) {
      dispatch(fetchGalleryPhotos({ context, event_id }));
    }
  }, [pagination, dispatch, context, event_id]);
  
  return { loading, hasMore, loadMore };
};

export default useInfiniteGallery;

