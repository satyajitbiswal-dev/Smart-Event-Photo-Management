import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Photo } from "../types/types";
import privateapi from "../services/AxiosService";
import { upsertUsers } from "./userslice";

type PhotoState = {
    photosById: Record<string, Photo>;
    selectedPhotoId: string | null;
    photoIdsByContext: {
        event: Record<string, string[]>, //Any add or delete in in event photo
        favourites: string[], //Any add or delete in favourites(state sync) (no need to refetch again)
        tagged: string[] //Any add or delete in tagged In photos
    }
}

const initialState: PhotoState = {
    photosById: {},
    selectedPhotoId: null,
    photoIdsByContext: {
        event: {},
        favourites: [],
        tagged: []
    }
}
//PhotoDetails
export const fetchPhotoDetails = createAsyncThunk(
    'photos/fetchPhotoDetails',
    async (photo_id: string, { rejectWithValue, dispatch }) => {
        try {
            const response = await privateapi.get(`photos/${photo_id}/`)
            const taggedUsers = response.data.tagged_user
            dispatch(upsertUsers(taggedUsers));
            return {
                ...response.data,
                tagged_user: taggedUsers.map((e) => e.email)
            }
        } catch (error) {
            return rejectWithValue(error?.response?.data || 'Something Went wrong')
        }
    }
)

//EventPhotos

//add, remove, fetch, update

//  add a photo
export const addPhotos = createAsyncThunk(
    'photo/addPhoto',
    async ({data, event_id}:{data: any, event_id: string}, { rejectWithValue }) => {
        try {
            await privateapi.post(`photos/upload_photo/${event_id}/`, data,
                {
                   headers:{
                    'Content-Type':'multipart/form-data'
                   } 
                }
            )
            return data
        } catch (error) {
            return rejectWithValue(error?.response?.data || 'Something Went wrong')
        }
    }
)



// remove photos





//fetch photos
export const updatePhotos = createAsyncThunk(
    'photo/bulkUpdate',
    async (data: any, { rejectWithValue }) => {
        try {
            await privateapi.patch(`photos/update_photo/`, data)
            return data
        } catch (error) {
            return rejectWithValue(error?.response?.data || 'Something Went wrong')
        }
    }
)






//update photo(bulk)







//update photo(single)






//Favourites

// fetch


export const fetchFavourites = createAsyncThunk(
    'photos/fetchFavourites',
    async ({ rejectWithValue }) => {
        try {
            const response = await privateapi.get(`photos/?favourites=true`)
            return response.data
        } catch (error) {
            return rejectWithValue(error?.response?.data || 'Something Went wrong')
        }
    }
)

// add
export const addFavouritesAPI = (id: string) =>
    privateapi.post(`/photo/${id}/add_favourite/`);

// remove
export const removeFavouritesAPI = (id: string) =>
    privateapi.delete(`/photo/${id}/remove_favourite/`);

//Tagged

// fetch
export const fetchTagged = createAsyncThunk(
    'photos/fetchTagged',
    async (_, { rejectWithValue }) => {
        try {
            const response = await privateapi.get(`photos/?tagged=true`)
            return response.data
        } catch (error) {
            return rejectWithValue(error?.response?.data || 'Something Went wrong')
        }
    }
)

// like

// add
export const addLikeAPI = (id: string) =>
    privateapi.post(`/photo/${id}/add_like/`);

// remove
export const removeLikeAPI = (id: string) =>
    privateapi.delete(`/photo/${id}/remove_like/`);


import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "../../app/store"

/* base selectors */
const selectPhotosById = (state: RootState) =>
    state.photo.photosById

const selectEventPhotoIds = (eventId: string) =>
    (state: RootState) =>
        state.photo.photoIdsByContext.event[eventId] || []

/* FINAL event-based selector */
export const makeSelectEventPhotos = (eventId: string) =>
    createSelector(
        [selectPhotosById, selectEventPhotoIds(eventId)],
        (photosById, ids) => ids.map(id => photosById[id])
    )




const photoSlice = createSlice({
    name: 'photo',
    initialState,
    reducers: {
        fetchEventPhotos: (state, action) => {
            const { photos, event_id } = action.payload

            if (!state.photoIdsByContext.event[event_id]) {
                state.photoIdsByContext.event[event_id] = []
            }

            photos.forEach(photo => {
                const photoId = photo.photo_id

                if (!state.photosById[photoId]) {
                    state.photosById[photoId] = photo
                }
                if (!state.photoIdsByContext.event[event_id].includes(photoId)) {
                    state.photoIdsByContext.event[event_id].push(photoId)
                }

            })
        },

        clearPhotoId: (state) => {
            state.selectedPhotoId = null
        },

        //Favourites
        addtoFavourites: (state, action) => {
            state.photoIdsByContext.favourites.unshift(action.payload) //statring me append
        },
        removeFromFavourites: (state, action) => {
            state.photoIdsByContext.favourites =
                state.photoIdsByContext.favourites.filter((e) => e !== action.payload)
        },

        //Likes
        photoLiked: (state, action) => {
            const { photo_id, like_count } = action.payload;
            if (!state.photosById[photo_id]) { //Photo not in local state(just an edge case not possible most prolly)
                return;
            }
            state.photosById[photo_id].like_count = like_count;
        },

        //CommentAdded


    },
    extraReducers: (builder) => {
        builder.addCase(fetchPhotoDetails.fulfilled, (state, action) => { //One Source of photo
            const photo = action.payload
            state.photosById[photo.photo_id] = photo;
            state.selectedPhotoId = photo.photo_id
        })
        builder.addCase(updatePhotos.fulfilled, (state, action) => {
            const photo_ids = action.payload.photo_ids
            const updatedPhoto = action.payload

            for (const id of photo_ids) {
                const photo = state.photosById[id]
                if (!photo) continue

                //  TAGS
                if (updatedPhoto.tags) {
                    photo.tag.push(...updatedPhoto.tags)
                }

                //  TAGGED USERS
                if (updatedPhoto.tagged_users) {
                    photo.tagged_user.push(...updatedPhoto.tagged_users)
                }

                // PRIVATE FLAG
                if (updatedPhoto.is_private !== undefined) {
                    photo.is_private = updatedPhoto.is_private
                }

                //  EVENT CHANGE 
                if (updatedPhoto.event && updatedPhoto.event !== photo.event) {
                    const oldEvent = photo.event
                    const newEvent = updatedPhoto.event

                    // remove from old event
                    if (oldEvent) {
                        state.photoIdsByContext.event[oldEvent] =
                            state.photoIdsByContext.event[oldEvent]?.filter(pid => pid !== id) ?? []

                        // add to new event
                        if (!state.photoIdsByContext.event[newEvent]) {
                            state.photoIdsByContext.event[newEvent] = []
                        }
                        state.photoIdsByContext.event[newEvent].push(id)
                    }
                    // update photo object
                    photo.event = newEvent
                }
            }


        })

        //favourites

    }
})

export default photoSlice.reducer
export const { clearPhotoId,
    addtoFavourites,
    removeFromFavourites,
    photoLiked, fetchEventPhotos } = photoSlice.actions