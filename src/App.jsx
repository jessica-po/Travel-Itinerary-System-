import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import Root from './routes/root';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import Home from './pages/Home/Home';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import SearchItinerary from './pages/SearchItinerary/SearchItinerary';
import SavedItineraries from './pages/SavedItineraries/SavedItineraries';
import MyItineraries from './pages/MyItineraries/MyItineraries';
import AccountDetails from './pages/AccountDetails/AccountDetails'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />} errorElement={<ErrorPage />}>
      <Route index element={<Home />} />
      <Route path="saved-itineraries" element={<SavedItineraries />} />
      <Route path="my-itineraries" element={<MyItineraries />} />
      <Route path="account" element={<AccountDetails />} />
      <Route path="register" element={<Register />} />
      <Route path="login" element={<Login />} />
      <Route path="search-itinerary" element={<SearchItinerary />} />
    </Route>
  ),
);

export default function App() {
  return <RouterProvider router={router} />
}
