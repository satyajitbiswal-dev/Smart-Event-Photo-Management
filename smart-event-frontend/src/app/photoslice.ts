import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Photo } from "../types/types";
import privateapi, { publicapi } from "../services/AxiosService";
import { upsertUsers } from "./userslice";
import type { RootState } from "./store";
export type GalleryFilters = {
    search: string;
    tags: string[];                // tag__tag_name
    tagged_users: string[];        // tagged_user__username
    photographer?: string;         // event__event_photographer__name
    event?: string;                // event_id (override)
    date_range?: 'today' | 'this_week' | 'last_week' | 'this_month';
    startDate?: string;            // upload_time_stamp_after
    endDate?: string;              // upload_time_stamp_before
};

type PaginationState = {
    page: number;
    hasMore: boolean;
    loading: boolean;
};

type PhotoState = {
    photosById: Record<string, Photo>;
    selectedPhotoId: string | null;

    photoIdsByContext: {
        event: Record<string, string[]>;
        favourites: string[];
        tagged: string[];
    };

    pagination: {
        event: Record<string, PaginationState>;
        favourites: PaginationState;
        tagged: PaginationState;
    };

    filters: {
        event: Record<string, GalleryFilters>;
        favourites: GalleryFilters;
        tagged: GalleryFilters;
    };
};

export const emptyFilters: GalleryFilters = {
    search: '',
    tags: [],
    tagged_users: [],
    photographer: undefined,
    event: undefined,
    date_range: undefined,
    startDate: undefined,
    endDate: undefined,
};


const emptyPagination = {
    page: 1,
    hasMore: true,
    loading: false,
};

const initialState: PhotoState = {
    photosById: {},
    selectedPhotoId: null,

    photoIdsByContext: {
        event: {},
        favourites: [],
        tagged: [],
    },

    pagination: {
        event: {},
        favourites: { ...emptyPagination },
        tagged: { ...emptyPagination },
    },
    filters: {
        event: {},
        favourites: { ...emptyFilters },
        tagged: { ...emptyFilters },
    },

};


//PhotoDetails
export const fetchPhotoDetails = createAsyncThunk(
    'photos/fetchPhotoDetails',
    async (photo_id: string, { rejectWithValue, dispatch }) => {
        try {
            const response = await publicapi.get(`photos/${photo_id}/`)
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


export const fetchGalleryPhotos = createAsyncThunk(
    'photos/fetchGalleryPhotos',
    async ({ context, event_id, }: { context: 'event' | 'favourites' | 'tagged'; event_id?: string; },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as RootState;

            /*  pagination  */
            let page = 1;
            let url = '/photos/?';

            if (context === 'event' && event_id) {
                const p = state.photo.pagination.event[event_id];
                page = p?.page ?? 1;
                url += `event_id=${event_id}&page=${page}`;
            }

            if (context === 'favourites') {
                page = state.photo.pagination.favourites.page;
                url += `favorites=true&page=${page}`;
            }

            if (context === 'tagged') {
                page = state.photo.pagination.tagged.page;
                url += `tagged=true&page=${page}`;
            }

            /*  filters */
            const filters =
                context === 'event'
                    ? state.photo.filters.event[event_id!]
                    : state.photo.filters[context];

            if (filters) {
                if (filters.search) {
                    url += `&search=${encodeURIComponent(filters.search)}`
                }
                filters.tags.forEach((tag) => {
                    url += `&tag__tag_name__icontains=${encodeURIComponent(tag)} `
                })
                filters.tagged_users?.forEach(user => {
                    url += `&tagged_user__username__icontains=${encodeURIComponent(user)}`;
                });

                if (filters.photographer) {
                    url += `&event__event_photographer__name=${encodeURIComponent(
                        filters.photographer
                    )}`;
                }

                if (filters.date_range) {
                    url += `&date_range=${filters.date_range}`;
                }

                if (filters.startDate) {
                    url += `&upload_time_stamp_after=${filters.startDate}`;
                }

                if (filters.endDate) {
                    url += `&upload_time_stamp_before=${filters.endDate}`;
                }
            }

            /*  API call  */
            const response = await privateapi.get(url);

            return { context, event_id, results: response.data.results, hasMore: Boolean(response.data.next) };
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data || 'Failed to fetch gallery photos'
            );
        }
    }
);


//add, remove update

//  add a photo
export const addPhotos = createAsyncThunk(
    'photo/addPhoto',
    async ({ data, event_id }: { data: any, event_id: string }, { rejectWithValue }) => {
        try {
            await privateapi.post(`photos/upload_photo/${event_id}/`, data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )
            return data
        } catch (error) {
            return rejectWithValue(error?.response?.data || 'Something Went wrong')
        }
    }
)
// remove photo

export const deletePhotos = createAsyncThunk(
    'photos/deletePhotos',
    async (
        {
            event_id,
            photo_ids,
        }: { event_id: string; photo_ids: string[] },
        { rejectWithValue }
    ) => {
        try {
            await privateapi.delete(
                `/photos/delete_photo/${event_id}/`,
                {
                    data: { photo_ids },
                }
            );

            return { photo_ids, event_id };
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data || 'Failed to delete photos'
            );
        }
    }
);


//update photo
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


//update photo(single)

//Favourites
// add
export const addFavouritesAPI = (id: string) =>
    privateapi.post(`/photo/${id}/add_favourite/`);

// remove
export const removeFavouritesAPI = (id: string) =>
    privateapi.delete(`/photo/${id}/remove_favourite/`);

// Like
// add
export const addLikeAPI = (id: string) =>
    privateapi.post(`/photo/${id}/add_like/`);

// remove
export const removeLikeAPI = (id: string) =>
    privateapi.delete(`/photo/${id}/remove_like/`);



const photoSlice = createSlice({
    name: 'photo',
    initialState,
    reducers: {
        setGalleryFilters: (state, action: {
            payload: {
                context: 'event' | 'favourites' | 'tagged';
                event_id?: string;
                filters: Partial<GalleryFilters>;
            };
        }) => {

            const { context, event_id, filters } = action.payload;

            const targetFilters =
                context === 'event'
                    ? (state.filters.event[event_id!] ??= { ...emptyFilters })
                    : state.filters[context];

            Object.assign(targetFilters, filters);

            // RESET pagination
            const pagination =
                context === 'event'
                    ? (state.pagination.event[event_id!] ??= {
                        page: 1,
                        hasMore: true,
                        loading: false,
                    })
                    : state.pagination[context];

            pagination.page = 1;
            pagination.hasMore = true;

            // Clear current ids
            if (context === 'event') {
                state.photoIdsByContext.event[event_id!] = [];
            } else {
                state.photoIdsByContext[context] = [];
            }
        },
        resetGalleryFilters: (state, action: {
            payload: {
                context: 'event' | 'favourites' | 'tagged'; event_id?: string;
            };
        }) => {
            const { context, event_id } = action.payload;

            /* RESET FILTERS  */
            if (context === 'event') {
                if (!event_id) return;

                state.filters.event[event_id] = { ...emptyFilters };
            } else {
                state.filters[context] = { ...emptyFilters };
            }

            /* RESET PAGINATION  */
            if (context === 'event') {
                if (!event_id) return;
                state.pagination.event[event_id] = { page: 1, hasMore: true, loading: false, };
                state.photoIdsByContext.event[event_id] = [];
            } else {
                state.pagination[context] = {
                    page: 1,
                    hasMore: true,
                    loading: false,
                };
                state.photoIdsByContext[context] = [];
            }
        },
        resetGalleryPagination: (
            state,
            action: PayloadAction<{ context: 'event' | 'favourites' | 'tagged'; event_id?: string }>
        ) => {
            const { context, event_id } = action.payload;

            if (context === 'event') {
                if (event_id) {
                    state.pagination.event[event_id] = {
                        page: 1,
                        hasMore: true,
                        loading: false,
                    };
                    state.photoIdsByContext.event[event_id] = [];
                }
            } else {
                state.pagination[context] = {
                    page: 1,
                    hasMore: true,
                    loading: false,
                };
                state.photoIdsByContext[context] = [];
            }
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
        const { photo_id, like_count, user_email, actionType } = action.payload;

        const photo = state.photosById[photo_id];
        if (!photo) return;

        photo.like_count = like_count;

        if (actionType === "add") {
            if (!photo.liked_users.includes(user_email)) {
                photo.liked_users.push(user_email);
            }
        } else {
            photo.liked_users = photo.liked_users.filter(
                e => e !== user_email
            );
        }
    }



    //CommentAdded


},

    extraReducers: (builder) => {
        builder
            /* FETCH GALLERY */

            .addCase(fetchGalleryPhotos.pending, (state, action) => {
                const { context, event_id } = action.meta.arg;

                if (context === 'event') {
                    if (!state.pagination.event[event_id!]) {
                        state.pagination.event[event_id!] = {
                            page: 1,
                            hasMore: true,
                            loading: false,
                        };
                    }
                    state.pagination.event[event_id!].loading = true;
                } else {
                    state.pagination[context].loading = true;
                }
            })

            .addCase(fetchGalleryPhotos.fulfilled, (state, action) => {
                const { context, event_id, results, hasMore } = action.payload;

                if (results.length === 0) {
                    if (context === 'event') {
                        state.pagination.event[event_id!].hasMore = false;
                        state.pagination.event[event_id!].loading = false;
                        console.log(hasMore, context);
                    } else {
                        state.pagination[context].hasMore = false;
                        state.pagination[context].loading = false;
                    }
                    return;
                }

                /*  decide target ids array  */
                 console.log(hasMore, context);
                let targetIds: string[];

                if (context === 'event') {
                    if (!state.photoIdsByContext.event[event_id!]) {
                        state.photoIdsByContext.event[event_id!] = [];
                    }
                    targetIds = state.photoIdsByContext.event[event_id!];
                } else {
                    targetIds = state.photoIdsByContext[context];
                }

                /*upsert photos */
                results.forEach((photo) => {
                    const id = photo.photo_id;

                    // ONE source of truth
                    state.photosById[id] = photo;

                    // avoid duplicates
                    if (!targetIds.includes(id)) {
                        targetIds.push(id);
                    }
                });

                /*  update pagination  */
                if (context === 'event') {
                    const p = state.pagination.event[event_id!];
                    p.page += 1;
                    p.hasMore = hasMore;
                    p.loading = false;
                } else {
                    state.pagination[context].page += 1;
                    state.pagination[context].hasMore = hasMore;
                    state.pagination[context].loading = false;
                }
            })

            .addCase(fetchGalleryPhotos.rejected, (state, action) => {
                const { context, event_id } = action.meta.arg;

                if (context === 'event') {
                    if (state.pagination.event[event_id!]) {
                        state.pagination.event[event_id!].loading = false;
                    }
                } else {
                    state.pagination[context].loading = false;
                }
            });

        

        builder.addCase(fetchPhotoDetails.fulfilled, (state, action) => {
            const p = action.payload;

            state.photosById[p.photo_id] = {
                ...state.photosById[p.photo_id], // merge with partial (gallery)
                ...p,

                liked_users: p.liked_users ?? [],
                is_favourite_of: p.is_favourite_of ?? [],
                tagged_user: p.tagged_user ?? [],
                tag: p.tag ?? [],
                exifData: p.exifData ?? {},

                hasFullDetails: true,
            };

            state.selectedPhotoId = p.photo_id;
        });


        builder.addCase(updatePhotos.fulfilled, (state, action) => {
            const photo_ids = action.payload.photo_ids;
            const updated = action.payload;

            for (const id of photo_ids) {
                const photo = state.photosById[id];
                if (!photo) continue;

                if (updated.tags) {
                    photo.tag.push(...updated.tags);
                }

                if (updated.tagged_users) {
                    photo.tagged_user.push(...updated.tagged_users);
                }

                if (updated.is_private !== undefined) {
                    photo.is_private = updated.is_private;
                }

                if (updated.event && updated.event !== photo.event) {
                    const oldEvent = photo.event;
                    const newEvent = updated.event;

                    if (oldEvent) {
                        state.photoIdsByContext.event[oldEvent] =
                            state.photoIdsByContext.event[oldEvent]?.filter(pid => pid !== id) ?? [];
                    }

                    if (!state.photoIdsByContext.event[newEvent]) {
                        state.photoIdsByContext.event[newEvent] = [];
                    }
                    state.photoIdsByContext.event[newEvent].push(id);

                    photo.event = newEvent;
                }
            }
        });
        builder.addCase(deletePhotos.fulfilled, (state, action) => {
            const { photo_ids, event_id } = action.payload;

            photo_ids.forEach((id) => {
                /* remove from photosById */
                delete state.photosById[id];

                /* remove from event */
                if (event_id && state.photoIdsByContext.event[event_id]) {
                    state.photoIdsByContext.event[event_id] =
                        state.photoIdsByContext.event[event_id].filter(pid => pid !== id);
                }

                /* remove from favourites */
                state.photoIdsByContext.favourites =
                    state.photoIdsByContext.favourites.filter(pid => pid !== id);

                /* remove from tagged */
                state.photoIdsByContext.tagged =
                    state.photoIdsByContext.tagged.filter(pid => pid !== id);
            });

            /* 🔥 IMPORTANT: pagination sanity */
            if (event_id) {
                const idsLeft = state.photoIdsByContext.event[event_id]?.length ?? 0;
                const pagination = state.pagination.event[event_id];

                // agar current list khaali ho gayi
                if (idsLeft === 0 && pagination) {
                    pagination.hasMore = true;   // allow next fetch
                    pagination.loading = false;
                    pagination.page = Math.max(1, pagination.page - 1);
                }
            }
        });

    }
})

export default photoSlice.reducer
export const { setGalleryFilters,
    resetGalleryFilters,
    addtoFavourites,
    removeFromFavourites,
    photoLiked, resetGalleryPagination } = photoSlice.actions