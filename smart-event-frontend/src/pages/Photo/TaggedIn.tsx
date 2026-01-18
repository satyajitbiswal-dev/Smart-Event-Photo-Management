import  { Suspense, lazy } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'

const Gallery = lazy(() => import('../../components/photo/Gallery'))

const Tagged = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  if(!user) return;
  return (
    <Suspense fallback={<p>loading ...</p>}>
        <Gallery 
        title = {"You are Tagged In in these Photos"}
        subtitle={"These are your tagged In Photos"}
        mode={"tagged"}
        event={null}
        />
      </Suspense>
  )
}

export default Tagged