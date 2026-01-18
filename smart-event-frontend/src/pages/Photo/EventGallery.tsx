import  { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../app/store'
import { fetchEvents } from '../../app/eventslice'
import { Suspense, lazy } from 'react'

const Gallery = lazy(() => import('../../components/photo/Gallery'))

const EventGallery = () => {
  const {event_id} = useParams()
  const dispatch = useDispatch<AppDispatch>()
  useEffect(()=>{
     dispatch(fetchEvents())
  },[dispatch])  

    const allEvents = useSelector((state : RootState) => state.event.events) || []
  
    const newevent = allEvents.find((e)=>e.id === event_id)
    if(!newevent) return <h4>Event Not Found</h4>

  return (
    <Suspense fallback={<p>loading ...</p>}>
    <Gallery 
    title = {newevent.event_name}
    subtitle={newevent.event_date}
    mode={"event"}
    event={newevent}
    />
    </Suspense>
  )
}

export default EventGallery