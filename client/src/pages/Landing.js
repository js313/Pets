import { ThemeProvider } from '@emotion/react'
import { Button, ButtonGroup, Container, Grid, Typography } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import LandingImg from '../assets/images/LandingImg.svg'
import classes from '../css/Landing.module.css'

function Landing() {
    const theme = createTheme({
        components: {
            MuiTypography: {
                variants: [
                    {
                        props: {
                            variant: "h3"
                        },
                        style: {
                            fontFamily: "'Bree Serif', 'serif'",
                            fontSize: '5.5rem',
                            color: 'rgb(0, 136, 255)'
                        }
                    },
                    {
                        props: {
                            variant: "body1"
                        },
                        style: {
                            fontFamily: "'Bree Serif', 'serif'",
                            fontSize: '1.4rem',
                            color: 'rgb(10, 120, 150)'
                        }
                    }
                ]
            },
            MuiButtonGroup: {
                variants: [
                    {
                        props: {
                            variant: 'text'
                        },
                        style: {
                            textAlign: 'center',
                            width: '100%',
                            justifyContent: 'center',
                            marginTop: '40px',
                            padding: '5%'
                        }
                    }
                ]
            }
        }
    })
    const navigate = useNavigate()
    function onLoginClick() {
        navigate('/signin')
    }
    function onExploreClick() {
        navigate('/all')
    }
    return (
        <div className={classes.landingbg}>
            {/* <Container maxWidth='lg' disableGutters sx={{ position: 'relative', top: '25%' }}> //creates scroll over bg somehow */}
            <Container maxWidth='lg' disableGutters sx={{ display: 'flex', justifyContent: 'center' }}>
                <Grid container spacing={5} justifyContent="center" alignItems="center">
                    <Grid item md={6} xs={12}>
                        <ThemeProvider theme={theme}>
                            <Typography variant='h3' align='center' sx={{ mb: 2 }}>
                                Welcome to Pets!
                            </Typography>
                            <Typography variant='body1' align='center'>
                                Search for your future companion.
                            </Typography>
                            <ButtonGroup variant="text" aria-label="large text button group" sx={{ maxWidth: '80%' }}>
                                <Button onClick={onLoginClick} variant='contained' sx={{ width: '100%' }}>Login</Button>
                                <Button onClick={onExploreClick} variant='outlined' sx={{ width: '100%' }}>Explore</Button>
                            </ButtonGroup>
                        </ThemeProvider>
                    </Grid>
                    <Grid item md={6} xs={0} sx={{ textAlign: 'center' }}>
                        <img src={LandingImg} alt='Welcome Cats' className={classes.img} />
                    </Grid>
                </Grid>
            </Container>
        </div>
    )
}

export default Landing