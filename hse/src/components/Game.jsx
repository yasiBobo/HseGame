import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BoxNotification from './BoxNotification';
import HeaderBgBig from '../assets/headerBgBig.svg';
import HeaderBgSmall from '../assets/navBg.svg';
import GameBg from '../assets/game-bg.svg';
import GameBgSmall from '../assets/gameBg.svg';
import Heart from '../assets/heart.svg';
import CircleBox1 from "../assets/circle.svg";
import './game.css';

const Game = ({ loginUsername }) => {
  const [number, setNumber] = useState(0);
  const [hearts, setHearts] = useState(6);
  const [gameOver, setGameOver] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [interactedNotifications, setInteractedNotifications] = useState(0);
  const [showAppreciationMessage, setShowAppreciationMessage] = useState(false);
  const [randomAppreciationMessage, setRandomAppreciationMessage] = useState('');
  const [chosenOptions, setChosenOptions] = useState([]);
  const [clickedBoxes, setClickedBoxes] = useState([]);
  const [warningMessage, setWarningMessage] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const [correctClicks, setCorrectClicks] = useState(0);
  const [wrongChoices, setWrongChoices] = useState(0);

  const appreciationMessages = [
    'عالی! کارت فوق‌العاده بود!',
    'واقعاً عالیه! ادامه بده!',
    'شگفت‌آور! تو همیشه برتری را نشان می‌دهی!',
    'واه، عالی بود! همینطور ادامه بده!',
    'فوق‌العاده! بهت افتخار می‌کنم!',
    'واااو! تو واقعاً شگفت‌آوری!',
  ];

  const warningMessages = [
    'این باکس را قبلاً انتخاب کردی!',
    'وای! دوباره؟! اینجا رو کلیک کردی!',
    'اوه! این باکس را قبلاً انتخاب کردی دیگه!',
    'دوباره؟ ای بابا برو سراغ جاهای جدید!',
    'وووی! بازم تو همین باکس تکراری رو انتخاب کردی!',
  ];

  const navigate = useNavigate();

  const notifications = [
    { id: 1, question: 'چی رعایت نشده؟', correctChoice: 'تجهیزات حفاظ فردی نداره', incorrectChoice: 'آجر رو گرفته سمت صورتش' },
    { id: 2, question: 'چی رعایت نشده؟', incorrectChoice: 'تخته کار مهار نشده', correctChoice: 'تخته کار کوتاهه' },
    { id: 3, question: 'چی رعایت نشده؟', correctChoice: 'مسیرخروجی لیفتراک مسدود نشده', incorrectChoice: 'راننده لیفتراک کمربند نبسته' },
    { id: 4, question: 'چی رعایت نشده؟', incorrectChoice: 'رو به بیل گرفته', correctChoice: 'دستکش کار ندارهه' },
    { id: 5, question: 'چی رعایت نشده؟', incorrectChoice: 'تعداد بلوک ها کمه', correctChoice: 'چیدن بلوک زیر تخته کار' },
    { id: 6, question: 'چی رعایت نشده؟', correctChoice: 'خوردن و آشامیدن در محل کار', incorrectChoice: 'پوشیدن کاور' },
    { id: 7, question: 'چی رعایت نشده؟', correctChoice: 'مته روی زمین رها شده', incorrectChoice: 'مته به برق نیست' },
    { id: 8, question: 'چی رعایت نشده؟', incorrectChoice: 'Correct choice for box 2', correctChoice: 'Incorrect choice for box 2' },
    { id: 9, question: 'چی رعایت نشده؟', correctChoice: 'کپسول اطفای حریق زیر تخته کاره', incorrectChoice: 'کپسول اطفای حریق سرجاش نیست' },
  ];

  const handleWarningMessage = () => {
    const randomIndex = Math.floor(Math.random() * warningMessages.length);
    const selectedWarningMessage = warningMessages[randomIndex];
    setWarningMessage(selectedWarningMessage);
    setTimeout(() => {
      setWarningMessage('');
    }, 5000);
  };

  const handleBigBoxClick = (boxId) => {
    if (!gameOver) {
      const bigBox = document.querySelector(`.boxesBigBox${boxId}`);
      if (!bigBox.classList.contains(`boxesBigBox${boxId}active`)) {
        if (clickedBoxes.includes(boxId)) {
          handleWarningMessage("قبلا کلیک شده!");
        } else {
          bigBox.classList.add(`boxesBigBox${boxId}active`);
          const selectedNotification = notifications.find((notification) => notification.id === boxId);
          setCurrentNotification(selectedNotification);
          setShowNotification(true);
          setInteractedNotifications((prev) => prev + 1);
          setClickedBoxes((prevClickedBoxes) => [...prevClickedBoxes, boxId]);
        }
      } else {
        handleWarningMessage("قبلا کلیک شده!");
      }
    }
  };

  const handleBoxClick = (boxId) => {
    if (!gameOver) {
      if (!clickedBoxes.includes(boxId)) {
        setClickedBoxes((prevClickedBoxes) => [...prevClickedBoxes, boxId]);
        const box = document.getElementById(`box${boxId}`);
        box.classList.add(`box${boxId}active`);
        const selectedNotification = notifications.find((notification) => notification.id === boxId);
        setCurrentNotification(selectedNotification);
        setShowNotification(true);
        setInteractedNotifications((prev) => prev + 1);
      } else {
        handleWarningMessage("قبلا کلیک شده!");
      }
    }
  };

  const handleNotificationChoice = (isCorrect) => {
    if (isCorrect) {
      setNumber((prevNumber) => prevNumber + 1);
      setCorrectClicks((prevCorrectClicks) => prevCorrectClicks + 1);

      if (correctClicks % 2 !== 0) {
        setShowAppreciationMessage(true);
        const randomIndex = Math.floor(Math.random() * appreciationMessages.length);
        setRandomAppreciationMessage(appreciationMessages[randomIndex]);
        setTimeout(() => {
          setShowAppreciationMessage(false);
        }, 4000);
      }
    } else {
      setHearts((prevHearts) => prevHearts - 1);
      setMistakes((prevMistakes) => prevMistakes + 1);
      setWrongChoices((prevWrongChoices) => prevWrongChoices + 1);
    }

    setShowNotification(false);
    setCurrentNotification(null);
    setChosenOptions([...chosenOptions, isCorrect]);
  };

  const handleGameContentClick = (e) => {
    if (!gameOver) {
      const isBoxClick =
        e.target &&
        (e.target.classList.contains('box') ||
          e.target.classList.contains('boxesBigBox') ||
          e.target.closest('.box') ||
          e.target.closest('.boxesBigBox'));

      if (!isBoxClick) {
        setMistakes((prevMistakes) => prevMistakes + 1);

        if (hearts > 0) {
          setHearts((prevHearts) => prevHearts - 1);
        }
      }
    }
  };

  const resetGame = () => {
    console.log('Game reset!');
    setNumber(0);
    setHearts(6);
    setGameOver(false);
    setShowNotification(false);
    setCurrentNotification(null);
    setMistakes(0);
    setCorrectClicks(0);

    document.querySelectorAll('.box').forEach((box) => box.classList.remove('boxactive'));
    document.querySelectorAll('.boxesBigBox').forEach((bigBox) => bigBox.classList.remove('boxesBigBoxactive'));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/users_data/${loginUsername}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [loginUsername]);

  useEffect(() => {
    if (correctClicks % 2 !== 0) {
      setShowAppreciationMessage(true);
      const randomIndex = Math.floor(Math.random() * appreciationMessages.length);
      setRandomAppreciationMessage(appreciationMessages[randomIndex]);
      setTimeout(() => {
        setShowAppreciationMessage(false);
      }, 4000);
    }

    if (chosenOptions.length === 9 || hearts === 0) {
      endGame();
    }
  }, [correctClicks, chosenOptions, hearts]);

  const saveGameData = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/users_data/${loginUsername}`, {
        number,
        mistakes,
        correctClicks,
        wrongChoices
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Game data saved successfully');
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  };

  const endGame = () => {
    console.log('Game ended!');
    setGameOver(true);
    saveGameData();
    setTimeout(() => {
      navigate('/result', {
        state: {
          username: loginUsername,
          mistakes,
          rightClicks: correctClicks,
          wrongChoices,
          losingHearts: 6 - hearts,
        },
      });
    }, 5000);
  };

  return (
    <div className='game'>
      <div className='gameHeader'>
        <div className='headerBg'>
          <img src={HeaderBgBig} alt='' />
        </div>

        <div className='headerBgSmall'>
          <img src={HeaderBgSmall} alt='' />
        </div>

        <div className='headerContentGame'>
          <div className='hearts'>
            {[...Array(6)].map((_, index) => (
              <div key={index} className={`heart ${index < hearts ? 'active' : 'inactive'}`}>
                <img src={Heart} alt='' />
              </div>
            ))}
          </div>
          <div className='texts'>
            <span className='number'>{number}</span>
            <span className='text'>تشخیص درست</span>
          </div>
        </div>
      </div>

      <div className='gameContent' onClick={handleGameContentClick}>
        <div className='gameBg'>
          <img src={GameBg} alt='game' />
          <div className="boxesBig">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((boxId) => (
              <div key={boxId} className={`boxesBigBox boxesBigBox${boxId}`} onClick={() => handleBigBoxClick(boxId)}>
                <img src={CircleBox1} alt="" />
              </div>
            ))}
          </div>
        </div>

        <div className='gameBgSmall'>
          <img className='bgSmallImg' src={GameBgSmall} alt='gameBg' />

          <div className="boxsContainer">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((boxId) => (
              <div key={boxId} id={`box${boxId}`} className={`box box${boxId}`}>
                <span onClick={() => handleBoxClick(boxId)}>
                  <img className={`box${boxId}img`} src={CircleBox1} alt="" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="gameFooter">
        <Link to={"/"} className="gameBtn">
          پایان بازی
        </Link>
      </div>

      {gameOver && <div className={`popupLayer ${gameOver ? 'active' : ''}`}></div>}
      {gameOver && (
        <div className="popup active">
          <div className="popupHeader">
            <p>بازی به اتمام رسید!</p>
          </div>
          <div className="popupText">
            <p>برای دیدن نتایج،</p>
            <p>لطفا صبر کنید تا به صفحه بعد منتقل شوید.</p>
          </div>
        </div>
      )}

      {showNotification && currentNotification && (
        <BoxNotification
          question={currentNotification.question}
          correctChoice={currentNotification.correctChoice}
          incorrectChoice={currentNotification.incorrectChoice}
          onChoice={handleNotificationChoice}
        />
      )}

      {showAppreciationMessage && (
        <div className="appreciation-message">
          <p style={{ color: 'white' }}>{randomAppreciationMessage}</p>
        </div>
      )}

      {warningMessage && (
        <div className="warning-message">
          <p style={{ color: 'white' }}>{warningMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Game;