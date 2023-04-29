import React, { useState } from "react";
import classes from "./InfoCarousel.module.css";
interface CarouselProps {
  arrestData: any[];
}

export function InfoCarousel(props: CarouselProps) {
  const [arrestInfo, setArrestInfo] = useState(0);
  const [infoBoxLength, setInfoBoxLength] = useState(1);
  const dataLength = props.arrestData.length;

  const handleNext = () => {
    setArrestInfo((prev) => (prev === 0 ? dataLength - 1 : prev - 1));
    setInfoBoxLength((prev) => (prev === dataLength ? 1 : prev + 1));
    console.log(arrestInfo);
  };

  const handlePrev = () => {
    setArrestInfo((prev) => (prev === dataLength - 1 ? 0 : prev + 1));
    setInfoBoxLength((prev) => (prev === 1 ? dataLength : prev - 1));
    console.log(arrestInfo);
  };

  return (
    <div className={classes.carousel}>
      <div className={classes.arrow} onClick={handlePrev}>
        &#8249;
      </div>
      <div className={classes.content}>
        <>
          <div>
            <p className="pr-4">
              <b className="text-teal-200">Area:</b>{" "}
              {props.arrestData[arrestInfo]?.area} <br />
              <b className="text-blue-400">Report ID:</b>{" "}
              {props.arrestData[arrestInfo]?.reportId} <br />
              <b className="text-sky-400">Arrest Date:</b>{" "}
              {props.arrestData[arrestInfo]?.arrestDate} <br />
              <b className="text-teal-400">Address:</b>{" "}
              {props.arrestData[arrestInfo]?.address} <br />
              <b className="text-indigo-300">Cross Street:</b>{" "}
              {props.arrestData[arrestInfo]?.crossStreet} <br />
              <b className="text-emerald-200">Age:</b>{" "}
              {props.arrestData[arrestInfo]?.age} <br />
              <b className="text-lime-300">Sex:</b>{" "}
              {props.arrestData[arrestInfo]?.sex} <br />
              <b className="text-amber-400">Race:</b>{" "}
              {props.arrestData[arrestInfo]?.race} <br />
              <b className="text-teal-200">Arrest Type:</b>{" "}
              {props.arrestData[arrestInfo]?.type} <br />
              <b className="text-blue-200">Charge:</b>{" "}
              {props.arrestData[arrestInfo]?.charge} <br />
              <b className="text-pink-200">Charge Description:</b>{" "}
              {props.arrestData[arrestInfo]?.description} <br />
              <b className="text-pink-400">Disposition:</b>{" "}
              {props.arrestData[arrestInfo]?.disposition} <br />
            </p>
          </div>
          <div className="mt-3">
            <span>
              {infoBoxLength} of {dataLength}
            </span>
          </div>
        </>
      </div>
      <div className={classes.arrow} onClick={handleNext}>
        &#8250;
      </div>
    </div>
  );
}
