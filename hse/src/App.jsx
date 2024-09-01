// App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Game from './components/Game';
import Result from './components/Result'; // Import the new component
import Admin from './components/Admin';

const App = () => {
  const [loginUsername, setLoginUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState();

  // if(!token) {
  //   return <Login setToken={setToken} />
  // }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setLoginUsername={setLoginUsername} setUserData={setUserData} />} />
        <Route path="/home" element={<Home loginUsername={loginUsername} userData={userData} />} />
        <Route path="/game" element={<Game loginUsername={loginUsername} userData={userData} />} />
        <Route path="/result" element={<Result />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};

export default App;