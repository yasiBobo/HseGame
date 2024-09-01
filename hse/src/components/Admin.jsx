import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [confirmationUser, setConfirmationUser] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [editUsernameInput, setEditUsernameInput] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    personal_code: '',
  });


  useEffect(() => {
    fetchUsersData();
  }, []);

  const fetchUsersData = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/user_data');
      const uniqueUsers = [];
      const encounteredUsernames = new Set();

      response.data.forEach((user) => {
        if (!encounteredUsernames.has(user.username)) {
          encounteredUsernames.add(user.username);
          uniqueUsers.push(user);
        } else {
          const existingUser = uniqueUsers.find((u) => u.username === user.username);
          if (existingUser && user.id < existingUser.id) {
            const index = uniqueUsers.indexOf(existingUser);
            uniqueUsers[index] = user;
          }
        }
      });

      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Error fetching users data:', error);
    }
  };

  const handleDeleteUser = (username) => {
    setConfirmationUser(username);
    setShowConfirmation(true);
  };

  const confirmDeleteUser = async () => {
    try {
      const response = await axios.delete(`http://localhost:3002/api/user_data/${encodeURIComponent(confirmationUser)}`);
      console.log(response.data.message);

      fetchUsersData();
      setConfirmationUser(null);

      setShowSuccessNotification(true);
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setShowConfirmation(false);
    }
  };

  const handleChange = (e) => {
    if (showEditModal) {
      // If in edit mode, update the new username only
      setNewUser((prevUser) => ({
        ...prevUser,
        username: e.target.value,
      }));
    } else {
      // If in add mode, update the entire newUser state
      setNewUser({
        ...newUser,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await axios.post('http://localhost:3002/api/users', {
        username: newUser.username,
        personal_code: newUser.personal_code,
        login_time: new Date().toISOString(),
      });

      console.log(response.data.message);

      fetchUsersData();

      // Reset the newUser state with empty values
      setNewUser({
        username: '',
        personal_code: '',
      });

      setShowSuccessNotification(true);
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } catch (error) {
      console.error('Error adding user:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received');
      } else {
        console.error('Error message:', error.message);
      }

      setShowSuccessNotification(false);
    }
  };

  const handleEditUser = (username) => {
    setNewUser({
      username: '', // Clear the add user username when editing
      personal_code: '', // Clear other fields as needed
    });
    setEditUsernameInput(username);
    setShowEditModal(true);
  };

  const confirmEditUser = async () => {
    try {
      const userToUpdate = users.find((user) => user.username === editUsernameInput);

      if (userToUpdate) {
        const userId = userToUpdate.id;

        const response = await axios.put(
          `http://localhost:3002/api/user_data/${userId}`,
          {
            newUsername: newUser.username,
            // Exclude personal_code from the request body
          }
        );

        console.log('Response:', response.data);

        if (response.status === 200) {
          fetchUsersData();
          setEditUsernameInput('');

          // Reset the newUser state without affecting personal_code
          setNewUser({
            username: '',
            personal_code: '',
          });

          setShowSuccessNotification(true);
          setTimeout(() => {
            setShowSuccessNotification(false);
          }, 5000);
        } else {
          console.error('Error updating user:', response.data.error);
        }
      } else {
        console.error('User not found for editing:', editUsernameInput);
      }
    } catch (error) {
      console.error('Error editing username:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
    } finally {
      setShowEditModal(false);
    }
  };


  return (
    <div className="admin">
      <h1>Admin Panel</h1>

      <table className="user-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Mistakes</th>
            <th>Right Clicks</th>
            <th>Played Time</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={user.rightClicks === 9 ? 'won' : 'lost'}>
              <td>{user.username}</td>
              <td>{user.mistakes}</td>
              <td>{user.rightClicks}</td>
              <td>{user.played_time}</td>
              <td className={user.rightClicks === 9 ? 'won-status' : 'lost-status'}>
                {user.rightClicks === 9 ? 'Won' : 'Lost'}
              </td>
              <td>
                <button onClick={() => handleEditUser(user.username)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDeleteUser(user.username)} className="delete-btn">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="add-user-form">
        <h2>Add User</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddUser();
          }}
        >
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={showEditModal ? '' : newUser.username}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Personal Code:
            <input type="text" name="personal_code" value={newUser.personal_code} onChange={handleChange} required />
          </label>
          <button type="submit">Add User</button>
        </form>
      </div>

      {showConfirmation && (
        <div className="confirmation-box">
          <p>Are you sure you want to delete the user {confirmationUser}?</p>
          <button onClick={confirmDeleteUser} className="confirm-btn">
            Yes
          </button>
          <button onClick={() => setShowConfirmation(false)} className="cancel-btn">
            No
          </button>
        </div>
      )}

      {showEditModal && (
        <div className="edit-user-modal">
          <p>Enter new username for {editUsernameInput}:</p>
          <input
            type="text"
            value={newUser.username}
            onChange={(e) => setNewUser((prevUser) => ({ ...prevUser, username: e.target.value }))}
          />
          <button onClick={() => confirmEditUser()} className="confirm-btn">
            Confirm
          </button>
          <button onClick={() => setShowEditModal(false)} className="cancel-btn">
            Cancel
          </button>
        </div>
      )}

      {showSuccessNotification && <div className="success-notification">User operation successful!</div>}
    </div>
  );
};

export default Admin;
