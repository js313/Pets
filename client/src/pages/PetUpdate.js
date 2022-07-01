import { Button, Checkbox, CircularProgress, Container, FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Skeleton, TextField, Typography } from '@mui/material'
import ImageUploading from "react-images-uploading"
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/appContext'
import { useNavigate, useLocation } from 'react-router-dom'

function PetUpdate() {
    const contextValues = useAppContext()
    const [petDetails, setPetDetails] = useState({})
    const [selectedImages, setSelectedImages] = useState([])
    const [gender, setGender] = useState('')

    const navigate = useNavigate()
    const location = useLocation()

    const name = useRef()
    const species = useRef()
    const breed = useRef()
    const about = useRef()
    const inShelter = useRef()
    const petId = useRef(location.pathname.split('/')[3])

    useEffect(() => {
        if (!contextValues.user) {  //prevent other users, that are not parents
            contextValues.changeRedirectTo('/pets/register')
            navigate('/signin', { replace: true })
        }
        else {
            async function waitForDetails() {
                const response = await contextValues.getDetails('pets', petId.current)
                setPetDetails(response.pet)
                setGender(response.pet.gender && response.pet.gender.charAt(0).toLowerCase() === 'm' ? 'Male' : 'Female')
                setSelectedImages(response.pet.images.map(imageURL => { return { data_url: imageURL } }))
            }
            if (!petDetails || Object.keys(petDetails).length < 1)
                waitForDetails()
        }
    }, [contextValues.user, navigate, petDetails, gender, selectedImages])
    // console.log(petDetails)

    if (petDetails && Object.keys(petDetails).length < 1) {
        return (
            <Container component="form" maxWidth="sm" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        Update Pet
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Skeleton sx={{ width: '100%', height: 40 }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Skeleton sx={{ width: '100%', height: 40 }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Skeleton sx={{ width: '100%', height: 40 }} />
                        </Grid>
                        <Grid item xs={12}>
                            <Skeleton sx={{ width: '100%', height: 40 }} />
                        </Grid>
                        <Grid item xs={12}>
                            <Skeleton sx={{ width: '100%', height: 40 }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Skeleton sx={{ width: '100%', height: 40 }} />
                        </Grid>
                        <Grid item xs={12}>
                            <Skeleton sx={{ width: '100%', height: 40 }} />
                        </Grid>
                        <Grid item xs={12}>
                            <Skeleton sx={{ width: '100%', height: 40 }} />
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        )
    }

    const maxImages = 5
    function onImageChange(imageList) {
        setSelectedImages(imageList)
    }
    function submitHandler(event) {
        event.preventDefault()
        if (!gender) {
            contextValues.showAlert('info', 'Please fill all required fields.')
            return
        }

        const newPetData = {
            name: name.current.value,
            species: species.current.value,
            breed: breed.current.value,
            about: about.current.value,
            shelter: (inShelter.current && inShelter.current.value) ? contextValues.user.shelter : false,
            gender: gender,
            images: selectedImages
        }
        // console.log(newPetData)
        contextValues.uploadData('pets', newPetData, 'pet', petId.current, 'update')
    }

    return (
        <Container component="form" onSubmit={submitHandler} maxWidth="sm" sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <Typography component="h1" variant="h4" align="center" gutterBottom>
                    Update Pet
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            required
                            id="name"
                            name="name"
                            label="Name"
                            fullWidth
                            autoComplete="given-name"
                            variant="standard"
                            defaultValue={petDetails.name}
                            inputRef={name}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="species"
                            name="species"
                            label="Species"
                            fullWidth
                            variant="standard"
                            defaultValue={petDetails.species}
                            inputRef={species}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="breed"
                            name="breed"
                            label="Breed"
                            fullWidth
                            variant="standard"
                            defaultValue={petDetails.breed}
                            inputRef={breed}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            id="about"
                            name="about"
                            label="About"
                            fullWidth
                            variant="standard"
                            multiline
                            defaultValue={petDetails.about}
                            inputRef={about}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="gender-label">Gender *</InputLabel>
                            <Select
                                labelId="gender-label"
                                id="gender"
                                label="Gender"
                                value={gender}
                                onChange={(event) => { setGender(event.target.value) }}
                            >
                                <MenuItem value={'Male'}>Male</MenuItem>
                                <MenuItem value={'Female'}>Female</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <ImageUploading
                            multiple
                            value={selectedImages}
                            onChange={onImageChange}
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
                </Grid >
            </Paper >
        </Container >
    )
}

export default PetUpdate