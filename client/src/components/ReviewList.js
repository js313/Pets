import { Button, ButtonGroup, Grid, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, Rating, TextField, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/appContext'

function ReviewList(props) {
    const navigate = useNavigate()
    const contextValues = useAppContext()

    const [editingComment, setEditingComment] = useState(false)
    const [newRating, setNewRating] = useState(editingComment && editingComment.rating)

    const body = useRef()

    function reviewSubmitHandler(event) {
        event.preventDefault()
        contextValues.uploadData('/reviews', { rating: newRating, body: body.current.value }, 'review', editingComment._id, 'update')
    }

    function deleteReview(id) {
        contextValues.uploadData('/reviews', {}, 'review', id, 'delete')
    }

    if (editingComment) {
        return (
            <Paper elevation={4} sx={{ backgroundColor: '#F9F9F9', p: 3 }}>
                <Typography variant='h4'>
                    Edit Review
                </Typography>
                <Grid component='form' onSubmit={reviewSubmitHandler} container sx={{ width: '100%' }}>
                    <Grid item xs={6} sx={{ mt: 1 }}>
                        <Typography component="legend">Rating</Typography>
                        <Rating
                            name="rating"
                            defaultValue={editingComment.rating}
                            onChange={(event, newValue) => {
                                setNewRating(newValue)
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} sx={{ mt: 1 }}>
                        <ButtonGroup variant="outlined">
                            <Button type='button' color='error' onClick={() => setEditingComment(false)}>Cancel</Button>
                            <Button type='submit' color='success' variant='contained'>Submit</Button>
                        </ButtonGroup>
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 1 }}>
                        <TextField
                            aria-label="review body"
                            multiline
                            label='Review body'
                            fullWidth
                            rows={3}
                            defaultValue={editingComment.body}
                            inputRef={body}
                        />
                    </Grid>
                </Grid>
            </Paper>
        )
    }

    return (
        <Paper elevation={4} sx={{ backgroundColor: '#F9F9F9', p: 3 }}>
            <Typography variant='h4'>
                Your Reviews
            </Typography>
            {props.reviews && props.reviews.length > 0 ?
                <List sx={{ width: '100%', maxWidth: 400 }}>
                    {props.reviews.map((review, index) =>
                        <React.Fragment key={index}>
                            <ListItem alignItems="flex-start" disablePadding>
                                <ListItemButton onClick={() => navigate(`/shelters/${review.shelter}`)}>
                                    <ListItemAvatar>
                                        {review.rating}⭐
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <React.Fragment>
                                                <Typography
                                                    sx={{ display: 'inline' }}
                                                    component="span"
                                                    variant="subtitle1"
                                                    color="text.primary"
                                                >
                                                    {review.body}
                                                </Typography>
                                            </React.Fragment>
                                        }
                                    />
                                </ListItemButton>
                                <IconButton color='info' onClick={() => setEditingComment(review)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton color='error' onClick={() => deleteReview(review._id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItem>
                        </React.Fragment>
                    )}
                </List> :
                <Typography variant='h6'>No reviews yet</Typography>
            }
        </Paper>
    )
}

export default ReviewList