// PanelAdmin.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PanelAdmin = () => {
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    // Fetch user_data from the API endpoint
    axios.get('http://localhost:3004/api/users_data')
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error('Error fetching user_data:', error);
      });
  }, []);

  return (
    <div>
      <h2>User Data Panel (Admin)</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Personal Code</th>
            <th>Right Clicks</th>
            <th>Mistakes</th>
            <th>Played Time</th>
          </tr>
        </thead>
        <tbody>
          {userData.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.personal_code}</td>
              <td>{user.rightClicks}</td>
              <td>{user.mistakes}</td>
              <td>{user.played_time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PanelAdmin;
