import { useSelector } from "react-redux"
import type { RootState } from "../../app/store"
import { useEffect, useState } from "react"
import privateapi from "../../services/AxiosService"
import { Avatar } from "@mui/material"

// use redux for Profile Pic
const ProfilePic = () => {
    const  user  = useSelector((state: RootState) => state.auth.user)
    const [profilePic, setProfilePic] = useState<string | null>()

    useEffect(() => {
        if (!user) return;

        const fetchProfilePic = async() => {
            try {
                if (user.role !== 'P') {
                    const response = await privateapi.get(`${user.username}/profile_pic/`)
                    setProfilePic(response.data.profile_pic)
                }
            }
            catch (error) {
                console.error(error);
            }
        }
        fetchProfilePic();
    }, [user])
    return (
        <>
            <Avatar
                src={ profilePic || undefined }
                key={profilePic} 
            />
        </>
    )
}

export default ProfilePic