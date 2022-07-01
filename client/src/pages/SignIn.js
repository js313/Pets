import { Avatar, Box, Button, Container, CssBaseline, TextField, Typography, Link, Grid, CircularProgress } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useNavigate } from "react-router-dom"
import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/appContext'
import Alert from '../components/Alert'

function Signin() {
    const contextValues = useAppContext()
    const navigate = useNavigate()
    const [signUp, setSignUp] = useState(false)
    const firstName = useRef()
    const lastName = useRef()
    const email = useRef()
    const password = useRef()
    const passwordConfirm = useRef()

    useEffect(() => {
        if (contextValues.user) {
            if (contextValues.redirectTo) {
                navigate(contextValues.redirectTo)
                contextValues.changeRedirectTo('')
            }
            else
                navigate('/all')
        }
    }, [contextValues.user, navigate])

    function resetInputs() {
        if (signUp) {
            firstName.current.value = ""
            lastName.current.value = ""
            passwordConfirm.current.value = ""
        }
        email.current.value = ""
        password.current.value = ""
    }

    async function submitHandler(event) {
        event.preventDefault()
        if (!signUp)
            await contextValues.setupUser({ email: email.current.value, password: password.current.value }, 'signin')
        else
            await contextValues.setupUser({ name: lastName.current.value.length > 0 ? `${firstName.current.value} ${lastName.current.value}` : firstName.current.value, email: email.current.value, password: password.current.value, passwordConfirm: passwordConfirm.current.value }, 'signup')
        resetInputs()
    }

    return (
        <>
            <Alert />
            <Container component='main' maxWidth='xs'>
                <CssBaseline />
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    marginTop: 10
                }}>
                    <Avatar sx={{ margin: 1, bgcolor: 'teal' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography variant='h5' component='h1'>
                        Sign {signUp ? 'up' : 'in'}
                    </Typography>
                    <Box component='form' onSubmit={submitHandler} sx={{ width: '100%', mt: 3 }}>
                        {signUp && <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id='firstname'
                                    label='First Name'
                                    name='firstname'
                                    type='text'
                                    autoComplete='given-name'
                                    autoFocus
                                    required
                                    fullWidth
                                    inputRef={firstName}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id='lastname'
                                    label='Last Name'
                                    name='lastname'
                                    type='text'
                                    autoComplete='family-name'
                                    fullWidth
                                    inputRef={lastName}
                                />
                            </Grid>
                        </Grid>}
                        <TextField
                            id='email'
                            label='Email Address'
                            name='email'
                            type='text'
                            autoComplete='email'
                            autoFocus={signUp ? false : true}
                            fullWidth
                            required
                            margin='normal'
                            inputRef={email}
                        />
                        <TextField
                            id='password'
                            label='Password'
                            name='password'
                            type='password'
                            autoComplete={signUp ? '' : 'current-password'}
                            fullWidth
                            required
                            margin='normal'
                            inputRef={password}
                        />
                        {signUp && <TextField
                            id='passwordConfirm'
                            label='Confirm Password'
                            name='passwordConfirm'
                            type='password'
                            fullWidth
                            required
                            margin='normal'
                            inputRef={passwordConfirm}
                        />}
                        {/* {contextValues.isLoading && <LinearProgress sx={{ mb: -3 }} />} */}
                        <Button type={contextValues.isLoading ? 'button' : 'submit'} fullWidth variant='contained' sx={{ mt: 3, mb: 3 }}>
                            {contextValues.isLoading ? <CircularProgress
                                size={25}
                                sx={{
                                    color: 'inherit',
                                    zIndex: 1
                                }}
                            /> : `Sign ${signUp ? 'Up' : 'In'}`}
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                {!signUp && <Link component='h1' variant='body2' sx={{ cursor: 'pointer' }}>Forgot password?</Link>}
                            </Grid>
                            <Grid item>
                                <Link component='h1' variant='body2' onClick={() => { setSignUp(state => !state) }} sx={{ cursor: 'pointer' }}>{signUp ? 'Already have an account? Sign in' : "Don't have an account? Sign Up"}</Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Typography variant='body2' color='GrayText' align='center' sx={{ mt: 10 }}>
                    {'Copyright © '}
                    <Link color='inherit' href='/'>Pets</Link>{' '}
                    {new Date().getFullYear()}{'.'}
                </Typography>
            </Container>
        </>
    )
}

export default Signin