import { toast } from "react-toastify";
import toastMessage from "../pages/toastStyle";

export default function ToastError(error: unknown){
    if (typeof error === 'object' && error !== null) {
            for (const key in error) {
              const value = error[key];
              if (Array.isArray(value)) {
                value.forEach(msg => toastMessage(msg, "top-right"));
              } else {
                // Single string
                toast.error(value as string);
              }
            }
    } else {
        toastMessage(error, 'top-right')
     }
}