import { useLocation } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { CircularProgress, Grid } from '@mui/material'
import { useAppContext } from '../context/appContext'
import PetDetails from '../components/PetDetails'
import ShelterDetails from '../components/ShelterDetails'

function Details() {
    const contextValues = useAppContext()
    const location = useLocation()
    const [pad, type, id] = location.pathname.split('/')
    const [data, setData] = useState({})
    useEffect(() => {
        async function waitForDetails() {
            const newData = await contextValues.getDetails(type, id)
            if (!newData) return
            setData(newData)
        }
        if ((data && Object.keys(data).length < 1) || (data && !data[type.substring(0, type.length - 1)]))
            waitForDetails()
    }, [data, contextValues.getDetails, type, id])
    // console.log(data)
    if (contextValues.isLoading) {
        return (
            <Grid container alignItems='center' direction='column'>
                <Grid item xs>
                    <CircularProgress thickness={5} />
                </Grid>
            </Grid>
        )
    }
    else if (type === 'pets' && data && Object.keys(data).length > 0 && data.pet) {
        return (
            <PetDetails data={data.pet} />
        )
    }
    else if (type === 'shelters' && data && Object.keys(data).length > 0 && data.shelter) {
        return (
            <ShelterDetails data={data.shelter} />
        )
    }
}

export default Details