import { Grid, Card as CardComp, CardActionArea, CardMedia, CardContent, Typography } from '@mui/material'
import React from 'react'
import NoDataImg from '../assets/images/NoData.svg'

function NoData() {
    return (
        <Grid item xs={2}>
            <CardComp elevation={0} sx={{ marginTop: 10 }}>
                <CardActionArea>
                    <CardMedia
                        component='img'
                        alt='No data'
                        image={NoDataImg}
                    />
                    <CardContent>
                        <Typography variant='h5' component='div' gutterBottom>
                            No Data To Display.
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </CardComp>
        </Grid>
    )
}

export default NoData