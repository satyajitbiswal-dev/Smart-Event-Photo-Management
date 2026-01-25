import { useEffect, useState } from "react"
import privateapi from "../services/AxiosService"
import type { Photo } from "../types/types"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../app/store"
import { fetchEventPhotos } from "../app/photoslice"

type FetchResult<T> = {
  results: T[]
  next: string | null
}

const useFetch = (url: string | null, event_id: string | null) => {
  const [data, setData] = useState<FetchResult<Photo> | null>(null)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (!url) return

    const controller = new AbortController()

    const fetchPhotos = async () => {
      try {
        const response = await privateapi.get(url, {
          signal: controller.signal
        })

        const payload = {
          results: response.data.results,
          next: response.data.next
        }

        setData(payload)

        /* STORE IN REDUX (CACHE) */
        if (event_id) {
          dispatch(
            fetchEventPhotos({
              photos: payload.results,
              event_id
            })
          )
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err)
        }
      }
    }

    fetchPhotos()
    return () => controller.abort()
  }, [url, event_id, dispatch])

  return data
}

export default useFetch
