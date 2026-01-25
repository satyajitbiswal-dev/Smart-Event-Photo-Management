import { Avatar, Box, Button, IconButton, Typography } from '@mui/material'
import React from 'react'
import type { Comment } from '../../types/types'
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import dayjs from 'dayjs';

const CommentItem = (comment: Comment) => {
    return (
        <Box my={1}>
            <Box display={'flex'} alignItems={'flex-start'} justifyContent={'space-between'}>
                <Box display={'flex'} alignItems={'flex-start'} gap={1}>
                    <Box>
                        {/* profile_pic */}
                        <Avatar src={`${comment.user.profile_pic}`} />
                    </Box>
                    {/* username on top and comment text on bottom */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start'
                    }}>
                        <Typography variant='caption' sx={{ fontSize: 10 }} color='textSecondary'> {comment.user.username}  ({dayjs(comment.created).fromNow()})
                             </Typography>
                        <Typography variant='body1' sx={{ fontSize: 14 }} >
                            {/* issme abhi username aayega donot worry  */}
                            {comment.body}
                        </Typography>
                        <Button 
                            startIcon={<ReplyIcon sx={{ fontSize: 18 }} />}
                            sx={{
                                width:'fit-content',
                                padding: 0,
                                fontSize: 12,
                                color: 'text.secondary',
                                justifyContent: 'flex-start',
                            }}
                        >
                            Reply
                        </Button>

                </Box>

            </Box>
            <Box justifySelf={'flex-end'}>
                <IconButton>
                    <DeleteIcon color='error' fontSize='small' />
                    {/* Dialog box appear as delete is a risky job */}
                </IconButton>
            </Box>
        </Box>

            {/* at last reply icon */ }
        </Box >
    )
}

export default CommentItem


// delete button





//reply button
/* 

send username to the textfield @username and store that comment id to current state
but usse pata kese chalega kaha intend karna 

 */

/* 
3 types of comment
agar comment_id ka parent comment_id null hai then No indent direct add to comment section ---> send notification to that Photographer
agar comment_id ka parent comment_id not null
    ---> comment_id should be intend with parent_comment_id
    ---> comment_id's parent comment_id already intended so put with the same line as parent_comment_id

*/