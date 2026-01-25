import { Paper, Card, CardHeader, Typography, CardContent, CardActions, TextField, Stack, Button, IconButton, Divider, Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../app/store'
import SendIcon from '@mui/icons-material/Send';
import { fetchCommentsByPhotoId, selectCommentsByPhotoId } from '../../app/commentslice';
import { toast } from 'react-toastify';
import CommentItem from './CommentItem';

const CommentSection = ({photo_id}:{photo_id :string}) => {
    const authuser = useSelector((state: RootState)=> state.auth.user)
    const [input, setInput] = useState<string>()
    const dispatch = useDispatch<AppDispatch>()
    //fetch Comments for the photo
    useEffect(() => {
         if (!photo_id) return;
        dispatch(fetchCommentsByPhotoId(photo_id))
        
    }, [dispatch, photo_id])
    
    const comments = useSelector(selectCommentsByPhotoId(photo_id));
    console.log(comments);
    
    

    //Add Comment ---> Send button



    //Remove Comment ---> delete

  return (
   <Card
  sx={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 2,
  }}
>
  {/* Header */}
  <Box sx={{ px: 2, py: 1.5 }}>
    <Typography variant="subtitle1" fontWeight={600}>
      Comments
    </Typography>
  </Box>

  <Divider />

  {/* Scrollable Comments */}
  <Box
    sx={{
      flex: 1,
      overflowY: 'auto',
      px: 2,
      py: 1.5,
    }}
  >
    {
        comments.length > 0 && 
        comments.map((commentProp) => {
            const {id , ...comment} = commentProp
            return(
            <CommentItem key={id} {...commentProp} />
        )})
    }
    {/* Render comments here */}
  </Box>

  <Divider />

  {/* Input */}
  {authuser?.role !== 'P' && (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          size="small"
          fullWidth
          placeholder="Add a comment…"
          sx={{
            backgroundColor: 'rgb(245,245,245)',
            borderRadius: 2,
          }}
        />
        <IconButton
          color="primary"
          sx={{
            borderRadius: 2,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  )}
</Card>

  )
}

export default CommentSection



/* 

Some UI rule for comment section :-
1. If Parent comment is null( while fetching or while adding a new ) direct add to the comment section
2. Every Comment item has some more features 
  --> Comment message ()  
  --> Comment delete option
  --> reply button
--> profile ppipc first upar username , niche comment and right most side delete and reply button at bottom

3. When Someone reply then @username (reply)
  If @username is null indent to comment otherwise 1 indent only 

*/