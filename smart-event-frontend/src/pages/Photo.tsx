import {useEffect, useState} from 'react';
import {privateapi} from '../services/AxiosService.ts';
import type { Photo } from '../types/types.ts';

const PhotoList = () => {
    const[photos, setPhotos] = useState<Photo[]>([]);

    useEffect(() => {
        const fetchPhoto = async () =>{
            try {
                const response = await privateapi.get('photos/');
                setPhotos(response.data);
            } catch (error) {
                console.error('Error fetching photo data:', error);
            }
        }
        fetchPhoto();
    }, [])

  return (
    <div>
        This is your Home page
        {photos.length > 0 ? photos.map(photo=>(
            <div key={photo.photo_id}>
                <h3>{photo.photo_id}</h3>
                <img src={photo.thumbnail} alt={photo.photo_id}/>
            </div>
        ) ): <p>No Photos to show</p>}
    </div>
  )
}

export default PhotoList
