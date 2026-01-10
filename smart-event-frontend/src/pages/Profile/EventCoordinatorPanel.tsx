import React from 'react'
import { useParams } from 'react-router-dom'

const EventCoordinatorPanel = () => {
  const { event_id } = useParams()
  return (
    <div>EventCoordinatorPanel - {event_id}</div>
  )
}

export default EventCoordinatorPanel