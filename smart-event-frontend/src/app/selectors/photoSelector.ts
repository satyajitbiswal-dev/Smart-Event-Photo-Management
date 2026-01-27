import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";

/* base */
const selectPhotosById = (state: RootState) => state.photo.photosById;
const selectEventMap = (state: RootState) => state.photo.photoIdsByContext.event;
const selectContextMap = (state: RootState) => state.photo.photoIdsByContext;

/* EVENT */
export const makeSelectEventPhotos = (eventId: string) =>
  createSelector(
    [selectPhotosById, selectEventMap],
    (photosById, eventMap) => {
      const ids = eventMap[eventId] ?? [];
      return ids.map(id => photosById[id]).filter(Boolean);
    }
  );

/* FAV / TAGGED */
export const makeSelectContextPhotos = (
  context: "favourites" | "tagged"
) =>
  createSelector(
    [selectPhotosById, selectContextMap],
    (photosById, ctxMap) => {
      const ids = ctxMap[context] ?? [];
      return ids.map(id => photosById[id]).filter(Boolean);
    }
  );
