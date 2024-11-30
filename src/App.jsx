import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import Home from "./pages/Home/Home";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import SearchItinerary from "./pages/SearchItinerary/SearchItinerary";
import SavedItineraries from "./pages/SavedItineraries/SavedItineraries";
import MyItineraries from "./pages/MyItineraries/MyItineraries";
import AccountDetails from "./pages/AccountDetails/AccountDetails";
import ViewItinerary from "./pages/ViewItinerary/ViewItinerary";
import Comments from "./pages/Comments/Comments";
import ReportForm from "./pages/ReportForm/ReportForm";
import CreateItinerary from "./pages/CreateItinerary/CreateItinerary";
import AdminSearch from "./pages/AdminSearch/AdminSearch";
import ViewReports from "./pages/ViewReports/ViewReports";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import useSupabase from "./context/SupabaseContext";

export default function App() {
	const { user } = useSupabase();

	const router = createBrowserRouter(
		createRoutesFromElements(
			<Route path="/" element={<Root />} errorElement={<ErrorPage />}>
				<Route index element={<Home />} />
				<Route element={<ProtectedRoute isAllowed={!!user} redirectTo="login" />}>
					<Route path="saved-itineraries" element={<SavedItineraries />} />
					<Route path="my-itineraries" element={<MyItineraries />} />
					<Route path="create-itinerary" element={<CreateItinerary />} />
					<Route path="account" element={<AccountDetails />} />
					<Route path="/report-form/:postId" element={<ReportForm />} />
					<Route path="admin-search" element={<AdminSearch />} />
					<Route path="/view-reports/:postId" element={<ViewReports />} />
				</Route>
				<Route path="register" element={<Register />} />
				<Route path="login" element={<Login />} />
				<Route path="search-itinerary" element={<SearchItinerary />} />
				<Route path="/view-itinerary/:postId" element={<ViewItinerary />} />
				<Route path="/comments/:postId" element={<Comments />} />
			</Route>
		)
	);

	return <RouterProvider router={router} />;
}
