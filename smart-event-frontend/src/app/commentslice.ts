import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Comment } from "../types/types";
import privateapi from "../services/AxiosService";
import type { RootState } from "./store";

type CommentState = {
    commentById: Record<string, Comment>;
    commentsByPhoto: Record<string, string[]>;   // root ids
    repliesByParent: Record<string, string[]>;   
};

const initialState: CommentState = {
    commentById: {},
    commentsByPhoto: {},
    repliesByParent: {}
}


export const fetchCommentsByPhotoId = createAsyncThunk(
    'comment/fetchComments',
    async (photo_id: string, { rejectWithValue }) => {
        try {
            const response = await privateapi.get(`photo/${photo_id}/comments/`)
            return { photo_id, comments: response.data };
        } catch (error) {
            return rejectWithValue(error?.response?.data || "Comments can't be fetched")
        }
    }
)


export const addComments = createAsyncThunk(
    'comment/addComments',
    async ({ photo_id, data }: { photo_id: string, data: Partial<Comment> }, { rejectWithValue }) => {
        try {
            const response = await privateapi.post(`photo/${photo_id}/add_comment/`, data)
            return response.data
        } catch (error) {
            return rejectWithValue(error?.response?.data || "Comments can't be fetched")
        }
    }
)



export const removeComments = createAsyncThunk(
    'comment/removeComments',
    async ({ photo_id, comment_id }: { photo_id: string; comment_id: string }, { rejectWithValue }) => {
        try {
            const response = await privateapi.delete(`photo/${photo_id}/remove_comment/`, { data: { comment_id } })
            return response.data
        } catch (error) {
            return rejectWithValue(error?.response?.data || "Comments can't be fetched")
        }
    }
)

export const selectCommentsByPhotoId = (photo_id: string) =>
    (state: RootState) => {
        const ids = state.comment.commentsByPhoto[photo_id] || [];
        return ids.map(id => state.comment.commentById[id]);
    };



const commentSlice = createSlice({
    name: 'comment',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchCommentsByPhotoId.fulfilled, (state, action) => {
            const { photo_id, comments } = action.payload;

            state.commentsByPhoto[photo_id] = [];

            comments.forEach(comment => {
                state.commentById[comment.id] = comment;

                if (!comment.parent_comment) {
                    state.commentsByPhoto[photo_id].push(comment.id);
                } else {
                    if (!state.repliesByParent[comment.parent_comment]) {
                        state.repliesByParent[comment.parent_comment] = [];
                    }
                    state.repliesByParent[comment.parent_comment].push(comment.id);
                }
            });
        });

        builder.addCase(addComments.fulfilled, (state, action) => {
            const comment = action.payload;
            const photo_id = comment.photo;

            state.commentById[comment.id] = comment;

            if (!comment.parent_comment) {
                state.commentsByPhoto[photo_id].unshift(comment.id);
            } else {
                if (!state.repliesByParent[comment.parent_comment]) {
                    state.repliesByParent[comment.parent_comment] = [];
                }
                state.repliesByParent[comment.parent_comment].unshift(comment.id);
            }
        });

        builder.addCase(removeComments.fulfilled, (state, action) => {
            const { id, photo_id } = action.payload

            delete state.commentById[id]

            // remove from root list
            if (state.commentsByPhoto[photo_id]) {
                state.commentsByPhoto[photo_id] =
                    state.commentsByPhoto[photo_id].filter(cid => cid !== id)
            }

            // remove from replies
            Object.keys(state.repliesByParent).forEach(parentId => {
                state.repliesByParent[parentId] =
                    state.repliesByParent[parentId].filter(cid => cid !== id)
            })

            // remove subtree
            delete state.repliesByParent[id]
        })

    }
})

export default commentSlice.reducer