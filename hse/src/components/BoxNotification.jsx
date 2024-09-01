// BoxNotification.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './boxNotification.css';

const BoxNotification = ({ question, correctChoice, incorrectChoice, onChoice }) => {
  const handleChoice = (isCorrect) => {
    // Notify the parent component about the choice
    onChoice && onChoice(isCorrect);
  };

  return (
    <>
      <div className="boxNotificationLayer"></div>
      <div className='boxNotification' style={{ zIndex: 2 }}>
        <div className="boxNotificationHeader">
          {question}
        </div>
        <div className="boxNotificationChoice" onClick={() => handleChoice(false)}>
          {incorrectChoice}
        </div>
        <div className="boxNotificationChoice" onClick={() => handleChoice(true)}>
          {correctChoice}
        </div>
      </div>
    </>
  );
};

BoxNotification.propTypes = {
  question: PropTypes.string.isRequired,
  correctChoice: PropTypes.string.isRequired,
  incorrectChoice: PropTypes.string.isRequired,
  onChoice: PropTypes.func.isRequired,
};

export default BoxNotification;
