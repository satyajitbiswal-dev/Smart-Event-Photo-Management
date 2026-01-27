import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import privateapi from "../services/AxiosService";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import { login, setPersist } from "../app/authslice";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      navigate("/login");
      return;
    }

    privateapi.get(`auth/oauth/login/?code=${code}`, {
        withCredentials: true,
      })
      .then((res) => {
        dispatch(login)
        dispatch(setPersist(true))
      })
      .catch((err) => {
        const msg = err.response?.data?.message;

        if (msg?.includes("pending")) {
          navigate("/signup/confirmation/");
        } else if (msg?.includes("rejected")) {
          navigate("/rejected/");
        } else {
          navigate("/signin/");
        }
      });
  }, []);

  const accessToken = useSelector((state: RootState) => state.auth.access_token);

  useEffect(() => {
    if (accessToken) {
      navigate("/", { replace: true });
    }
  }, [accessToken, navigate]);

  return <p>Signing you in…</p>;
};

export default OAuthCallback;

