import axios from "axios";
import { store } from "../app/store";
import { setAccessToken, logout } from "../app/authslice";


export const publicapi = axios.create({
  baseURL: "http://127.0.0.1:8000/",
});

export const privateapi = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  withCredentials: true,
});

privateapi.interceptors.request.use((config) => {
  const token = store.getState().auth.access_token;
  console.log(token);
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

privateapi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          {},
          { withCredentials: true }
        );
        console.log(res);
        console.log(res)
        store.dispatch(setAccessToken(res.data.access));
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;

        return privateapi(originalRequest);
      } catch {
        store.dispatch(logout());
      }
    }

    return Promise.reject(error);
  }
);

export default privateapi;
