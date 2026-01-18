import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { useAppWebSocket } from "../hooks/useAppWebsocket";

export const WebSocket = () =>{
  const token = useSelector((state: RootState) => state.auth.access_token)

  useAppWebSocket(token)

  return null
}