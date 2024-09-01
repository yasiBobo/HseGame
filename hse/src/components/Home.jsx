// Home.jsx

import React from 'react';
import Cards from './Cards';
import HeaderImg from '../assets/headerImage.svg';
import './home.css';

const Home = ({ loginUsername }) => {
  return (
    <div>
      <header className="header">
        <div className="headerContent">
          <h4 className="contentTitle">
            {loginUsername && `${loginUsername} عزیز`}
            <br />
            خیلی وقت بود منتظرت بودیم
          </h4>
          <h5 className="contentText">
            حالا که اینجایی، قوانین رو بخون تا بتونی بازی روشروع کنی
          </h5>
        </div>
        <div className="headerImage">
          <img src={HeaderImg} alt="headerImage" />
        </div>
      </header>
      <div className="cardContainer">
        <Cards />
      </div>
    </div>
  );
};

export default Home;
