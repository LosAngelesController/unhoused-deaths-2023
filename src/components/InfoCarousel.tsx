import React, { useState } from "react";
import classes from "./InfoCarousel.module.css";
interface CarouselProps {
  evictionData: any[];
  infoBoxLength: number;
  setInfoBoxLength: any;
  evictionInfo: number;
  setEvictionInfo: any;
}

export function InfoCarousel(props: CarouselProps) {
  const dataLength = props.evictionData.length;

  const handleNext = () => {
    props.setEvictionInfo((prev: any) =>
      prev === dataLength - 1 ? 0 : prev + 1
    );
    props.setInfoBoxLength((prev: any) => (prev === dataLength ? 1 : prev + 1));
  };

  const handlePrev = () => {
    props.setEvictionInfo((prev: any) =>
      prev === 0 ? dataLength - 1 : prev - 1
    );
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
              <b className="text-stone-400">Council District:</b>{" "}
              {props.evictionData[props.evictionInfo]?.cd} <br />
              <b className="text-stone-400">Council File No:</b>{" "}
              {props.evictionData[props.evictionInfo]?.councilFileNo} <br />
              <b className="text-stone-400">Title:</b>{" "}
              {props.evictionData[props.evictionInfo]?.title} <br />
              <b className="text-stone-400">Date Introduced:</b>{" "}
              {props.evictionData[props.evictionInfo]?.dateIntroduced} <br />
              <b className="text-stone-400">Last Change Date:</b>{" "}
              {props.evictionData[props.evictionInfo]?.lastChangeDate} <br />
              <b className="text-stone-400">Location Description:</b>{" "}
              {props.evictionData[props.evictionInfo]?.locationDescription} <br />
              <b className="text-stone-400">Mover/Seconder/Initiated By:</b>{" "}
              {props.evictionData[props.evictionInfo]?.mover} <br />
              <b className="text-stone-400">Start:</b>{" "}
              {props.evictionData[props.evictionInfo]?.start} <br />
              {/* <b className="text-stone-400">Current Monthly Rent:</b>{" "}
              {props.evictionData[props.evictionInfo]?.monthlyRent} <br /> */}
              <b className="text-stone-400">End:</b>{" "}
              {props.evictionData[props.evictionInfo]?.end} <br />
              <b className="text-stone-400">Time Limit:</b>{" "}
              {props.evictionData[props.evictionInfo]?.timeLimit} <br />
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
