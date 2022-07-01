import React, { useCallback, useContext, useEffect, useReducer } from "react";
import axios from 'axios'
import { CHANGE_DATA_TO_DISPLAY, CHANGE_PAGE, CHANGE_REDIRECT_TO, CLEAR_ALERT, CLEAR_ALL_ALERTS, CLEAR_FILTERS, GET_ALL_BREEDS_SUCCESS, GET_ALL_SPECIES_SUCCESS, GET_DATA_BEGIN, GET_DATA_ERROR, GET_DATA_SUCCESS, LOGOUT_USER, SETUP_USER_BEGIN, SETUP_USER_SUCCESS, SHOW_ALERT, UPDATE_SEARCH_PARAMS, UPLOAD_DATA_BEGIN, UPLOAD_DATA_ERROR, UPLOAD_DATA_SUCCESS } from "./actions";
import initialState from "./initialState";
import reducer from "./reducer";
import { useNavigate } from "react-router-dom";

const mapboxToken = 'pk.eyJ1IjoianMwMDAiLCJhIjoiY2tzZXltb2YxMTUyZDMwb2Q1d2I4ZzFnYiJ9.5qVNCSjIGDPYA1EhDHLWUw'

const AppContext = React.createContext(initialState)

function AppProvider(props) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const navigate = useNavigate()
    function addToLocalStorage(data) {
        for (let key in data) {
            if (typeof (data[key]) === 'object')
                localStorage.setItem(key, JSON.stringify(data[key]))
            else
                localStorage.setItem(key, data[key])
        }
    }

    function clearAlert(id) {
        dispatch({ type: CLEAR_ALERT, payload: { id } })
    }

    function clearAllAlerts() {
        dispatch({ type: CLEAR_ALL_ALERTS })
    }

    async function setupUser(credentials, endpoint) {
        dispatch({ type: SETUP_USER_BEGIN })
        try {
            const { data: response } = await axios.post('/api/v1/users/' + endpoint, credentials)
            addToLocalStorage({ user: response.data.user, token: response.data.jwt })
            dispatch({ type: SETUP_USER_SUCCESS, payload: { data: response.data, type: 'success', message: `S${endpoint.split('s')[1]} successful.` } })
        } catch (error) {
            console.log(error)
            if (error.response && error.response.data)
                dispatch({ type: GET_DATA_ERROR, payload: { message: (error.response.data.message || 'Internal server error, try again later.') } })
            else
                dispatch({ type: GET_DATA_ERROR, payload: { message: 'Internal server error, try again later.' } })
        }
    }

    const getAllSpecies = useCallback(async () => {
        try {
            const { data: species } = await axios.get(`/api/v1/pets/all-species`)
            dispatch({ type: GET_ALL_SPECIES_SUCCESS, payload: { species: species.data.species } })
        } catch (error) {
            console.log(error)
            if (error.response && error.response.data)
                dispatch({ type: GET_DATA_ERROR, payload: { message: (error.response.data.message || 'Internal server error, try again later.') } })
            else
                dispatch({ type: GET_DATA_ERROR, payload: { message: 'Internal server error, try again later.' } })
        }
    }, [])

    const getAllBreeds = useCallback(async () => {
        try {
            if (state.selectedSpecies.length < 1) return []
            const { data: breeds } = await axios.get(`/api/v1/pets/all-breeds?species=${state.selectedSpecies}`)
            dispatch({ type: GET_ALL_BREEDS_SUCCESS, payload: { breeds: breeds.data.breeds } })
        } catch (error) {
            console.log(error)
            if (error.response && error.response.data)
                dispatch({ type: GET_DATA_ERROR, payload: { message: (error.response.data.message || 'Internal server error, try again later.') } })
            else
                dispatch({ type: GET_DATA_ERROR, payload: { message: 'Internal server error, try again later.' } })
        }
    }, [state.selectedSpecies])

    function buildUrl(within) {
        let endpoint = 'all'
        if (state.dataToDisplay === 0) {
            endpoint = 'pets'
        }
        else if (state.dataToDisplay === 1) {
            endpoint = 'shelters'
        }

        const nameQuery = state.searchName.length > 0 ? `name=${state.searchName}` : ''
        const speciesQuery = state.selectedSpecies.length > 0 ? `species=${state.selectedSpecies}` : ''

        const breedsQuery = state.selectedBreeds.length > 0 ? `breed=${state.selectedBreeds}` : ''  //has to be 'breed' and not 'breeds' as that is how it is stored in DB

        const minRatingQuery = state.minRating ? `ratingsAverage[gte]=${state.minRating}` : ''

        console.log(`/api/v1/${endpoint}${within ? '/get-within' : ''}?page=${state.currentPage}&limit=${state.limit}&${nameQuery}${nameQuery && '&'}${speciesQuery}${speciesQuery && '&'}${breedsQuery}${breedsQuery && '&'}${minRatingQuery}${minRatingQuery && '&'}`)

        return `/api/v1/${endpoint}${within ? '/get-within' : ''}?page=${state.currentPage}&limit=${state.limit}&${nameQuery}${nameQuery && '&'}${speciesQuery}${speciesQuery && '&'}${breedsQuery}${breedsQuery && '&'}${minRatingQuery}${minRatingQuery && '&'}`
    }

    const getData = useCallback(async () => {
        dispatch({ type: GET_DATA_BEGIN })
        try {
            let response = {}
            if (state.rangePointCoords && state.rangePointCoords.length === 2) {
                const url = buildUrl(true)
                const { data } = await axios.post(url, {
                    lng: state.rangePointCoords[0],
                    lat: state.rangePointCoords[1],
                    distance: state.range
                })
                response = data
            }
            else {
                const url = buildUrl(false)
                const { data } = await axios.get(url)
                response = data
            }

            dispatch({ type: GET_DATA_SUCCESS, payload: { data: response.data, totalPages: Math.ceil(response.totalCount / state.limit) } })

        } catch (error) {
            console.log(error)
            if (error.response && error.response.data)
                dispatch({ type: GET_DATA_ERROR, payload: { message: (error.response.data.message || 'Internal server error, try again later.') } })
            else
                dispatch({ type: GET_DATA_ERROR, payload: { message: 'Internal server error, try again later.' } })
        }
    }, [state.dataToDisplay, state.searchName, state.selectedBreeds, state.rangePointCoords, state.minRating, state.currentPage])   //removed selectedSpecies as we change selectedBreeds to [] whenever it changes, similarly for range updating address and range at same time, either will be fine
    //[state.dataToDisplay, state.searchName, state.selectedSpecies, state.selectedBreeds, state.rangePointCoords, state.range, state.currentPage]

    function changeDataToDisplay(type) {
        localStorage.setItem('currentDataTab', type)
        dispatch({ type: CHANGE_DATA_TO_DISPLAY, payload: { typeOfData: type } })
        dispatch({ type: CHANGE_PAGE, payload: { page: 1 } })
        dispatch({ type: CLEAR_FILTERS, payload: { initialState } })
    }

    function logout() {
        dispatch({ type: LOGOUT_USER })
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        axios('/api/v1/users/signout')
    }

    function clearFilters() {
        dispatch({ type: CLEAR_FILTERS, payload: { initialState } })
    }

    async function geoCode(address) {
        const { data } = await axios(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${mapboxToken}`)
        console.log(data)
        if (data.features.length < 1) dispatch({ type: SHOW_ALERT, payload: { type: 'info', message: 'Could not find the given address.' } })
        return data
    }
    async function updateSearchParams(newState) {
        if (newState.address) {
            try {
                console.log(newState.address)
                if (typeof (newState.address) === 'object')
                    dispatch({ type: UPDATE_SEARCH_PARAMS, payload: { newState: { ...newState, rangePointCoords: newState.address } } })
                else {
                    const data = await geoCode(newState.address)
                    dispatch({ type: UPDATE_SEARCH_PARAMS, payload: { newState: { ...newState, rangePointCoords: data.features[0].center } } })
                }
            } catch (error) {
                console.log(error)
                if (error.response && error.response.data)
                    dispatch({ type: GET_DATA_ERROR, payload: { message: (error.response.data.message || 'Location not found') } })
                else
                    dispatch({ type: GET_DATA_ERROR, payload: { message: 'Location not found' } })
            }
        }
        else {
            dispatch({ type: UPDATE_SEARCH_PARAMS, payload: { newState: { ...newState, rangePointCoords: [], range: 10 } } })
        }
    }


    function changeCurrentPage(page) {
        dispatch({ type: CHANGE_PAGE, payload: { page } })
    }

    const getDetails = useCallback(async (type, id) => {
        try {
            dispatch({ type: GET_DATA_BEGIN })
            console.log(`/api/v1/${type}/${id}`)
            const { data: response } = await axios.get(`/api/v1/${type}/${id}`)
            if (!response.data[`${type.slice(0, -1)}`]) {
                dispatch({ type: GET_DATA_ERROR, payload: { message: `No ${type.slice(0, -1)} with that id found.` } })
                navigate('/all')
            }
            else {
                dispatch({ type: GET_DATA_SUCCESS })
                return response.data
            }
        } catch (error) {
            console.log(error)
            if (error.response && error.response.data)
                dispatch({ type: GET_DATA_ERROR, payload: { message: (error.response.data.message || `"${type.slice(0, -1)}" invalid id.`) } })
            else
                dispatch({ type: GET_DATA_ERROR, payload: { message: `"${type.slice(0, -1)}" invalid id.` } })
            navigate('/all', { replace: true })
        }
    }, [])

    function showAlert(type, message) {
        dispatch({ type: SHOW_ALERT, payload: { type, message } })
    }

    async function uploadData(endpoint, data, type, id, action) {   //rework this function, params are all over the place
        dispatch({ type: UPLOAD_DATA_BEGIN })
        try {
            if (!state.user) {
                dispatch({ type: SHOW_ALERT, payload: { type: 'error', message: 'Signin required.' } })
                navigate('/signin') //if someone logs out while filling the form
                return
            }
            if (!id) {
                const { data: response } = await axios.post(`/api/v1/${endpoint}`, data, {
                    headers: {
                        'Authorization': `Bearer ${state.token}`
                    }
                })
                if (type === 'pet') {
                    dispatch({ type: UPLOAD_DATA_SUCCESS, payload: { type: 'success', message: 'Pet registered successfully.' } })
                    navigate(`/pets/${response.data.pet._id}`, { replace: true })
                }
                else if (type === 'review') {
                    dispatch({ type: UPLOAD_DATA_SUCCESS, payload: { type: 'success', message: 'Rating added.' } })
                    navigate(0) //reload
                }
                else if (type === 'shelter') {
                    dispatch({ type: UPLOAD_DATA_SUCCESS, payload: { type: 'success', message: 'Shelter registered successfully.' } })
                    navigate(`/shelters/${response.data.shelter._id}`, { replace: true })
                }
            }
            else if (action === 'update') {
                const { data: response } = await axios.patch(`/api/v1/${endpoint}/${id}`, data, {
                    headers: {
                        'Authorization': `Bearer ${state.token}`
                    }
                })
                if (type === 'review') {
                    dispatch({ type: UPLOAD_DATA_SUCCESS, payload: { type: 'success', message: 'Rating updated successfully.' } })
                    navigate(0) //reload
                }
                if (type === 'pet') {
                    dispatch({ type: UPLOAD_DATA_SUCCESS, payload: { type: 'success', message: 'Pet updated successfully.' } })
                    navigate(`/pets/${id}`, { replace: true })
                }
                else if (type === 'shelter') {
                    dispatch({ type: UPLOAD_DATA_SUCCESS, payload: { type: 'success', message: 'Shelter updated successfully.' } })
                    navigate(`/shelters/${id}`, { replace: true })
                }
            }
            else if (action === 'delete') {
                await axios.delete(`/api/v1/${endpoint}/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${state.token}`
                    }
                })
                if (type === 'review') {
                    dispatch({ type: UPLOAD_DATA_SUCCESS, payload: { type: 'success', message: 'Rating deleted.' } })
                    navigate(0) //reload
                }
                if (type === 'pet') {
                    dispatch({ type: UPLOAD_DATA_SUCCESS, payload: { type: 'success', message: 'Pet deleted successfully.' } })
                    navigate(0)
                }
                if (type === 'shelter') {
                    dispatch({ type: UPLOAD_DATA_SUCCESS, payload: { type: 'success', message: 'Shelter deleted successfully.' } })
                    navigate(0)
                }
            }
        } catch (error) {
            console.log(error)
            if (error.response && error.response.data)
                dispatch({ type: UPLOAD_DATA_ERROR, payload: { message: (error.response.data.message || 'Internal server error, try again later.') } })
            else
                dispatch({ type: UPLOAD_DATA_ERROR, payload: { message: 'Internal server error, try again later.' } })
            navigate(`/all`)
        }
    }

    const changeRedirectTo = useCallback((url) => {
        dispatch({ type: CHANGE_REDIRECT_TO, payload: { url } })
    }, [])

    const getAllUsers = useCallback(async () => {
        try {
            dispatch({ type: GET_DATA_BEGIN })
            const { data: users } = await axios.get(`/api/v1/users/get-users?role=user,parent`, {
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            })
            dispatch({ type: GET_DATA_SUCCESS })
            return users
        } catch (error) {
            console.log(error)
            if (error.response && error.response.data)
                dispatch({ type: GET_DATA_ERROR, payload: { message: (error.response.data.message || 'Internal server error, try again later.') } })
            else
                dispatch({ type: GET_DATA_ERROR, payload: { message: 'Internal server error, try again later.' } })
        }
    }, [])

    const getUserDetails = useCallback(async () => {
        dispatch({ type: GET_DATA_BEGIN })
        try {
            if (!state.user) return
            const { data } = await axios.get('/api/v1/users/profile', {
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            })
            dispatch({ type: GET_DATA_SUCCESS })
            return data.data
        } catch (error) {
            if (error.response && error.response.data)
                dispatch({ type: GET_DATA_ERROR, payload: { message: (error.response.data.message || 'Internal server error, try again later.') } })
            else
                dispatch({ type: GET_DATA_ERROR, payload: { message: 'Internal server error, try again later.' } })
        }
    }, [state.user])

    async function changePassword(data) {
        dispatch({ type: UPLOAD_DATA_BEGIN })
        try {
            const { data: response } = await axios.patch('/api/v1/users/update-password', data, {
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            })
            dispatch({ type: UPLOAD_DATA_SUCCESS, payload: { type: 'info', message: `${response.message}, Please login again.` } })
        } catch (error) {
            console.log(error)
            if (error.response && error.response.data)
                dispatch({ type: UPLOAD_DATA_ERROR, payload: { message: (error.response.data.message || 'Internal server error, try again later.') } })
            else
                dispatch({ type: UPLOAD_DATA_ERROR, payload: { message: 'Internal server error, try again later.' } })
            navigate(`/all`)
        }
        logout()
    }

    async function changeUserDetails(data) {
        dispatch({ type: UPLOAD_DATA_BEGIN })
        console.log(data)
        try {
            const { data: response } = await axios.patch('/api/v1/users/update-user-details', data, {
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            })
            addToLocalStorage({ user: response.data.user })
            dispatch({ type: SETUP_USER_SUCCESS, payload: { data: { ...response.data, jwt: state.token }, type: 'success', message: response.message } })
        } catch (error) {
            console.log(error)
            if (error.response && error.response.data)
                dispatch({ type: UPLOAD_DATA_ERROR, payload: { message: (error.response.data.message || 'Internal server error, try again later.') } })
            else
                dispatch({ type: UPLOAD_DATA_ERROR, payload: { message: 'Internal server error, try again later.' } })
            navigate(`/all`)
        }
    }

    useEffect(() => {
        getAllSpecies()
        getAllBreeds()
    }, [getAllSpecies, getAllBreeds])

    return <AppContext.Provider value={{ ...state, setupUser, clearAlert, clearAllAlerts, getData, changeDataToDisplay, logout, clearFilters, updateSearchParams, changeCurrentPage, getDetails, showAlert, uploadData, changeRedirectTo, getAllUsers, geoCode, getUserDetails, changePassword, changeUserDetails }}>
        {props.children}    {/* So that all context functionality is contained within this file */}
    </AppContext.Provider>
}

function useAppContext() {      //Custom Hook so we don't have to import AppContext and useContext, useAppContext will suffice.
    return useContext(AppContext)
}

export default AppProvider
export { useAppContext }