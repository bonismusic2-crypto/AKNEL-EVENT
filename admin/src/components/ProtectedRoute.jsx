import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
    const isAuth = localStorage.getItem('adminAuth') === 'true';

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
