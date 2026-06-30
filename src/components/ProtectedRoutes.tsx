
import { Navigate } from 'react-router-dom';
import { appStorageService } from '../services/appStorageService';

interface Props {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
    const token = appStorageService.getString('access_token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}