import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Carousel = ({ 
  children, 
  slidesPerView = 1, 
  spaceBetween = 20, 
  autoplay = false, 
  navigation = true, 
  pagination = true,
  breakpoints = {},
  className = "",
  ...props 
}) => {
  const modules = [Navigation, Pagination];
  if (autoplay) modules.push(Autoplay);

  return (
    <div className={`carousel-container relative ${className}`}>
      <style jsx>{`
        .carousel-container .swiper-button-next,
        .carousel-container .swiper-button-prev {
          color: #f59e0b;
          font-weight: bold;
          background: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }
        
        .carousel-container .swiper-button-next:hover,
        .carousel-container .swiper-button-prev:hover {
          background: #f59e0b;
          color: white;
          transform: scale(1.1);
        }
        
        .carousel-container .swiper-button-next::after,
        .carousel-container .swiper-button-prev::after {
          font-size: 16px;
          font-weight: bold;
        }
        
        /* Mobile adjustments */
        @media (max-width: 768px) {
          .carousel-container .swiper-button-next,
          .carousel-container .swiper-button-prev {
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
          }
          
          .carousel-container .swiper-button-prev {
            left: 10px;
          }
          
          .carousel-container .swiper-button-next {
            right: 10px;
          }
        }
        
        /* Desktop adjustments */
        @media (min-width: 769px) {
          .carousel-container .swiper-button-prev {
            left: -20px;
          }
          
          .carousel-container .swiper-button-next {
            right: -20px;
          }
        }
        
        .carousel-container .swiper-pagination-bullet {
          background: #f59e0b;
          opacity: 0.5;
        }
        
        .carousel-container .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
      
      <Swiper
        modules={modules}
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetween}
        navigation={navigation}
        pagination={pagination ? { clickable: true } : false}
        autoplay={autoplay ? { delay: 5000, disableOnInteraction: false } : false}
        breakpoints={breakpoints}
        className="w-full"
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <SwiperSlide key={index}>
            {child}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;

