import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './Pages/Admin';
import Play from './Pages/Play';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className='app'>
        <main className='main-content'>
          <Routes>
            <Route path='/' element={<Play />} />
            <Route path='/play' element={<Play />} />
            <Route path='/admin' element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
