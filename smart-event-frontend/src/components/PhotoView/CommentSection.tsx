import {
  Box,
  Card,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../app/store'
import {
  fetchCommentsByPhotoId,
  addComments,
  removeComments,
} from '../../app/commentslice'
import type { Comment } from '../../types/types'
import CommentItem  from './CommentItem'

type ReplyState = {
  parentId: string
  username: string
} | null

const CommentSection = ({ photo_id }: { photo_id: string }) => {
  const dispatch = useDispatch<AppDispatch>()
  const authuser = useSelector((state: RootState) => state.auth.user)
  const { commentById, repliesByParent } = useSelector((state: RootState) => state.comment)
  const rootCommentIds = useSelector((state: RootState) => state.comment.commentsByPhoto[photo_id] || [])

  const [input, setInput] = useState('')
  const [replyTo, setReplyTo] = useState<ReplyState>(null)

  // Fetch comments
  useEffect(() => {
    if (!photo_id) return
    dispatch(fetchCommentsByPhotoId(photo_id))
  }, [dispatch, photo_id])

  // Indent logic 
  const getIndent = (comment: Comment) => {
    if (!comment.parent_comment) return 0
    return 1 // depth unlimited, indent only once
  }

  // 
    const getParentUsername = (comment: Comment) => {
    if (!comment.parent_comment) return undefined
    return commentById[comment.parent_comment]?.user.username
  }

  const renderComment = (id: string) => {
    const comment = commentById[id]
    if (!comment) return null
    return (
      <Box key={id}>
        <CommentItem
          {...comment}
          indent={getIndent(comment)}
          parentUser={getParentUsername(comment)}
          onReply={(cid, username) =>
            setReplyTo({ parentId: cid, username })
          }
          onDelete={handleDelete}
        />

        {repliesByParent[id]?.map(childId =>
          renderComment(childId)
        )}
      </Box>
    )
  }


  const handleDelete = async (commentId: string) => {
    try {
      await dispatch(removeComments({ photo_id, comment_id: commentId, })).unwrap()
       if (replyTo?.parentId === commentId) {
      setReplyTo(null)
    }
    } catch (error) {
      console.error('Failed to delete comment', error)
    }
  }

  // Send comment
  const handleSend = () => {
    if (!input.trim()) return
    dispatch(
      addComments({photo_id,data: { 
         body: input,
         parent_comment: replyTo?.parentId ?? null,
        },
      })
    )
    setInput('')
    setReplyTo(null)
  }

return (
    <Card sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box px={2} py={1.5}>
        <Typography variant="subtitle1" fontWeight={600}>
          Comments
        </Typography>
      </Box>

      <Divider />

      {/* Comment list */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 1,
        }}
      >
        {rootCommentIds.map(id => renderComment(id))}
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              size="small"
              fullWidth
              placeholder={
                replyTo
                  ? `Replying to @${replyTo.username}`
                  : 'Add a comment…'
              }
              sx={{
                backgroundColor: 'rgb(245,245,245)',
                borderRadius: 2,
              }}
            />

            <IconButton
              color="primary"
              onClick={handleSend}
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
