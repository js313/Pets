import { Autocomplete, Button, Checkbox, CircularProgress, Container, FormControl, FormControlLabel, Grid, IconButton, Paper, TextField, Typography } from '@mui/material'
import ImageUploading from "react-images-uploading"
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/appContext'

function ShelterRegister() {
    const contextValues = useAppContext()
    const name = useRef()
    const email = useRef()
    const location = useRef()
    const description = useRef()
    const allUsers = useRef([])
    const navigate = useNavigate()

    const [selectedCoverImage, setSelectedCoverImage] = useState([])
    const [selectedImages, setSelectedImages] = useState([])
    const [teamMembers, setTeamMembers] = useState([])
    const [useUserLocation, setUseUserLocation] = useState(false)

    useEffect(() => {
        if (!contextValues.user) {
            contextValues.changeRedirectTo('/shelters/register')
            navigate('/signin', { replace: true })
        }
        else {
            async function getUsers() {
                const { data } = await contextValues.getAllUsers()
                allUsers.current.value = data.users.filter(user => user.id !== contextValues.user.id)   //exclude current user
            }
            getUsers()
        }
    }, [contextValues.user, navigate, contextValues.getAllUsers])

    const maxImages = 5

    async function submitHandler(event) {
        event.preventDefault()
        if (selectedCoverImage.length < 1) {
            contextValues.showAlert('info', 'Please fill all required fields.')
            return
        }
        let geoCodedData = undefined
        if (!useUserLocation)
            geoCodedData = await contextValues.geoCode(location.current.value)
        const data = {
            name: name.current.value,
            email: email.current.value,
            description: description.current.value,
            team: teamMembers,
            imageCover: selectedCoverImage[0],
            images: selectedImages,
            location: useUserLocation ? contextValues.user.location : geoCodedData.features[0] ? {
                type: "Point",
                coordinates: geoCodedData.features[0].center,
                properties: {
                    address: geoCodedData.features[0].place_name,
                    description: location.current.value
                }
            } : undefined
        }
        contextValues.uploadData('shelters', data, 'shelter')
    }

    return (
        <Container component="form" maxWidth="sm" onSubmit={submitHandler} sx={{ mb: 4 }} >
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <Typography component="h1" variant="h4" align="center" gutterBottom>
                    Register a Shelter
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="name"
                            name="name"
                            label="Name"
                            fullWidth
                            autoComplete="given-name"
                            variant="standard"
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
                            type="email"
                            inputRef={email}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            id="description"
                            name="description"
                            label="Description"
                            fullWidth
                            variant="standard"
                            multiline
                            inputRef={description}
                        />
                    </Grid>
                    {!useUserLocation && <Grid item xs={12}>
                        <TextField
                            required
                            id="location"
                            name="location"
                            label="Location"
                            fullWidth
                            variant="standard"
                            inputRef={location}
                        />
                    </Grid>}
                    {contextValues.user && contextValues.user.location &&
                        <Grid item xs={12}>
                            <FormControlLabel
                                checked={useUserLocation}
                                onChange={(event) => setUseUserLocation(event.target.checked)}
                                control={<Checkbox color="secondary" name="useSavedAddress" />}
                                label="Use my current address as location."
                            />
                        </Grid>}
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <Autocomplete
                                multiple
                                id="team"
                                disabled={contextValues.isLoading}
                                options={allUsers.current.value || []}
                                getOptionLabel={(option) => option.name}
                                onChange={(event, value, reason) => setTeamMembers(value.map(el => el.id))}
                                filterSelectedOptions
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Team"
                                    />
                                )}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <ImageUploading
                            value={selectedCoverImage}
                            onChange={(imageList, updateIndex) => setSelectedCoverImage(imageList)}
                            maxNumber={1}
                            dataURLKey="data_url"
                        >
                            {({
                                imageList,
                                onImageUpload,
                                onImageRemoveAll,
                                onImageUpdate,
                                onImageRemove,
                                isDragging,
                                dragProps
                            }) => (
                                <Grid container>
                                    <Grid item xs={6}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            type='button'
                                            size='large'
                                            fullWidth
                                            onClick={onImageUpload}
                                            disabled={contextValues.isLoading}
                                        >
                                            {contextValues.isLoading ? <CircularProgress
                                                size={25}
                                                sx={{
                                                    color: 'inherit',
                                                    zIndex: 1
                                                }}
                                            /> : 'Upload Cover Image *'}
                                        </Button>
                                    </Grid>
                                    {imageList.map((image, index) => (
                                        <Grid container direction='column' key={index} maxHeight={60} maxWidth={250}>
                                            <Grid item xs={6} sx={{ textAlign: 'right', border: '2px; black', borderRadius: '10%' }}>
                                                <img src={image.data_url} alt="" width="100" height="60" style={{ border: '3px solid gray', borderRadius: '5%' }} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <IconButton color='info' onClick={() => onImageUpdate(index)}><EditRoundedIcon /></IconButton>
                                                <IconButton color='error' onClick={() => onImageRemove(index)}><DeleteRoundedIcon /></IconButton>
                                            </Grid>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </ImageUploading>
                    </Grid>
                    <Grid item xs={12}>
                        <ImageUploading
                            multiple
                            value={selectedImages}
                            onChange={(imageList, updateIndex) => setSelectedImages(imageList)}
                            maxNumber={maxImages}
                            dataURLKey="data_url"
                        >
                            {({
                                imageList,
                                onImageUpload,
                                onImageRemoveAll,
                                onImageUpdate,
                                onImageRemove,
                                isDragging,
                                dragProps
                            }) => (
                                <Grid container>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            type='button'
                                            size='large'
                                            fullWidth
                                            onClick={onImageUpload}
                                            sx={{ height: '100%' }}
                                            disabled={contextValues.isLoading}
                                        >
                                            {contextValues.isLoading ? <CircularProgress
                                                size={25}
                                                sx={{
                                                    color: 'inherit',
                                                    zIndex: 1
                                                }}
                                            /> : 'Upload Images'}
                                        </Button>
                                    </Grid>
                                    {imageList.map((image, index) => (
                                        <Grid item xs={4} key={index} sx={{ marginTop: 1, border: '2px; black', borderRadius: '10%' }}>
                                            <img src={image.data_url} alt="" width="100" height="60" style={{ border: '3px solid gray', borderRadius: '5%' }} />
                                            <div>
                                                <IconButton color='info' onClick={() => onImageUpdate(index)}><EditRoundedIcon /></IconButton>
                                                <IconButton color='error' onClick={() => onImageRemove(index)}><DeleteRoundedIcon /></IconButton>
                                            </div>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </ImageUploading>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            size='large'
                            color='success'
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
        </Container>
    )
}

export default ShelterRegister