import React, {useState} from 'react';
import {FaArrowAltCircleLeft, FaArrowAltCircleRight} from "react-icons/fa";

interface CarouselProps {
 arrestData: any[];
}
   
export function InfoCarousel(props: CarouselProps) {
  const [arrestInfo, setArrestInfo] = useState(0);
  const dataLength = props.arrestData.length;

  const handleNext = () => {
    setArrestInfo((prev) => (prev + 1) % dataLength);
    console.log(arrestInfo)
  }

  const handlePrev = () => {
    setArrestInfo((prev) => (prev + dataLength - 1) % dataLength);
  }

  return (
    <div className="carousel">
      <div className="info-container">
        {props.arrestData.map((data, index) => (
          <>
            <div className={`info ${arrestInfo === index ? "active" : ""}`}>
          <p className="pr-4">
            <b>Address</b> {data.arrest?.address}

          </p>
          </div>
          </>
        ))}
      </div>
      <div className="controls">
        <FaArrowAltCircleLeft onClick={handlePrev} />
        <FaArrowAltCircleRight onClick={handleNext} />
      </div>
    </div>
  );
};

