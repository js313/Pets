import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout, Landing, All, SignIn, PageNotFound, Details, PetRegister, ShelterRegister, CurrentUserProfile, PetUpdate, ShelterUpdate } from "./pages";
import AppProvider from './context/appContext';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/' element={<Layout />}>   {/* No index path should be nested */}
            <Route path='all' element={<All />} />
            <Route path='my-profile' element={<CurrentUserProfile />} />
            <Route path='pets/register' element={<PetRegister />} />
            <Route path='shelters/register' element={<ShelterRegister />} />
            <Route path='pets/update/:id' element={<PetUpdate />} />
            <Route path='shelters/update/:id' element={<ShelterUpdate />} />
            <Route path='pets/:id' element={<Details />} />
            <Route path='shelters/:id' element={<Details />} />
          </Route>
          <Route path='/signin' element={<SignIn />} />   {/* Signup and signin in the same page */}
          <Route path='*' element={<PageNotFound />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
