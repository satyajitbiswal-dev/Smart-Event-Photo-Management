import {useEffect, useState} from 'react';
import {privateapi, publicapi} from '../services/AxiosService.ts';
import type { Photo } from '../types/types.ts';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store.ts';

const PhotoList = () => {
    const[photos, setPhotos] = useState<Photo[]>([]);

    useEffect(() => {
        const fetchPhoto = async () =>{
            try {
                const response = await privateapi.get('photos/');
                console.log('Fetched photo data:', response.data);
                setPhotos(response.data);
            } catch (error) {
                console.error('Error fetching photo data:', error);
            }
        }
        fetchPhoto();
    }, [])
    const token = useSelector((state: RootState) => {
    console.log("STORE TOKEN =", state.auth.access_token);
        return state.auth.access_token;
    });


  return (
    <div>
        This is your Home page
        {photos?.map(photo=>(
            <div key={photo.photo_id}>
                <h3>{photo.photo_id}</h3>
                <img src={photo.thumbnail} alt={photo.photo_id}/>
            </div>
        ) )}
    </div>
  )
}

export default PhotoList
