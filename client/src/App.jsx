import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import DashboardPage from './pages/DashboardPage';
import { GoogleOAuthProvider } from '@react-oauth/google';

const App = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '401212468401-0fiv4hcm1cjvsg61a7grqudb9uop0n2a.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ToastProvider>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </ToastProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
