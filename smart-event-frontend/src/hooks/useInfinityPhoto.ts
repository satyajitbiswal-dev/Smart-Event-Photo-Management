import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { fetchGalleryPhotos } from "../app/photoslice";
import { useEffect } from "react";
import {useInView} from 'react-intersection-observer'

const useInfiniteGallery = (context: "event" | "favourites" | "tagged",event_id?: string) => {
  const dispatch = useDispatch<AppDispatch>();

  const pagination = useSelector((state: RootState) =>context === "event"
     ? state.photo.pagination.event[event_id!]
      : state.photo.pagination[context]
  );
  
  const { ref, inView} = useInView({
    threshold:1
  });

  const loading = pagination?.loading ?? false;
  const hasMore = pagination?.hasMore ?? true;

  useEffect(() => {
    if(!loading && hasMore && inView){
      dispatch(fetchGalleryPhotos({ context, event_id }));
    }
  },[dispatch, loading, hasMore, inView, context, event_id])

  return { ref ,loading, hasMore};
};

export default useInfiniteGallery;

