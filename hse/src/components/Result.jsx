import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import './result.css';

const Result = () => {
  const location = useLocation();
  const { username, rightClicks, mistakes, wrongChoices } = location.state;

  const [isInfoSaved, setInfoSaved] = useState(false);
  const [error, setError] = useState(null);
  const [isUserAdded, setUserAdded] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [isDataSaved, setDataSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/users_data/${username}`);
        setUserData(response.data);
        setIsReturningUser(true);
        setInfoSaved(true);
        setDataSaved(true);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // User not found, save the info
          handleSaveInfo();
        } else {
          setError('خطا در دریافت اطلاعات کاربر. لطفاً دوباره تلاش کنید.');
        }
      }
    };

    fetchData();
  }, [username]);

  const handleSaveInfo = async () => {
    try {
      if (!isDataSaved) {
        const response = await axios.post('http://localhost:5000/users_data', {
          username,
          rightClicks,
          mistakes: wrongChoices,
          played_time: 1,
        });

        setUserData(response.data.user);
        setInfoSaved(true);
        setUserAdded(true);
        setIsReturningUser(false);
        setDataSaved(true);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      setError('خطا در ذخیره اطلاعات کاربر. لطفاً دوباره تلاش کنید.');
    }
  };

  // Check if the user has won the game
  const hasWon = rightClicks === 9;

  return (
    <motion.div className="result-container">
      <h1>نتایج</h1>
      <p className='username'>نام کاربری: {username}</p>

      {isInfoSaved ? (
        <>
          {isReturningUser ? (
            <>
              <p>تعداد کلیک های درست: {userData?.rightClicks}</p>
              <p>تعداد کلیک های اشتباه: {userData?.mistakes}</p>
              {hasWon ? (
                <p className='winner-message'>تبریک! شما برنده شدید!</p>
              ) : (
                <p className='loser-message'>متاسفیم! شما باختید!</p>
              )}
              <p className='error-message'>خوش آمدید، شما قبلا اینجا بوده اید!</p>
              <Link to="/">
                <button className="redirect-home-button">
                  بازگشت به صفحه اصلی
                </button>
              </Link>
            </>
          ) : (
            <>
              <p>تعداد کلیک های درست: {rightClicks}</p>
              <p>تعداد کلیک های اشتباه: {mistakes}</p>
              <p>قلب های از دست رفته: {location.state.losingHearts}</p>
              {hasWon ? (
                <p className='winner-message'>تبریک! شما برنده شدید!</p>
              ) : (
                <p className='loser-message'>متاسفیم! شما باختید!</p>
              )}
              <Link to="/">
                <button className="redirect-home-button">
                  بازگشت به صفحه اصلی
                </button>
              </Link>
            </>
          )}
        </>
      ) : (
        <>
          {error && (
            <p className="error-message">{error}</p>
          )}

          {isUserAdded && !isInfoSaved && (
            <p className="success-message">کاربر با موفقیت به پایگاه داده اضافه شد!</p>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Result;
