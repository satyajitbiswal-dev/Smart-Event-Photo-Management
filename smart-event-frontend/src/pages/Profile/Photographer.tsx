import React from 'react'
import { useParams } from 'react-router-dom'

const Photographer = () => {
  const { event_id } = useParams()
  return (
    <div>Photographer -{ event_id}</div>
  )
}

export default Photographer