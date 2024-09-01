// UserDataInsert.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDataInsert = ({ loginUsername, correctClicks, mistakes }) => {
  const [playedTime, setPlayedTime] = useState(null);

  useEffect(() => {
    // Function to calculate played time (you can replace it with your actual logic)
    const calculatePlayedTime = () => {
      // Replace this with your actual logic to calculate played time
      // For example, you can record the start time when the game starts and the end time when the game ends
      const startTime = new Date(); // Replace this with the actual start time
      const endTime = new Date(); // Replace this with the actual end time

      const timeDiff = endTime - startTime;
      const seconds = Math.floor(timeDiff / 1000);

      setPlayedTime(seconds);
    };

    calculatePlayedTime();
  }, []);

  useEffect(() => {
    // Insert user data into the 'user_data' table
    const insertUserData = async () => {
      try {
        const response = await axios.post('http://localhost:3004/api/users_data', {
          username: loginUsername,
          rightClicks: correctClicks,
          mistakes,
          played_time: playedTime,
        });

        console.log('User data inserted successfully:', response.data);
      } catch (error) {
        console.error('Error inserting user data:', error);
      }
    };

    // Call the function to insert user data
    if (playedTime !== null) {
      insertUserData();
    }
  }, [loginUsername, correctClicks, mistakes, playedTime]);

  return (
    <div>
      {/* You can add any UI elements here if needed */}
    </div>
  );
};

export default UserDataInsert;
