import { Avatar, Box, Button, IconButton, Typography, useScrollTrigger } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import ReplyIcon from '@mui/icons-material/Reply'
import dayjs from 'dayjs'
import type { Comment } from '../../types/types'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'

type Props = Comment & {
  indent: number
  parentUser?: string
  onReply: (id: string, username: string) => void
  onDelete: (id: string) => void
}

const CommentItem = ({ id, body, user, created, indent, parentUser, onReply, onDelete,}: Props) => {
    const authuser = useSelector((state: RootState) => state.auth.user)
  return (
    <Box mt={1} ml={indent ? 4 : 0}>
      <Box display="flex" justifyContent="space-between">
        <Box display="flex" gap={1}>
          <Avatar src={user.profile_pic} sx={{ width: 28, height: 28 }} />

          <Box>
            {/* user */}
            <Typography variant="caption" fontSize={11}>
              {user.username} · {dayjs(created).fromNow()}
            </Typography>

            {/* BODY */}
            <Typography fontSize={14}>
              {parentUser && (
                <Box component="span" sx={{ color: 'primary.main', mr: 0.5 }}>
                  @{parentUser}
                </Box>
              )}
              {body}
            </Typography>

            <Button
              size="small"
              startIcon={<ReplyIcon fontSize="small" />}
              sx={{ px: 0 }}
              onClick={() => onReply(id, user.username ?? '')}
            >
              Reply
            </Button>
          </Box>
        </Box>
        { user.email === authuser?.email &&
        <IconButton size="small" onClick={() => onDelete(id)}>
          <DeleteIcon fontSize="small" color="error" />
        </IconButton>
        }
      </Box>
    </Box>
  )
}

export default CommentItem




























// import { Avatar, Box, Button, IconButton, Typography } from '@mui/material'
// import React from 'react'
// import type { Comment } from '../../types/types'
// import DeleteIcon from '@mui/icons-material/Delete';
// import ReplyIcon from '@mui/icons-material/Reply';
// import dayjs from 'dayjs';

// const CommentItem = (comment: Comment) => {
//     return (
//         <Box my={1}>
//             <Box display={'flex'} alignItems={'flex-start'} justifyContent={'space-between'}>
//                 <Box display={'flex'} alignItems={'flex-start'} gap={1}>
//                     <Box>
//                         {/* profile_pic */}
//                         <Avatar src={`${comment.user.profile_pic}`} />
//                     </Box>
//                     {/* username on top and comment text on bottom */}
//                     <Box sx={{
//                         display: 'flex',
//                         flexDirection: 'column',
//                         justifyContent: 'flex-start'
//                     }}>
//                         <Typography variant='caption' sx={{ fontSize: 10 }} color='textSecondary'> {comment.user.username}  ({dayjs(comment.created).fromNow()})
//                              </Typography>
//                         <Typography variant='body1' sx={{ fontSize: 14 }} >
//                             {/* issme abhi username aayega donot worry  */}
//                             {comment.body}
//                         </Typography>
//                         <Button 
//                             startIcon={<ReplyIcon sx={{ fontSize: 18 }} />}
//                             sx={{
//                                 width:'fit-content',
//                                 padding: 0,
//                                 fontSize: 12,
//                                 color: 'text.secondary',
//                                 justifyContent: 'flex-start',
//                             }}
//                         >
//                             Reply
//                         </Button>

//                 </Box>

//             </Box>
//             <Box justifySelf={'flex-end'}>
//                 <IconButton>
//                     <DeleteIcon color='error' fontSize='small' />
//                     {/* Dialog box appear as delete is a risky job */}
//                 </IconButton>
//             </Box>
//         </Box>

//             {/* at last reply icon */ }
//         </Box >
//     )
// }

// export default CommentItem

