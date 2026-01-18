import  { useEffect, useRef } from 'react'
type infinityscroll = {
    loadmore: () => void,
    loading: boolean,
    hasmore: boolean
}

const useInfinityScroll = ({loadmore, loading, hasmore}:infinityscroll) => {
    const ref =  useRef(null);

    useEffect(()=>{
        if(!ref.current || loading || !hasmore) return;

        const handleObserver = new IntersectionObserver(
            ([entry]) => {
                if(entry.isIntersecting && ! loading && hasmore){
                    loadmore();
                }
            },{
                threshold:0.3 ,
            }
        );

        handleObserver.observe(ref.current);
        return () => handleObserver.disconnect();
    },[loading, loadmore, hasmore])
  return (
    ref
  )
}

export default useInfinityScroll