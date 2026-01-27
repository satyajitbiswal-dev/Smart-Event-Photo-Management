import { Button, Typography } from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const OTP_EXPIRY = 60

const OTPTimeout = (email : string) => {
  const [ resend, setResend ] = useState<boolean>(false)
  const [timer, setTimer] = useState<number>(OTP_EXPIRY)

  useEffect(() => {
    if(timer === 0){
      setResend(true)
      return;
    }

    const interval = setInterval(() => {
      setTimer(prev => prev-1)
    }, 1000);

    return () => clearInterval(interval)
  },[timer])

  const hanldeResendOTP = async(email) =>{
    try {
    setLoading(true);
    await axios.post("http://127.0.0.1:8000/login/resend-otp/", {
      email,
    });
    setTimer(OTP_EXPIRY);
    setCanResend(false);
    setValue("");
    setError("");
  } catch {
    setError("Failed to resend OTP");
  } finally {
    setLoading(false);
  }
  }

  return (
    <>{!resend ?
      (<Typography> Resend OTP in {timer} </Typography>) 
      :
      (<Button sx={{
        backgroundColor:'rgb(114, 251, 167)',
        color:'white'
      }} 
      variant='contained'
      disabled={!resend}
      onClick = {hanldeResendOTP}
      > Resend OTP </Button>)
      }
    
    </>
  )
}

export default OTPTimeout