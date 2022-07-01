import { Box, Button, Checkbox, Chip, CircularProgress, Container, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, OutlinedInput, Paper, Select, TextField, Pagination } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import MapComp from '../components/MapComp'
import NoData from '../components/NoData'
import PetCard from '../components/PetCard'
import ShelterCard from '../components/ShelterCard'
import { useAppContext } from '../context/appContext'

let timer = undefined

function All() {
    const contextValues = useAppContext()
    useEffect(() => {
        contextValues.changeRedirectTo('/all')
        contextValues.getData()
    }, [contextValues.getData]) //getData function uses useCallbacck hook with contextValues.dataToDisplay as a dependency so we do not need it here, page reloads on tab change just fine.

    const address = useRef()
    const range = useRef()
    const searchName = useRef()

    const noData = useRef(true)

    const [useUserAddress, setUserAddress] = useState({ userAddress: false, getData: false })
    useEffect(() => {
        if (useUserAddress.userAddress) {
            address.current.value = null
        }
        if (useUserAddress.getData) {
            getFilteredData()
        }
    }, [useUserAddress.userAddress])
    useEffect(() => {
        setUserAddress(prevState => { return { ...prevState, getData: false } })
    }, [contextValues.dataToDisplay])

    let data = []       //can set it as state for excluding MapComp's dependency on contextValues.shelters, contextValues.pets.
    if (contextValues.dataToDisplay === 0) {
        data = contextValues.pets
    }
    else if (contextValues.dataToDisplay === 1) {
        data = contextValues.shelters
    }
    else if (contextValues.dataToDisplay === 2) {
        data = [...contextValues.pets, ...contextValues.shelters]
    }

    function getFilteredData() {
        contextValues.updateSearchParams({ searchName: searchName.current.value, address: useUserAddress.userAddress ? contextValues.user.location.coordinates : address.current.value, range: range.current.value })
    }
    function onSearchFilterChange() {
        if (timer)
            clearTimeout(timer)
        timer = setTimeout(getFilteredData, 1000)
    }
    function resetFilters() {
        address.current.value = null
        range.current.value = null
        searchName.current.value = null
        setUserAddress({ userAddress: false, getData: false })
    }

    function onSpeciesChange(event) {
        contextValues.updateSearchParams({ selectedSpecies: event.target.value })
    }
    function onBreedsChange(event) {
        contextValues.updateSearchParams({ selectedBreeds: event.target.value })
    }
    function onRatingsChange(event) {
        contextValues.updateSearchParams({ minRating: event.target.value })
    }
    function resetNoData() {
        noData.current = true   //Won't let me do this directly under jsx component like, {noData.current = true}, gives warning- Failed prop type: Invalid prop `children` supplied to `ForwardRef(Grid)`
    }

    useEffect(() => {
        resetFilters()
    }, [contextValues.dataToDisplay])
    return (
        <React.Fragment>
            <Container component="header" maxWidth="lg" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                id="name"
                                name="name"
                                label="Name"
                                fullWidth
                                variant="standard"
                                inputRef={searchName}
                                onChange={onSearchFilterChange}
                            />
                        </Grid>
                        {contextValues.dataToDisplay === 0 && <React.Fragment>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth disabled={contextValues.dataToDisplay !== 0}>
                                    <InputLabel id="species-label">Species</InputLabel>
                                    <Select
                                        labelId="species-label"
                                        id="species"
                                        fullWidth
                                        multiple
                                        value={contextValues.selectedSpecies}
                                        input={<OutlinedInput id="species" label="Species" />}
                                        onChange={onSpeciesChange}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} />
                                                ))}
                                            </Box>
                                        )}
                                    >
                                        {contextValues.species.map((specie) => (
                                            <MenuItem
                                                key={specie}
                                                value={specie}
                                            >
                                                {specie}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth disabled={contextValues.selectedSpecies.length < 1}>
                                    <InputLabel id="breed-label">Breeds</InputLabel>
                                    <Select
                                        labelId="breed-label"
                                        id="breed"
                                        fullWidth
                                        multiple
                                        value={contextValues.selectedBreeds}
                                        input={<OutlinedInput id="breed" label="Breeds" />}
                                        onChange={onBreedsChange}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} />
                                                ))}
                                            </Box>
                                        )}
                                    >
                                        {contextValues.breeds.map((breed) => (
                                            <MenuItem
                                                key={breed}
                                                value={breed}
                                            >
                                                {breed}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </React.Fragment>
                        }
                        {contextValues.dataToDisplay === 1 && <React.Fragment>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth>
                                    <InputLabel id="ratings-label">Ratings</InputLabel>
                                    <Select
                                        labelId="ratings-label"
                                        id="ratings"
                                        label="Ratings"
                                        value={contextValues.minRating}
                                        onChange={onRatingsChange}
                                    >
                                        <MenuItem value={'0'}>All</MenuItem>
                                        <MenuItem value={1}>⭐+</MenuItem>
                                        <MenuItem value={2}>⭐⭐+</MenuItem>
                                        <MenuItem value={3}>⭐⭐⭐+</MenuItem>
                                        <MenuItem value={4}>⭐⭐⭐⭐+</MenuItem>
                                        <MenuItem value={5}>⭐⭐⭐⭐⭐</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </React.Fragment>}
                        <Grid item xs={12} sm={4}>
                            <TextField
                                id="address"
                                name="address"
                                label="Address"
                                fullWidth
                                autoComplete="section-red shipping street-address"
                                variant="standard"
                                inputRef={address}
                                onChange={onSearchFilterChange}
                                disabled={useUserAddress.userAddress}
                            />{/* HTML autoComplete standards- https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill */}
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                id="range"
                                name="range"
                                label="Range (km)"
                                fullWidth
                                variant="standard"
                                placeholder={`${contextValues.range}`}
                                inputRef={range}
                                onChange={onSearchFilterChange}
                            />
                        </Grid>
                        {contextValues.user && contextValues.user.location &&
                            <Grid item xs={12} sm={4}>
                                <FormControlLabel
                                    control={<Checkbox color="secondary" name="useSavedAddress" checked={useUserAddress.userAddress} onChange={(event) => setUserAddress({ userAddress: event.target.checked, getData: true })} />}
                                    label="Use my address for location"
                                />
                            </Grid>}
                        <Grid item xs={12} sm={4}>
                            <Button
                                variant="contained"
                                sx={{ mt: 3, ml: 1 }}
                                color='warning'
                                fullWidth
                                onClick={() => {
                                    if (!contextValues.isLoading) {
                                        resetFilters()
                                        contextValues.clearFilters()
                                    }
                                }}
                            >
                                Clear Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
            {contextValues.isLoading &&
                <Grid container alignItems='center' direction='column'>
                    <Grid item xs>
                        <CircularProgress thickness={5} />
                    </Grid>
                </Grid>
            }
            {contextValues.dataToDisplay === 2 ?
                <Container component="main" maxWidth="xl">
                    {!contextValues.isLoading && <Paper elevation={5} sx={{ height: '600px' }}>
                        <MapComp cluster data={data} />
                    </Paper>}
                </Container>
                :
                <>
                    <Grid container spacing={5} justifyContent={noData.current ? 'center' : 'left'} sx={{ display: contextValues.isLoading ? 'none' : 'flex' }}>
                        {resetNoData()}
                        {data.map(element => {
                            if (!element.species) {
                                noData.current = false
                                return <ShelterCard data={element} key={element._id} />
                            }
                            else {
                                noData.current = false
                                return <PetCard data={element} key={element._id} />
                            }
                        })}
                        {noData.current && !contextValues.isLoading ? <NoData /> : ''}
                    </Grid>
                    {!contextValues.isLoading &&
                        <Container component="footer" maxWidth="xl" sx={{ marginTop: 10, marginBottom: 2, marginX: 0 }}>
                            <Pagination count={contextValues.totalPages} page={contextValues.currentPage} onChange={(event, value) => contextValues.changeCurrentPage(value)} color="primary" showFirstButton showLastButton />
                        </Container>
                    }
                </>
            }
        </React.Fragment>
    )
}

export default All