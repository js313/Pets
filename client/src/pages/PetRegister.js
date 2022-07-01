import { Button, Checkbox, CircularProgress, Container, FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material'
import ImageUploading from "react-images-uploading"
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/appContext'
import { useNavigate } from 'react-router-dom'

function PetRegister() {
    const contextValues = useAppContext()
    const [selectedImages, setSelectedImages] = useState([])
    const [gender, setGender] = useState('')
    const name = useRef()
    const species = useRef()
    const breed = useRef()
    const about = useRef()
    const inShelter = useRef()
    const navigate = useNavigate()

    useEffect(() => {
        if (!contextValues.user) {
            contextValues.changeRedirectTo('/pets/register')
            navigate('/signin', { replace: true })
        }
    }, [contextValues.user, navigate])

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
        {   //Frontend upload
            // const imageURLs = []
            // for (let i = 0; i < selectedImages.length; i++) {
            //     const formData = new FormData()
            //     formData.append('file', selectedImages[i].file)
            //     formData.append('upload_preset', 'pgqov4wt')
            //     formData.append('folder', `Pets`)
            //     try {
            //         const response = await axios.post("https://api.cloudinary.com/v1_1/dixj9zn09/image/upload", formData)
            //         imageURLs.push(response.data.url)
            //     } catch (error) {
            //         console.log(error)
            //         contextValues.showAlert('error', error)
            //     }
            // }
        }

        const petData = {
            name: name.current.value,
            species: species.current.value,
            breed: breed.current.value,
            about: about.current.value,
            shelter: (inShelter.current && inShelter.current.value) ? contextValues.user.shelter : false,
            gender: gender,
            images: selectedImages
        }
        contextValues.uploadData('pets', petData, 'pet')
    }
    return (
        <Container component="form" onSubmit={submitHandler} maxWidth="sm" sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <Typography component="h1" variant="h4" align="center" gutterBottom>
                    Register a Pet
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
                    {contextValues.user && contextValues.user.shelter && <Grid item xs={12} sm={6}>
                        <FormControlLabel control={<Checkbox inputRef={inShelter} defaultChecked />} label="Register in your shelter?" />
                    </Grid>}
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
                </Grid>
            </Paper>
        </Container>
    )
}

export default PetRegister