const initialState = {
    isLoading: false,
    alerts: [],
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    token: localStorage.getItem('token'),
    pets: [],
    shelters: [],
    dataToDisplay: Number(localStorage.getItem('currentDataTab')) || 0,    //0- Pets, 1- Shelters, 2- Maps
    searchName: '',     //redundant right now handling search by name on frontend
    species: [],
    selectedSpecies: [],
    breeds: [],
    selectedBreeds: [],
    rangePointCoords: [],  //format- [lng, lat]
    range: 10,
    currentPage: 1,
    limit: 12,
    totalPages: 0,
    minRating: '',
    shelterDetails: {}, //
    petDetails: {},  //These two might not be needed in global state
    redirectTo: ''  //This is for returning back to a page, eg. registering a pet after signin.
}

export default initialState