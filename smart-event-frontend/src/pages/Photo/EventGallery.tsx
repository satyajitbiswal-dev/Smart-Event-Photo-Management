import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Gallery from '../../components/photo/Gallery'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../app/store'
import { fetchEvents } from '../../app/eventslice'

const EventGallery = () => {
  const {event_id} = useParams()
  const dispatch = useDispatch<AppDispatch>()
  useEffect(()=>{
     dispatch(fetchEvents())
  },[dispatch])  

    const allEvents = useSelector((state : RootState) => state.event.events) || []
    console.log(allEvents);
    const newevent = allEvents.find((e)=>e.id === event_id)
    if(!newevent) return <h4>Event Not Found</h4>

  return (
    <Gallery 
    title = {newevent.event_name}
    subtitle={newevent.event_date}
    mode={"event"}
    event={newevent}
    />
  )
}

export default EventGallery