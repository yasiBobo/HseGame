
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { motion } from 'framer-motion';
// import LogoImg from "./assets/images/ZarinLogo.svg";
// import UserImg from "./assets/images/UserImg.svg";
import { useNavigate } from 'react-router-dom';
import "./login.scss";

// STYLES
const LoginSection = styled.section`
  width: 100%;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4em;
`;

const LogoContainer = styled(motion.div)`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background-color: #F3F3F3;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ResendButton = styled.button`
  color: red;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: underline;
`;

const TimerText = styled.p`
  color: #717171;
  font-size: 1rem;
`;

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [personalCode, setPersonalCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // Manage login vs verification step
  const [message, setMessage] = useState('');
  const [resendCount, setResendCount] = useState(0); // Count for resends
  const [timer, setTimer] = useState(0); // Timer for resend button
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendMessage('لطفا دوباره کد را دریافت و وارد کنید');
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    if (resendCount >= 5) {
      setResendMessage('شما حداکثر تلاش را انجام داده‌اید.');
    }
  }, [resendCount]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phoneNumber || !personalCode) {
      setMessage('لطفا شماره تلفن و کد پرسنلی را وارد کنید');
      setTimeout(() => {
        setMessage('');
      }, 8000);
      return;
    }

    try {
      const response = await axios.post('https://api.zarrinmehr.zarrinroya.com/login', {
        phoneNumber,
        personalCode,
      });

      // Assuming the response contains a user ID
      const userId = response.data.userId;
      console.log(response.data);
      localStorage.setItem('userId', userId); // Store user ID in localStorage

      // Move to the verification step
      setStep(2);
      setResendCount(0); // Reset resend count
      setTimer(120); // Start the timer for 2 minutes
      setResendMessage(''); // Clear any previous resend message

    } catch (error) {
      if (error.response && error.response.status === 401) {
        setMessage('شماره تلفن یا کد پرسنلی اشتباه است');
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'An unknown error occurred';
        setMessage(errorMessage);
      }
      setTimeout(() => {
        setMessage('');
      }, 8000);
    }
  };



  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      // setMessage('لطفا کد تایید را وارد کنید');
      setTimeout(() => {
        setMessage('');
      }, 8000);
      return;
    }
    try {
      const response = await axios.post('https://api.zarrinmehr.zarrinroya.com/verify', {
        phoneNumber,
        verificationCode,
      });
      if (response.data.success) {
        const { token, user } = response.data;
        navigate('/game', { state: { token, user } });
      } else {
        setMessage('کد تایید نامعتبر است');
        setTimeout(() => {
          setMessage('');
        }, 8000);
      }
    } catch (error) {
      setMessage(`${error.response ? error.response.data.error : error.message}`);
      setTimeout(() => {
        setMessage('');
      }, 6000);
    }
  };

  const handleResend = async () => {
    if (resendCount < 5) {
      try {
        await axios.post('https://api.zarrinmehr.zarrinroya.com/login', {
          phoneNumber,
          personalCode, // Ensure personalCode is sent if necessary
        });
        setTimeout(() => {
          setResendMessage('کد تایید دوباره ارسال شد');

          // Clear the message after another 5 seconds
          setTimeout(() => {
            setResendMessage('');
          }, 5000);
        }, 8000);
        setResendCount(prevCount => prevCount + 1); // Increment resend count
        setTimer(120); // Reset the timer for 2 minutes
      } catch (error) {
        setMessage(`Error: ${error.response ? error.response.data.error : error.message}`);
        setTimeout(() => {
          setMessage('');
        }, 8000);
      }
    }
  };

  return (
    <div className='app-container login'>
      <LoginSection>
        {/* <img src={LogoImg} alt="Logo Image" className="loginLogo" /> */}

        <LogoContainer
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 2, type: "spring", stiffness: 100 }}
        >
          {/* <img src={UserImg} alt="User Img" className='userLogo' /> */}

        </LogoContainer>

        {step === 1 ? (
          <motion.form
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 3, type: "spring", stiffness: 100 }}
            className='login-form'
            onSubmit={handleLogin}
          >
            <div>
              <input
                type="text"
                value={phoneNumber}
                className="loginFormInput"
                placeholder='شماره تلفن'
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <input
                type="text"
                className="loginFormInput"
                placeholder='کد پرسنلی'
                value={personalCode}
                onChange={(e) => setPersonalCode(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className='loginButton'
            >
              ورود
            </button>
          </motion.form>
        ) : (
          <form
            className='login-form'
            onSubmit={handleVerify}
          >
            <div>
              <input
                type="text"
                className="loginFormInput"
                placeholder='کد تایید را وارد کنید!'
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
            <button
              className='loginButton'
              type="submit">
              شروع بازی
            </button>
            {timer > 0 ? (
              <TimerText>زمان باقی‌مانده: {timer} ثانیه</TimerText>
            ) : (
              resendCount < 5 && (
                <button className='resendButton resendLoginCode' onClick={handleResend}>
                  ارسال مجدد کد
                </button>
              )
            )}
            {resendMessage && <p>{resendMessage}</p>}
          </form>

        )}
        {/* <p className="resendLoginCode" style={{ color: 'red', fontWeight: 600, fontSize: '14px' }}>
          لطفا تحریم شکن خود را خاموش کنید
        </p> */}
        {message && <p className='resendButton resendLoginCode'>{message}</p>}
      </LoginSection>
    </div>
  );
};

export default Login;