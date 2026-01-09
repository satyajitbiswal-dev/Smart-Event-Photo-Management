import  { useEffect } from 'react'
// import type { MemberProfile } from '../../types/types';
import { Avatar, Box , Stack, TextField} from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import privateapi from '../../services/AxiosService';
// import AccountCircleRounded from '@mui/icons-material/AccountCircleRounded';


const Member = () => {
  // const [isEditable, setisEditable] = useState<boolean>(false)
  const username = useSelector((state: RootState) => state.auth.user?.username)
  
  // const [user,setUser] = useState<MemberProfile>()
  useEffect(() => {
    if (!username) return; 

    const fetchProfile = async () => {
      try {
        const response = await privateapi.get(`/profile/${username}`);
        console.log(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [username]);
  return (
    <Box maxWidth={900} mx="auto" mt={6} padding={2}>
       <Stack direction="row" spacing={4}>
          <Box>
            <TextField variant='text' >

            </TextField>
          </Box>
          <Box>
            <Avatar sx={{bgcolor:'primary.light', width:80, height: 80}} >
              X
            </Avatar>
          </Box>
       </Stack>
    </Box>
  )
}

export default Member
