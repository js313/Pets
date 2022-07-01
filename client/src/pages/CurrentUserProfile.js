import { Button, Card, CardContent, CardMedia, CircularProgress, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, Skeleton, TextField, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/appContext'
import ReviewList from '../components/ReviewList'

function CurrentUserProfile() {
    const contextValues = useAppContext()
    const [userData, setUserData] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        if (!contextValues.user) {
            contextValues.changeRedirectTo('/my-profile')
            navigate('/signin', { replace: true })
        }
        async function getData() {
            const data = await contextValues.getUserDetails()
            if (data) {
                if (data.user.shelter && data.user.pets)
                    data.user.pets.push(...data.user.shelter.pets)
                setUserData(data.user)
            }
        }
        if (!userData || (userData && Object.keys(userData).length < 1))
            if (contextValues.user)
                getData()
    }, [contextValues.getUserDetails, userData, contextValues.user, navigate])
    // console.log(userData)

    const currentPassword = useRef()
    const passwordConfirm = useRef()
    const newPassword = useRef()

    function passwordChangeHandler(event) {
        event.preventDefault()
        const passwordData = {
            currentPassword: currentPassword.current.value,
            password: newPassword.current.value,
            passwordConfirm: passwordConfirm.current.value
        }
        contextValues.changePassword(passwordData)
    }

    const name = useRef()
    const email = useRef()
    const location = useRef()
    const [profilePhoto, setProfilePhoto] = useState()

    function getBase64(file) {      //Learn more about this
        var reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function () {
            setProfilePhoto({ file, data_url: reader.result })
        }
        reader.onerror = function (error) {
            console.log('Error: ', error)
            contextValues.showAlert('An error occured.')
            navigate('/all')
        }
    }
    function onImageSelect(event) {
        getBase64(event.target.files[0])
    }

    async function userChangeHandler(event) {
        event.preventDefault()
        let userDetails = {
            name: name.current.value,
            email: email.current.value,
            profilePhoto
        }
        if (location.current && location.current.value && ((userData.location && location.current.value.toLowerCase() !== userData.location.properties.description.toLowerCase()) || !userData.loaction)) {
            const geoCodedData = await contextValues.geoCode(location.current.value)
            userDetails.location = geoCodedData.features[0] ? {
                type: "Point",
                coordinates: geoCodedData.features[0].center,
                properties: {
                    address: geoCodedData.features[0].place_name,
                    description: location.current.value
                }
            } : undefined
        }
        contextValues.changeUserDetails(userDetails)
    }

    if (!userData || (userData && Object.keys(userData).length < 1)) {
        return (
            <Grid container justifyContent='space-around' spacing={3}>
                <Grid item sm={12} md={5}>
                    <Paper elevation={4} sx={{ backgroundColor: '#F9F9F9', p: 2 }}>
                        <Skeleton variant="rectangular" height={500} />
                        <Skeleton sx={{ pt: 2, mt: 2 }} />
                        <Skeleton sx={{ pt: 2 }} />
                        <Skeleton sx={{ pt: 2 }} />
                        <Skeleton sx={{ pt: 2 }} />
                    </Paper>

                </Grid>
                <Grid item sm={12} md={6}>
                    <Grid container direction='column' justifyContent='space-around' spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={4} sx={{ backgroundColor: '#F9F9F9', p: 2 }}>
                                <Skeleton variant='text' width={600} height={80} />
                                <Grid container>
                                    <Grid item xs={6}>
                                        <Skeleton variant='text' width={400} height={40} />
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Skeleton variant='circular' width={40} height={40} />
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Skeleton variant='circular' width={40} height={40} />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                        <Grid item sm={12} md={6}>
                            <Paper elevation={4} sx={{ backgroundColor: '#F9F9F9', p: 2 }}>
                                <Skeleton variant='text' width={600} height={80} />
                                <Grid container>
                                    <Grid item xs={6}>
                                        <Skeleton variant='text' width={400} height={40} />
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Skeleton variant='circular' width={40} height={40} />
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Skeleton variant='circular' width={40} height={40} />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                        <Grid item sm={12} md={6}>
                            <Paper elevation={4} sx={{ backgroundColor: '#F9F9F9', p: 2 }}>
                                <Skeleton variant='text' width={600} height={80} />
                                <Grid container>
                                    <Grid item xs={6}>
                                        <Skeleton variant='text' width={400} height={40} />
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Skeleton variant='circular' width={40} height={40} />
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Skeleton variant='circular' width={40} height={40} />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                        <Grid item sm={12} md={6}>
                            <Paper elevation={4} sx={{ backgroundColor: '#F9F9F9', p: 2 }}>
                                <Skeleton variant='text' width={600} height={80} />
                                <Skeleton sx={{ pt: 2, mt: 2 }} />
                                <Skeleton sx={{ pt: 2 }} />
                                <Skeleton sx={{ pt: 2 }} />
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        )
    }
    return (
        <Grid container justifyContent='space-around' spacing={3}>
            <Grid item xs={12} sm={5}>
                <Card elevation={4} sx={{ backgroundColor: '#F9F9F9' }}>
                    <CardMedia
                        component="img"
                        alt={userData.name}
                        height={500}
                        image={(profilePhoto && profilePhoto.data_url) || userData.profilePhoto || "https://res.cloudinary.com/dixj9zn09/image/upload/c_thumb,h_500,g_face/v1656055696/Pets/User/default_tskzn5.png"}
                    />
                    <IconButton size='large' color='primary' onClick={() => { document.getElementById('image-select').click() }} sx={{ position: 'relative', left: '90%', bottom: 60, backgroundColor: 'rgba(198, 220, 228, 0.5)' }}>
                        <TextField type='file' id="image-select" onChange={onImageSelect} sx={{ display: 'none' }} />
                        <EditIcon />
                    </IconButton>
                    <CardContent>
                        <Grid container component='form' onSubmit={userChangeHandler} spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    id="name"
                                    name="name"
                                    label="Name"
                                    fullWidth
                                    autoComplete="given-name"
                                    variant="standard"
                                    defaultValue={userData.name}
                                    inputRef={name}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    id="email"
                                    name="email"
                                    label="Email"
                                    fullWidth
                                    variant="standard"
                                    type='email'
                                    defaultValue={userData.email}
                                    inputRef={email}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="location"
                                    name="location"
                                    label="Location"
                                    fullWidth
                                    variant="standard"
                                    defaultValue={userData.location && userData.location.properties.description || ''}
                                    inputRef={location}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    size='large'
                                    color='primary'
                                    fullWidth
                                    type={contextValues.isLoading ? 'button' : 'submit'}
                                >
                                    {contextValues.isLoading ? <CircularProgress
                                        size={25}
                                        sx={{
                                            color: 'inherit',
                                            zIndex: 1
                                        }}
                                    /> : 'Save'}
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Grid container direction='column' justifyContent='space-around' spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <ReviewList reviews={userData.reviews} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Paper elevation={4} sx={{ backgroundColor: '#F9F9F9', p: 3 }}>
                            <Typography variant='h4'>
                                Your Pets
                            </Typography>
                            {userData.pets && userData.pets.length > 0 ?
                                <List sx={{ width: '100%', maxWidth: 400 }}>
                                    {userData.pets.map((pet) =>
                                        <React.Fragment key={pet._id}>
                                            <ListItem alignItems="flex-start" disablePadding>
                                                <ListItemButton onClick={() => navigate(`/pets/${pet._id}`)}>
                                                    <ListItemText
                                                        primary={
                                                            <React.Fragment>
                                                                <Typography
                                                                    sx={{ display: 'inline' }}
                                                                    component="span"
                                                                    variant="body1"
                                                                    color="text.primary"
                                                                >
                                                                    {pet.name}
                                                                </Typography>
                                                            </React.Fragment>
                                                        }
                                                    />
                                                </ListItemButton>
                                                <IconButton color='info' onClick={() => { navigate(`/pets/update/${pet._id}`) }}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color='error' onClick={() => contextValues.uploadData('pets', {}, 'pet', pet._id, 'delete')}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItem>
                                        </React.Fragment>
                                    )}
                                </List> :
                                <Typography variant='h6'>No pet up for adoption.</Typography>
                            }
                        </Paper>
                    </Grid>
                    {userData.shelter && Object.keys(userData.shelter).length > 0 && <Grid item xs={12} sm={6}>
                        <Paper elevation={4} sx={{ backgroundColor: '#F9F9F9', p: 3 }}>
                            <Typography variant='h4' sx={{ pb: 1 }}>
                                Your Shelter
                            </Typography>
                            <List sx={{ width: 400 }}>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => navigate(`/shelters/${userData.shelter._id}`)}>
                                        <Typography component='span' variant='body1'>
                                            {userData.shelter.name}
                                        </Typography>
                                    </ListItemButton>
                                    <IconButton color='info' onClick={() => { navigate(`/shelters/update/${userData.shelter._id}`) }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color='error' onClick={() => contextValues.uploadData('shelters', {}, 'shelter', userData.shelter._id, 'delete')}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>}
                    <Grid item xs={12} sm={6}>
                        <Paper elevation={4} sx={{ backgroundColor: '#F9F9F9', p: 3 }}>
                            <Typography variant='h4'>
                                Change Password
                            </Typography>
                            <Grid container component='form' onSubmit={passwordChangeHandler} spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        id="current-password"
                                        name="current-password"
                                        label="Current Password"
                                        fullWidth
                                        variant="standard"
                                        type='password'
                                        inputRef={currentPassword}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        id="new-password"
                                        name="new-password"
                                        label="New Password"
                                        fullWidth
                                        variant="standard"
                                        type='password'
                                        inputRef={newPassword}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        id="confirm-password"
                                        name="confirm-password"
                                        label="Confirm Password"
                                        fullWidth
                                        variant="standard"
                                        type='password'
                                        inputRef={passwordConfirm}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        variant="contained"
                                        size='large'
                                        color='primary'
                                        fullWidth
                                        type={contextValues.isLoading ? 'button' : 'submit'}
                                    >
                                        {contextValues.isLoading ? <CircularProgress
                                            size={25}
                                            sx={{
                                                color: 'inherit',
                                                zIndex: 1
                                            }}
                                        /> : 'Submit'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default CurrentUserProfile