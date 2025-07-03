import {useEffect} from 'react';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom'; 
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

const AuthStateWatcher = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/auth/callback') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  return null;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Navbar />
        <AuthStateWatcher />
        <main className="flex-grow container mx-auto px-4 py-8">
          <AppRoutes /> 
        </main>
        <footer className="bg-gray-800 text-center p-4 text-sm text-gray-400">
            © {new Date().getFullYear()} DevLink. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;