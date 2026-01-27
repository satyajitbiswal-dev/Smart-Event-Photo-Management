import  { Suspense, lazy } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'

const Gallery = lazy(() => import('../../components/photo/Gallery'))

const MyFavourites = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  if(!user) return;
  return (
    <Suspense fallback={<p>loading ...</p>}>
        <Gallery 
        title = {"Your Favourite Photos"}
        subtitle={"These are your Favourite Photos"}
        mode={"favourites"}
        viewMode='view'
        />
      </Suspense>
  )
}

export default MyFavourites