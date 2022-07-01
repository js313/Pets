import { CardMedia, Paper, Card as CardComp, CardContent, Typography, CardActionArea, Rating, Box } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useNavigate } from "react-router-dom"
import React from 'react'

function ShelterCard(props) {   //use skeleton compoent from material ui when loading
    const navigate = useNavigate()
    function goToDetails() {
        navigate(`/shelters/${props.data._id}`)
    }
    return (
        <Grid item xl={3} lg={4} xs={6}>
            <Paper elevation={10}>
                <CardComp>
                    <CardActionArea onClick={goToDetails}>
                        <CardMedia
                            component='img'
                            alt={props.data.name}
                            image={props.data.imageCover ? props.data.imageCover : ''}
                            sx={{ height: 300 }}
                            loading="lazy"
                        />  {/* Experiment with height or maxHeight */}
                        <CardContent>
                            <Typography variant='h5' component='div' gutterBottom>
                                {props.data.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {props.data.description.substr(0, 55)}{props.data.description.length > 55 && '...'}
                            </Typography>
                        </CardContent>
                        <CardContent sx={{ display: 'flex' }}>
                            <Rating name="read-only" value={props.data.ratingsAverage} precision={0.1} size='small' readOnly />
                            <Box sx={{ ml: 1 }}>
                                {' '}({props.data.ratingsQuantity})
                            </Box>
                        </CardContent>
                    </CardActionArea>
                </CardComp>
            </Paper>
        </Grid>
    )
}

export default ShelterCard