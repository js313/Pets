import { CardMedia, Paper, Card as CardComp, CardContent, Typography, CardActionArea } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useNavigate } from "react-router-dom"
import React from 'react'

function PetCard(props) {   //use skeleton component from material ui when loading
    const navigate = useNavigate()
    function goToDetails() {
        navigate(`/pets/${props.data._id}`)
    }
    return (
        <Grid item xl={3} lg={4} xs={6}>
            <Paper elevation={10}>
                <CardComp>
                    <CardActionArea onClick={goToDetails}>
                        <CardMedia
                            component='img'
                            alt={props.data.name}
                            image={props.data.images.length > 0 ? props.data.images[0] : ''}
                            sx={{ height: 300 }}
                            loading="lazy"
                        />
                        <CardContent>
                            <Typography variant='h5' component='div' gutterBottom>
                                {props.data.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {props.data.species}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {props.data.breed}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </CardComp>
            </Paper>
        </Grid>
    )
}

export default PetCard