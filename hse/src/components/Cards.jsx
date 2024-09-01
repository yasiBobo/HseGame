// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-cards';

// import required modules
import { EffectCards } from 'swiper/modules';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Blue from "../assets/blue.svg"
import Red from "../assets/red.svg"
import Yellow from "../assets/yellow.svg"
import Hearts from "../assets/hearts.svg"
import Safety from "../assets/safety.svg"
import Click from "../assets/click.svg"
import "./cards.css"

const Cards = () => {
  
  return (
    <div className="cards">
      <h4 className="cardsTitle">
        قوانین بازی
      </h4>
      <div className="cardsContent">
        <Swiper
          effect={'cards'}
          grabCursor={true}
          modules={[EffectCards]}
          className="mySwiper"
        >
          {/* Swiper slides */}
          <SwiperSlide>
            <div className="swiperContent">
              <div className="bgTop">
                <img src={Safety} alt="safety" />
              </div>
              <div className="swiperTitle">
                در این بازی شما باید خطاهای ایمنی
                <br />
                موجود در تصویر را تشخیص دهید
              </div>
              <div className="bgBottom">
                <img src={Yellow} alt="" />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="swiperContent">
              <div className="bgTop">
                <img src={Click} alt="safety" />
              </div>
              <div className="swiperTitle">
                اگر خطای ایمنی را درست تشخیص دهید؛
                <br />
                دایره سبز نمایش داده می‌شود
              </div>
              <div className="bgBottom">
                <img src={Blue} alt="" />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="swiperContent">
              <div className="bgTop">
                <img src={Hearts} alt="safety" />
              </div>
              <div className="swiperTitle">
                مراقب باشید! هر تشخیص
                <br />
                اشتباه از جون شما کم می‌کند.
              </div>
              <div className="bgBottom">
                <img src={Red} alt="" />
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      {/* Link to navigate to the '/game' route */}
      <Link to="/game" className="cardsBtn">
        شروع
      </Link>
    </div>
  );
};

export default Cards;