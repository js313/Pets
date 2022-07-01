import { Typography, Grid, Divider, Paper, Link, Card, CardContent, CardActions, Button } from '@mui/material'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import { Carousel } from 'react-responsive-carousel'
import "react-responsive-carousel/lib/styles/carousel.min.css"
import MapComp from './MapComp'
import React, { useEffect } from 'react'
import { useAppContext } from '../context/appContext'

function PetDetails(props) {
    // console.log(props)
    const contextValues = useAppContext()
    useEffect(() => {
        contextValues.changeRedirectTo(`/pets/${props.data._id}`)
    }, [contextValues.changeRedirectTo])
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
                    <Divider variant='middle' sx={{ marginY: 1 }} />
                    <Typography variant='subtitle1' component='h4' sx={{ padding: 1, color: '#7f7f7f' }}>
                        {props.data.species || ''}{props.data.breed ? ` • ${props.data.breed}` : ''}{props.data.gender ? ` • ${props.data.gender}` : ''}
                    </Typography>
                    <Divider variant='middle' sx={{ marginY: 1 }} />
                    <Typography variant='h4' component='h4'>
                        About
                    </Typography>
                    <Typography variant='body1' component='p' sx={{ paddingX: 1, paddingTop: 1 }}>
                        {props.data.about}
                    </Typography>
                    <Divider variant='middle' sx={{ marginY: 1 }} />
                    <Typography variant='h6' component='h6' sx={{ marginBottom: 1 }}>
                        Current {props.data.shelter ? 'Shelter' : props.data.parent && 'Parent'}
                    </Typography>
                    {props.data.shelter &&
                        <Link href={`/shelters/${props.data.shelter._id}`} sx={{ paddingX: 1 }}>
                            {props.data.shelter.name}
                        </Link>
                    }
                    {props.data.parent &&
                        <Link sx={{ paddingX: 1 }}>
                            {props.data.parent.name}
                        </Link>
                    }
                </Paper>
            </Grid>
            <Grid item sm={12} md={6} lg={3}>
                <Grid container direction='column' spacing={7}>
                    <Grid item xs>
                        <Paper elevation={4} sx={{ height: 265 }}>
                            <MapComp center={props.data.location.coordinates || [-2, 10]} zoom={9} mapStyle="mapbox://styles/mapbox/streets-v11" />
                            {props.data.location.properties &&
                                <Paper elevation={4}>
                                    <LocationOnRoundedIcon sx={{ display: 'inline-block', position: 'relative', top: 4, left: 3 }} />
                                    <Typography variant='subtitle1' component='h4' sx={{ display: 'inline-block', padding: 1, position: 'relative', top: -1 }}>
                                        {props.data.location.properties.address}
                                    </Typography>
                                </Paper>}
                        </Paper>
                    </Grid>
                    <Grid item xs>
                        <Card elevation={4}>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Considering {props.data.name} for adoption?
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" variant='outlined'>Start Inquiry</Button>
                                <Button size="small" variant='outlined' color='success'>Sponsor</Button>
                                <Button size="small" variant='outlined' color='secondary'>Favorite</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        </Grid >
    )
}

export default PetDetails