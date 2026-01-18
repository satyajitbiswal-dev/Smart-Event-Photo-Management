import useWebSocket, { ReadyState } from "react-use-websocket"
import { useEffect } from 'react';
import { Slide, toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addNotification } from "../app/notificationslice";

export const useAppWebSocket = (token: string | null) => {

  const WS_URL = `ws://127.0.0.1:8000/ws/notifications/?token=${token}`
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    token ? WS_URL : null,
    {
      share: false,
      shouldReconnect: () => true,
    },
  )
  const dispatch = useDispatch()
  // Run when a new WebSocket message is received (lastJsonMessage)
  useEffect(() => {
    if (lastJsonMessage) {
      console.log('Hey There this is your notification message ', lastJsonMessage)
      toast(String(lastJsonMessage.value.text_message), {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
      dispatch(addNotification(lastJsonMessage.value))
    }
  }, [lastJsonMessage,dispatch])

}
