import React, { useCallback, useEffect, useState } from 'react'
import type { Photo } from '../types/types';
import useFetch from './useFetch';

const useInfinityPhoto = (url: string | null) => {
  const [page, setPage] = useState<number>(1);
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setloading] = useState<boolean>(false)
  const [hasmore, setHasMore] = useState<boolean>(true)


  const data = useFetch( `${url}&page=${page}`)

  useEffect(() => {
    setloading(true)
  }, [page])

  useEffect(() => {
    if (!data) return
    setPhotos(prev => [...prev, ...data.results]);
    setHasMore(Boolean(data.next));
    setloading(false);
  }, [data])

  const loadmore = useCallback(
    () => {
      if (loading || !hasmore) return;
      setPage(prev => prev + 1);
    },
    [loading, hasmore],
  )

  if (!url) {
    return {
      photos: [],
      loadmore: () => {},
      hasmore: false,
      loading: false,
    };
  }
  return {
    photos,
    loadmore,
    hasmore,
    loading
  }
}

export default useInfinityPhoto