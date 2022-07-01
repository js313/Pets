import { Typography, Grid, Divider, Paper, ListItem, List, ListItemAvatar, Avatar, ListItemText, ListItemButton, Box, Rating, Button, IconButton, TextField, Card, CardActions, CardContent } from '@mui/material'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import { Carousel } from 'react-responsive-carousel'
import "react-responsive-carousel/lib/styles/carousel.min.css"
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import { useNavigate } from 'react-router-dom'
import AddCommentRoundedIcon from '@mui/icons-material/AddCommentRounded'
import MapComp from './MapComp'
import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/appContext'

function ShelterDetails(props) {
    // console.log(props)
    const contextValues = useAppContext()
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [userRating, setUserRating] = useState(0)
    const body = useRef()
    useEffect(() => {
        contextValues.changeRedirectTo(`/shelters/${props.data._id}`)
    }, [contextValues.changeRedirectTo])

    function reviewSubmitHandler(event) {
        event.preventDefault()
        contextValues.uploadData(`shelters/${props.data._id}/reviews`, { rating: userRating, body: body.current.value, user: contextValues.user.id, shelter: props.data._id }, 'review')    //probably change route on backend, to take shelter id as body, to make life easier in appContext
    }

    const ratingsData = [
        {
            name: "1",
            value: 0
        },
        {
            name: "2",
            value: 0
        },
        {
            name: "3",
            value: 0
        },
        {
            name: "4",
            value: 0
        },
        {
            name: "5",
            value: 0
        }
    ]
    props.data.reviews.forEach((review) => {
        if (Math.round(review.rating) === 0) return
        ratingsData[Math.round(review.rating) - 1].value++
    })
    const navigate = useNavigate()
    return (
        <Grid container justifyContent='space-around' spacing={3}>
            {props.data.images && props.data.images.length > 0 && <Grid item sm={12} md={12} lg={4}>
                <Paper elevation={4}>
                    <Carousel showArrows={true} dynamicHeight infiniteLoop>
                        {props.data.images.map((item, index) => (
                            <img
                                key={index}
                                src={`${item}?w=164&h=164&fit=crop&auto=format`}
                                srcSet={`${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                alt={props.data.name}
                                loading="lazy"
                            />
                        ))}
                    </Carousel>
                </Paper>
            </Grid>}
            <Grid item md={6} lg={5}>
                <Paper elevation={4} sx={{ padding: 2 }}>
                    <Typography variant='h2' component='h2' sx={{ fontFamily: 'PT Sans, sans-serif' }}>
                        {props.data.name}
                    </Typography>
                    <Divider variant="middle" sx={{ marginY: 1 }}>EMAIL•RATING</Divider>
                    <Typography variant='subtitle1' component='h4' sx={{ paddingX: 1, paddingY: 1, color: '#7f7f7f', textAlign: 'center' }}>
                        {props.data.email || ''}{props.data.ratingsAverage ? ` •  ⭐${props.data.ratingsAverage}` : ''}{props.data.ratingsQuantity ? ` (${props.data.ratingsQuantity})` : ''}
                    </Typography>
                    <Divider variant="middle" sx={{ marginY: 1 }}>ABOUT</Divider>
                    {/* <Typography variant='h4' component='h4'>
                        About
                    </Typography> */}
                    <Typography variant='body1' component='p' sx={{ paddingX: 1, paddingY: 1 }}>
                        {props.data.description}
                    </Typography>
                    {props.data.team.length > 0 && <>
                        <Divider variant="middle" sx={{ marginY: 1 }}>TEAM</Divider>
                        <List sx={{ width: '100%', maxWidth: 360 }}>
                            {props.data.team.map((member, index) =>
                                <React.Fragment key={member._id}>
                                    <ListItem alignItems="flex-start" disablePadding>
                                        <ListItemButton>
                                            <ListItemAvatar>
                                                <Avatar alt={member.name} src={member.profilePhoto} />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={member.name}
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography
                                                            sx={{ display: 'inline' }}
                                                            component="span"
                                                            variant="body2"
                                                            color="text.primary"
                                                        >
                                                            {member.email}
                                                        </Typography>
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                    {index < props.data.team.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            )}
                        </List>
                    </>}
                    {props.data.pets.length > 0 && <>
                        <Divider variant="middle" sx={{ marginY: 1 }}>PETS</Divider>
                        <List sx={{ width: '100%', maxWidth: 360 }}>
                            {props.data.pets.map((pet, index) =>
                                <React.Fragment key={pet._id}>
                                    <ListItem alignItems="flex-start" disablePadding>
                                        <ListItemButton onClick={() => navigate(`/pets/${pet._id}`)}>
                                            <ListItemAvatar>
                                                <Avatar alt={pet.name} src={pet.images[0]} />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={pet.name}
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography
                                                            sx={{ display: 'inline' }}
                                                            component="span"
                                                            variant="body2"
                                                            color="text.primary"
                                                        >
                                                            {pet.species}
                                                        </Typography>
                                                        {` — ${pet.breed}`}
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                    {index < props.data.pets.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            )}
                        </List>
                    </>}
                    <Divider variant="middle" sx={{ marginY: 1 }}>SUPPORT</Divider>
                    <Card elevation={0}>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                Consider helping {props.data.name}.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" variant='outlined'>Start Inquiry</Button>
                            <Button size="small" variant='outlined' color='success'>Sponsor</Button>
                            <Button size="small" variant='outlined' color='secondary'>Favorite</Button>
                        </CardActions>
                    </Card>
                </Paper>
            </Grid>
            <Grid item sm={12} md={6} lg={3}>
                <Grid container direction='column' spacing={7}>
                    <Grid item xs>
                        <Paper elevation={4} sx={{ height: '265px' }}>
                            <MapComp center={props.data.location.coordinates || [-2, 10]} zoom={9} mapStyle="mapbox://styles/mapbox/streets-v11" />
                            {props.data.location.properties &&
                                <Paper elevation={4} sx={{ marginBottom: 2 }}>
                                    <LocationOnRoundedIcon sx={{ display: 'inline-block', position: 'relative', top: 4, left: 3 }} />
                                    <Typography variant='subtitle1' component='h4' sx={{ display: 'inline-block', padding: 1, position: 'relative', top: -1 }}>
                                        {props.data.location.properties.address}
                                    </Typography>
                                </Paper>}
                        </Paper>
                    </Grid>
                    <Grid item xs>
                        <Paper elevation={4} sx={{ p: 2 }}>
                            <Box>
                                <Typography variant='h6' component='h6' gutterBottom>
                                    Ratings and reviews
                                    {contextValues.user && <IconButton color='secondary' onClick={() => { setShowReviewForm(prevState => !prevState) }} sx={{ marginLeft: 1 }}>
                                        <AddCommentRoundedIcon />
                                    </IconButton>}
                                </Typography>
                                <Grid container>
                                    <Grid item xs={4}>
                                        <Typography variant='h3' component='h3'>
                                            {props.data.ratingsAverage}
                                        </Typography>
                                        <Rating name="read-only" value={props.data.ratingsAverage} readOnly precision={0.1} />
                                        <Typography variant='body1' component='h1' color='#7a7a7a' sx={{ display: 'block', px: 1 }}>
                                            {props.data.ratingsQuantity}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <BarChart
                                            height={100}
                                            width={200}
                                            data={ratingsData}
                                            barSize={10}
                                            layout='vertical'
                                        >
                                            <YAxis dataKey="name" interval={0} reversed scale='linear' padding={{ top: 5, bottom: -5 }} />
                                            <XAxis type='number' hide />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#8884d8" background={{ fill: '#eee' }} />
                                        </BarChart>
                                    </Grid>
                                </Grid>
                            </Box>
                            <Divider sx={{ marginY: 1 }} />
                            {showReviewForm &&
                                <Grid component='form' onSubmit={reviewSubmitHandler} container sx={{ width: '100%' }}>
                                    <Grid item xs={6} sx={{ mt: 1 }}>
                                        <Typography component="legend">Rating</Typography>
                                        <Rating
                                            name="rating"
                                            value={userRating}
                                            onChange={(event, newValue) => {
                                                setUserRating(newValue)
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={6} sx={{ mt: 1 }}>
                                        <Button type='submit' color='success' variant='contained'>Submit</Button>
                                    </Grid>
                                    <Grid item xs={12} sx={{ mt: 1 }}>
                                        <TextField
                                            aria-label="review body"
                                            multiline
                                            label='Review body'
                                            fullWidth
                                            rows={3}
                                            inputRef={body}
                                        />
                                    </Grid>
                                </Grid>
                            }
                            {!showReviewForm && <List sx={{ width: '100%' }}>
                                {props.data.reviews.map((review, index) =>
                                    <React.Fragment key={review._id}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemText
                                                primary={`⭐${review.rating} — ${review.user.name}`}
                                                secondary={review.body}
                                            />
                                        </ListItem>
                                        {index < props.data.team.length - 1 && <Divider variant="middle" component="li" />}
                                    </React.Fragment>
                                )}
                            </List>}
                        </Paper>
                    </Grid>
                </Grid>
            </Grid >
        </Grid >
    )
}

export default ShelterDetails