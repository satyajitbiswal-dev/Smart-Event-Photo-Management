import  { useEffect, useState } from 'react'
import privateapi from '../services/AxiosService'
import type { Photo } from '../types/types'

type FetchResult<T> = {
  results: T[];
  next: string | null;
};

const useFetch = (url:string| null) => {
    const [data, setData] = useState<FetchResult<Photo> | null >(null)
    

    useEffect(() => {
    if(!url) return;
      const controller  = new AbortController

      const fetchPhotos = async () =>{
        try {
            const response = await privateapi.get(url, {
                signal: controller.signal
            })
            setData({
          results: response.data.results,
          next: response.data.next,
        })
        } catch (err) {
             if (err.name !== "AbortError") {
        console.error(err);
      }
        }
      }
      
      fetchPhotos()
      return () =>  controller.abort()
    }, [url])
    
  return data
}

export default useFetch