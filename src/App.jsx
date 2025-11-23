import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Admin from './Pages/Admin';
import Play from './Pages/Play';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';
  const isPlay = location.pathname === '/' || location.pathname === '/play';

  return (
    <main
      style={{ paddingTop: '20px' }}
      className={`main-content ${isAdmin ? 'admin-bg' : ''} ${isPlay ? 'play-bg' : ''}`}
    >
      <Routes>
        <Route path='/' element={<Play />} />
        <Route path='/play' element={<Play />} />
        <Route path='/admin' element={<Admin />} />
      </Routes>
    </main>
  );
};

const App = () => {
  return (
    <Router>
      <div className='app'>
        <AppContent />
      </div>
    </Router>
  );
};

export default App;
