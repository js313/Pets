import { CHANGE_DATA_TO_DISPLAY, CHANGE_PAGE, CHANGE_REDIRECT_TO, CLEAR_ALERT, CLEAR_ALL_ALERTS, CLEAR_FILTERS, GET_ALL_BREEDS_SUCCESS, GET_ALL_SPECIES_SUCCESS, GET_DATA_BEGIN, GET_DATA_ERROR, GET_DATA_SUCCESS, LOGOUT_USER, SETUP_USER_BEGIN, SETUP_USER_SUCCESS, SHOW_ALERT, UPDATE_SEARCH_PARAMS, UPLOAD_DATA_BEGIN, UPLOAD_DATA_ERROR, UPLOAD_DATA_SUCCESS } from "./actions"

function reducer(state, action) {
    if (action.type === SETUP_USER_BEGIN || action.type === GET_DATA_BEGIN || action.type === UPLOAD_DATA_BEGIN) {
        return {
            ...state,
            isLoading: true
        }
    }
    else if (action.type === SETUP_USER_SUCCESS) {
        const modifyAlerts = [...state.alerts]
        modifyAlerts.push({
            show: true,
            type: 'success',
            message: action.payload.message,
            id: Date.now()
        })
        return {
            ...state,
            isLoading: false,
            user: action.payload.data.user,
            token: action.payload.data.jwt,
            alerts: modifyAlerts
        }
    }
    else if (action.type === GET_DATA_ERROR || action.type === UPLOAD_DATA_ERROR) {
        const modifyAlerts = [...state.alerts]
        modifyAlerts.push({
            show: true,
            type: 'error',
            message: action.payload.message,
            id: Date.now()
        })
        return {
            ...state,
            isLoading: false,
            alerts: modifyAlerts
        }
    }
    else if (action.type === GET_DATA_SUCCESS) {
        if (!action.payload) {
            return {
                ...state,
                isLoading: false
            }
        }
        return {
            ...state,
            isLoading: false,
            pets: action.payload.data.pets || [],
            shelters: action.payload.data.shelters || [],
            totalPages: action.payload.totalPages || 0
        }
    }
    else if (action.type === CLEAR_ALERT) {
        const modifyAlerts = [...state.alerts]
        return {
            ...state,
            alerts: modifyAlerts.filter(alert => alert.id !== action.payload.id)
        }
    }
    else if (action.type === CLEAR_ALL_ALERTS) {
        return {
            ...state,
            alerts: []
        }
    }
    else if (action.type === CHANGE_DATA_TO_DISPLAY) {
        return {
            ...state,
            dataToDisplay: action.payload.typeOfData
        }
    }
    else if (action.type === LOGOUT_USER) {
        return {
            ...state,
            user: null,
            token: null
        }
    }
    else if (action.type === CLEAR_FILTERS) {
        return {
            ...state,
            searchName: action.payload.initialState.searchName,
            selectedSpecies: action.payload.initialState.selectedSpecies,
            selectedBreeds: action.payload.initialState.selectedBreeds,
            rangePointCoords: action.payload.initialState.rangePointCoords,
            range: action.payload.initialState.range,
            minRating: action.payload.initialState.minRating
        }
    }
    else if (action.type === UPDATE_SEARCH_PARAMS) {
        return {
            ...state,
            searchName: typeof (action.payload.newState.searchName) !== 'string' ? '' : action.payload.newState.searchName,
            selectedSpecies: typeof (action.payload.newState.selectedSpecies) !== 'object' ? state.selectedSpecies : (action.payload.newState.selectedSpecies.length < 1 ? [] : action.payload.newState.selectedSpecies),
            selectedBreeds: (action.payload.newState.selectedSpecies && action.payload.newState.selectedSpecies.length < 1) ? [] : action.payload.newState.selectedBreeds || state.selectedBreeds,
            rangePointCoords: typeof (action.payload.newState.rangePointCoords) !== 'object' ? [] : action.payload.newState.rangePointCoords || state.rangePointCoords,
            range: action.payload.newState.range || state.range,
            minRating: action.payload.newState.minRating || state.minRating
        }
    }
    else if (action.type === GET_ALL_SPECIES_SUCCESS) {
        return {
            ...state,
            species: action.payload.species.sort()
        }
    }
    else if (action.type === GET_ALL_BREEDS_SUCCESS) {
        return {
            ...state,
            breeds: action.payload.breeds.sort(),
            selectedBreeds: []
        }
    }
    else if (action.type === CHANGE_PAGE) {
        return {
            ...state,
            currentPage: action.payload.page,
            limit: action.payload.limit || state.limit
        }
    }
    else if (action.type === SHOW_ALERT || action.type === UPLOAD_DATA_SUCCESS) {
        const modifyAlerts = [...state.alerts]
        modifyAlerts.push({
            show: true,
            type: action.payload.type,
            message: action.payload.message,
            id: Date.now()
        })
        return {
            ...state,
            alerts: modifyAlerts,
            isLoading: false    //might not be desired for show alert type
        }
    }
    else if (action.type === CHANGE_REDIRECT_TO) {
        return {
            ...state,
            redirectTo: action.payload.url
        }
    }
    throw new Error(`No such action: ${action.type}`)
}

export default reducer