import React, { useState } from "react";
import classes from "./InfoCarousel.module.css";
interface CarouselProps {
  arrestData: any[];
  infoBoxLength: number;
  setInfoBoxLength: any;
  arrestInfo: number;
  setArrestInfo: any;
}

export function InfoCarousel(props: CarouselProps) {
  const dataLength = props.arrestData.length;

  const handleNext = () => {
    props.setArrestInfo((prev: any) =>
      prev === dataLength - 1 ? 0 : prev + 1
    );
    props.setInfoBoxLength((prev: any) => (prev === dataLength ? 1 : prev + 1));
  };

  const handlePrev = () => {
    props.setArrestInfo((prev: any) =>
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
              <b className="text-stone-400">Area:</b>{" "}
              {props.arrestData[props.arrestInfo]?.area} <br />
              <b className="text-stone-400">CD#:</b>{" "}
              {props.arrestData[props.arrestInfo]?.cd} <br />
              <b className="text-stone-400">Report ID:</b>{" "}
              {props.arrestData[props.arrestInfo]?.reportId} <br />
              <b className="text-stone-400">Arrest Date:</b>{" "}
              {props.arrestData[props.arrestInfo]?.arrestDate} <br />
              <b className="text-stone-400">Time Range:</b>{" "}
              {props.arrestData[props.arrestInfo]?.timeRange} <br />
              <b className="text-stone-400">Address:</b>{" "}
              {props.arrestData[props.arrestInfo]?.address} <br />
              <b className="text-stone-400">Cross Street:</b>{" "}
              {props.arrestData[props.arrestInfo]?.crossStreet} <br />
              <b className="text-stone-400">Age:</b>{" "}
              {props.arrestData[props.arrestInfo]?.age} <br />
              <b className="text-stone-400">Sex:</b>{" "}
              {props.arrestData[props.arrestInfo]?.sex} <br />
              <b className="text-stone-400">Race:</b>{" "}
              {props.arrestData[props.arrestInfo]?.race} <br />
              <b className="text-stone-400">Arrest Type:</b>{" "}
              {props.arrestData[props.arrestInfo]?.type} <br />
              <b className="text-stone-400">Charge:</b>{" "}
              {props.arrestData[props.arrestInfo]?.charge} <br />
              <b className="text-stone-400">Charge Description:</b>{" "}
              {props.arrestData[props.arrestInfo]?.description} <br />
              <b className="text-stone-400">Disposition:</b>{" "}
              {props.arrestData[props.arrestInfo]?.disposition} <br />
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
