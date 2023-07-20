import React, { useState } from "react";
import classes from "./InfoCarousel.module.css";
interface CarouselProps {
  evictionData: any[];
  infoBoxLength: number;
  setInfoBoxLength: any;
  ellisInfo: number;
  setEllisInfo: any;
}

export function InfoCarousel(props: CarouselProps) {
  const dataLength = props.evictionData.length;

  const handleNext = () => {
    props.setEllisInfo((prev: any) => (prev === dataLength - 1 ? 0 : prev + 1));
    props.setInfoBoxLength((prev: any) => (prev === dataLength ? 1 : prev + 1));
  };

  const handlePrev = () => {
    props.setEllisInfo((prev: any) => (prev === 0 ? dataLength - 1 : prev - 1));
    props.setInfoBoxLength((prev: any) => (prev === 1 ? dataLength : prev - 1));
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
              <b className="text-stone-400">APN:</b>{" "}
              {props.evictionData[props.ellisInfo]?.apn} <br />
              <b className="text-stone-400">Application Received:</b>{" "}
              {props.evictionData[props.ellisInfo]?.applicationReceived} <br />
              <b className="text-stone-400">Application Year:</b>{" "}
              {props.evictionData[props.ellisInfo]?.year} <br />
              <b className="text-stone-400">Council District:</b>{" "}
              {props.evictionData[props.ellisInfo]?.cd} <br />
              <b className="text-stone-400">Address:</b>{" "}
              {props.evictionData[props.ellisInfo]?.address} <br />
              <b className="text-stone-400">City:</b>{" "}
              {props.evictionData[props.ellisInfo]?.city} <br />
              <b className="text-stone-400">Zip:</b>{" "}
              {props.evictionData[props.ellisInfo]?.zip} <br />
              <b className="text-stone-400">Units Withdrawn:</b>{" "}
              {props.evictionData[props.ellisInfo]?.unitsWithdrawn} <br />
              <b className="text-stone-400">Replacement Unit:</b>{" "}
              {props.evictionData[props.ellisInfo]?.sex} <br />
            </p>
          </div>
          <div className="mt-3">
            <span>
              {props.infoBoxLength} of {dataLength}
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