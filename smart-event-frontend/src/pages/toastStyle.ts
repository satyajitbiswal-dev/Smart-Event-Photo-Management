import { Slide, toast } from "react-toastify";

export default function toastMessage(message, position) {
    return toast(String(message), {
                position: position ?? "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Slide,
    })
}

