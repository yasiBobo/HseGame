// Users.jsx (or your relevant component)
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/api/users') // Notice the relative URL starting with '/api'
      .then((response) => setUsers(response.data))
      .catch((error) => {
        console.error('Error fetching users:', error);
        // Handle errors, e.g., set an error state
      });
  }, []);

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
