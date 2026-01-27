import  { useEffect, useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { MuiOtpInput } from "mui-one-time-password-input";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, setPersist } from "../../app/authslice";
import type { RootState } from "../../app/store";
import { publicapi } from "../../services/AxiosService";

const OTP_LENGTH = 6;
const OTP_EXPIRY = 60

export const OTPVerif = ({ email, password }) => {
  const navigate = useNavigate()
  const [value, setValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const dispatch = useDispatch()

  const persist = useSelector((state: RootState) => state.auth.persist);
  const handleChange = (newvalue: string) => {
    setValue(newvalue)
  }

  const handleverifyOTP = async () => {
    if (value.length !== OTP_LENGTH) return;

    try {
      setError("")
      setLoading(true)
      const response = await axios.post("http://127.0.0.1:8000/login/verify-otp/", {
        email: email,
        otp: value
      }, { withCredentials: true }
      )
      dispatch(login(response.data))
      dispatch(setPersist(true))
      setLoading(false)

    } catch (error) {
      setError('Incorrect OTP');
      setLoading(false)
      setValue("")
    }
  }
  const accessToken = useSelector(
    (state: RootState) => state.auth.access_token
  );

  useEffect(() => {
    if (accessToken) {
      navigate("/", { replace: true });
    }
  }, [accessToken, navigate]);


  // OTP TimeOut
  const [resend, setResend] = useState<boolean>(false)
  const [timer, setTimer] = useState<number>(OTP_EXPIRY)

  useEffect(() => {
    if (timer === 0) {
      setResend(true)
      return;
    }

    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000);

    return () => clearInterval(interval)
  }, [timer])

  const handleResendOTP = async () => {
    try {
      setLoading(false);
      await publicapi.post('login/send-otp/', {
        email: email,
        password: password
      },
        { withCredentials: true }
      );
      setTimer(OTP_EXPIRY);
      setResend(false);
      setValue("");
      setError("");
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box component={Paper} elevation={0}
        sx={{
          mt: 2,
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Verify OTP
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          Enter the 6-digit code sent to your email
        </Typography>

        <MuiOtpInput
          length={OTP_LENGTH}
          value={value}
          onChange={handleChange}
          autoFocus
          TextFieldsProps={{
            size: "medium",
            placeholder: "•",
          }}
          sx={{
            mt: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />

        <Button variant="contained" size="large" fullWidth disabled={value.length !== OTP_LENGTH || loading}
          onClick={handleverifyOTP}
          sx={{
            mt: 1,
            height: 44,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {loading ? "Verifying…" : "Verify OTP"}
        </Button>

        {error && (
          <Typography color="error" variant="body2" textAlign="center" sx={{ mt: 0.5 }}>
            {error}
          </Typography>
        )}
        {!resend ?
          (<Typography color="blue" > Resend OTP in {timer}s </Typography>)
          :
          (<Button sx={{
            backgroundColor: 'rgb(114, 251, 167)',
            color: 'white'
          }}
            variant='contained'
            onClick={handleResendOTP}
          > Resend OTP </Button>)
        }
      </Box>

    </>
  );
};



