import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute({ isAllowed, redirectTo = '/' }) {
    if (!isAllowed) {
        return <Navigate to={redirectTo} replace={true} />
    }

    return <Outlet />
}
