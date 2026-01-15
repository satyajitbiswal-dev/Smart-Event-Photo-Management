import React from 'react'
import { useParams } from 'react-router-dom'
import UpdateEvent from '../../components/RBAC/Coordinator/UpdateEvent'

const EventCoordinatorPanel = () => {
  const { event_id } = useParams()
  return (
    <UpdateEvent event_id={event_id} />
  )
}

export default EventCoordinatorPanel