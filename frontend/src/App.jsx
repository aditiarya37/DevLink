import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'; 
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Navbar />
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