import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, createRef } from "react";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import MapboxLanguage from "@mapbox/mapbox-gl-language";

import { uploadMapboxTrack } from "../components/mapboxtrack";

import { CloseButton } from "../components/CloseButton";
import Nav from "../components/nav";
import { MantineProvider, Checkbox  } from '@mantine/core';
import React, { useEffect, useState, useRef } from "react";

import CouncilDist from "./CouncilDistricts.json";

const councildistricts = require("./CouncilDistricts.json");
const citybounds = require("./citybounds.json");
// @ts-ignore: Unreachable code error
import * as turf from "@turf/turf";

// added the following 6 lines.
import mapboxgl from "mapbox-gl";

import { assertDeclareExportAllDeclaration } from "@babel/types";

import { DisclaimerPopup } from "../components/Disclaimer";
import { GeoJsonProperties, MultiPolygon, Polygon } from "geojson";

function isTouchScreen() {
  return window.matchMedia("(hover: none)").matches;
}

var cacheofcdsfromnames: any = {};

function getLang() {
  if (navigator.languages != undefined) return navigator.languages[0];
  return navigator.language;
}

var councilAreas = {
  "1": 3461932.7590381783,
  "2": 1924361.5332737048,
  "3": 982606.7721339666,
  "4": 20033630.537280265,
  "5": 1491713.4892952952,
  "6": 6519090.819275988,
  "7": 8866073.813593412,
  "8": 353877.31328993634,
  "9": 430437.22653758596,
  "10": 384810.68904536765,
  "11": 5663731.197031066,
  "12": 8126625.680731847,
  "13": 1439453.7837515455,
  "14": 1798025.189952638,
  "15": 3174782.823397767,
};

var councilareasdistrict: any = {
  "1": 39172374.513557486,
  "2": 56028687.75752604,
  "3": 91323827.86998883,
  "4": 127051659.05853269,
  "5": 85492955.75895034,
  "6": 70583244.58359845,
  "7": 140330608.52718654,
  "8": 41642747.81303825,
  "9": 33854278.76005373,
  "10": 38455731.29742687,
  "11": 165241605.83628467,
  "12": 149947134.17462063,
  "13": 42095086.21254906,
  "14": 63974277.0096737,
  "15": 83429528.39743595,
};

var councilpopulations: any = {
  "1": 248124,
  "2": 250535,
  "3": 257098,
  "4": 269290,
  "5": 269182,
  "6": 261114,
  "7": 266276,
  "8": 257597,
  "9": 255988,
  "10": 270703,
  "11": 270691,
  "12": 259564,
  "13": 252909,
  "14": 264741,
  "15": 258310,
};

const Home: NextPage = () => {
 

  var councilBounds: any = {
    features: CouncilDist.features,
    type: "FeatureCollection",
  };

  const calculateifboxisvisible = () => {
    if (typeof window != "undefined") {
      return window.innerWidth > 640;
    } else {
      return true;
    }
  };

  const [showtotalarea, setshowtotalarea] = useState(false);
  const [showpop, setshowpop] = useState(false);
  let [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const touchref = useRef<any>(null);
  let [houseClickedData, setHouseClickedData]: any = useState(null);
  let [parkClickedData, setParkClickedData]: any = useState(null);
  let [housingaddyopen, sethousingaddyopen] = useState(false);
  var mapref: any = useRef(null);
  let [filterraceopen, setfilterraceopen] = useState(false);
  const okaydeletepoints: any = useRef(null);
  var [metric, setmetric] = useState(false);
  const [showInitInstructions, setshowInitInstructions] = useState(true);

 const listofracefilters = {
  'A' : 'Other Asian',
  'B' : 'Black',
  'C' : 'Chinese',
  'D' : 'Cambodian',
  'F' : 'Filipino',
  'G' : 'Guamanian',
  'H' : 'Hispanic/Latin/Mexican',
  'I' : 'American Indian/Alaskan Native',
  'J' : 'Japanese',
  'K' : 'Korean',
  'L' : 'Laotian',
  'O' : 'Other',
  'P' : 'Pacific Islander',
  'S' : 'Samoan',
  'U' : 'Hawaiian',
  'V' : 'Vietnamese',
  'W' : 'White',
  'X' : 'Unknown',
  'Z' : 'Asian Indian' 
 }

 const [enabledRaceFilters, setEnabledRaceFilters] = useState(Object.keys(listofracefilters))


  function closeModal() {
    setDisclaimerOpen(false);
  }

  function checkIfRingsNeedToBeCorrected(polygon: any) {
    console.log("checking if rings need to be corrected", polygon);

    var polygontoreturn = polygon;

    if (polygon.geometry.type == "Polygon") {
      if (polygon.geometry.coordinates.length <= 3) {
        polygontoreturn.geometry.coordinates = [
          ...polygon.geometry.coordinates,
          [
            polygon.geometry.coordinates[0][0] + 0.00000001,
            polygon.geometry.coordinates[0][1],
          ],
        ];
      } else {
      }
    } else {
    }

    return polygontoreturn;
  }

  function turfify(polygon: any) {
    var turffedpolygon;

    console.log("polygon on line 100", polygon);

    if (polygon.geometry.type == "Polygon") {
      turffedpolygon = turf.polygon(polygon.geometry.coordinates);
    } else {
      turffedpolygon = turf.multiPolygon(polygon.geometry.coordinates);
    }

    return turffedpolygon;
  }

  function polygonInWhichCd(polygon: any) {
    if (typeof polygon.properties.name === "string") {
      if (cacheofcdsfromnames[polygon.properties.name]) {
        return cacheofcdsfromnames[polygon.properties.name];
      } else {
        var turffedpolygon = turfify(polygon);

        const answerToReturn = councildistricts.features.find(
          (eachItem: any) => {
            //turf sucks for not having type checking, bypasses compile error Property 'booleanIntersects' does not exist on type 'TurfStatic'.
            //yes it works!!!! it's just missing types
            // @ts-ignore: Unreachable code error
            return turf.booleanIntersects(turfify(eachItem), turffedpolygon);
          }
        );

        cacheofcdsfromnames[polygon.properties.name] = answerToReturn;

        return answerToReturn;
      }
    }
  }

  function openModal() {
    setDisclaimerOpen(true);
  }

  var [hasStartedControls, setHasStartedControls] = useState(false);

  function checkHideOrShowTopRightGeocoder() {
    var toprightbox = document.querySelector(".mapboxgl-ctrl-top-right");
    if (toprightbox) {
      var toprightgeocoderbox: any = toprightbox.querySelector(
        ".mapboxgl-ctrl-geocoder"
      );
      if (toprightgeocoderbox) {
        if (typeof window != "undefined") {
          if (window.innerWidth >= 768) {
            console.log("changing to block");
            toprightgeocoderbox.style.display = "block";
          } else {
            toprightgeocoderbox.style.display = "none";
            console.log("hiding");
          }
        } else {
          toprightgeocoderbox.style.display = "none";
        }
      }
    }
  }

  const handleResize = () => {
    checkHideOrShowTopRightGeocoder();
  };

  const divRef: any = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('filter', enabledRaceFilters)
    console.log(mapref.current)

    var filtersystem = JSON.parse(JSON.stringify(
      [
        "match",
        ["get", "Vict Descent"],
        enabledRaceFilters,
        true,
        false
      ]
    ))

    console.log('filtersystem', filtersystem)
    if (mapref.current) {
      mapref.current.setFilter('unhoused-crime-victim-data', filtersystem);
    } else {
      console.log('no map')
      console.log(mapref.current)
    }
  
  }, [enabledRaceFilters])

  useEffect(() => {
    console.log("map div", divRef);

    if (divRef.current) {
      console.log("app render");
    }

    // mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;
    //import locations from './features.geojson'

    mapboxgl.accessToken =
      "pk.eyJ1IjoiY29tcmFkZWt5bGVyIiwiYSI6ImNrdjBkOXNyeDdscnoycHE2cDk4aWJraTIifQ.77Gid9mgpEdLpFszO5n4oQ";

    const formulaForZoom = () => {
      if (typeof window != "undefined") {
        if (window.innerWidth > 700) {
          return 10;
        } else {
          return 9.1;
        }
      }
    };

    const urlParams = new URLSearchParams(
      typeof window != "undefined" ? window.location.search : ""
    );
    const latParam = urlParams.get("lat");
    const lngParam = urlParams.get("lng");
    const zoomParam = urlParams.get("zoom");
    const debugParam = urlParams.get("debug");

    var mapparams: any = {
      container: divRef.current, // container ID
      //affordablehousing2022-dev-copy
      style: "mapbox://styles/comradekyler/clcsa7xi0003214s69kypb5rv", // style URL (THIS IS STREET VIEW)
      //mapbox://styles/comradekyler/cl5c3eukn00al15qxpq4iugtn
      //affordablehousing2022-dev-copy-copy
      //  style: 'mapbox://styles/comradekyler/cl5c3eukn00al15qxpq4iugtn?optimize=true', // style URL
      center: [-118.41, 34], // starting position [lng, lat]
      zoom: formulaForZoom(), // starting zoom
    };

    const map = new mapboxgl.Map(mapparams);
    mapref.current = map;

    var rtldone = false;

    try {
      if (rtldone === false && hasStartedControls === false) {
        setHasStartedControls(true);
        //multilingual support
        //right to left allows arabic rendering
        mapboxgl.setRTLTextPlugin(
          "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.10.1/mapbox-gl-rtl-text.js",
          (callbackinfo: any) => {
            console.log(callbackinfo);
            rtldone = true;
          }
        );
      }

      const language = new MapboxLanguage();
      map.addControl(language);
    } catch (error) {
      console.error(error);
    }

    window.addEventListener("resize", handleResize);



    map.on("load", () => {
      setshowtotalarea(window.innerWidth > 640 ? true : false);

     

      console.log("maps parks source", map.getSource("parks"));

      console.log("maps parks layer", map.getLayer("parks"));

      okaydeletepoints.current = () => {
        try {
          var affordablepoint: any = map.getSource("selected-home-point");
          affordablepoint.setData(null);
        } catch (err) {
          console.error(err);
        }
      };

      const processgeocodereventresult = (eventmapbox: any) => {
        var singlePointSet: any = map.getSource("single-point");

        singlePointSet.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: eventmapbox.result.geometry,
            },
          ],
        });

        console.log("event.result.geometry", eventmapbox.result.geometry);
        console.log("geocoderesult", eventmapbox);
      };

      const processgeocodereventselect = (object: any) => {
        var coord = object.feature.geometry.coordinates;
        var singlePointSet: any = map.getSource("single-point");

        singlePointSet.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: object.feature.geometry,
            },
          ],
        });
      };

      const geocoder: any = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: map,
        proximity: {
          longitude: -118.41,
          latitude: 34,
        },
        marker: true,
      });

      var colormarker = new mapboxgl.Marker({
        color: "#41ffca",
      });

      const geocoderopt: any = {
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: {
          color: "#41ffca",
        },
      };

      const geocoder2 = new MapboxGeocoder(geocoderopt);
      const geocoder3 = new MapboxGeocoder(geocoderopt);

      geocoder.on("result", (event: any) => {
        processgeocodereventresult(event);
      });

      geocoder.on("select", function (object: any) {
        processgeocodereventselect(object);
      });

      var geocoderId = document.getElementById("geocoder");

      if (geocoderId) {
        console.log("geocoder div found");

        if (!document.querySelector(".geocoder input")) {
          geocoderId.appendChild(geocoder3.onAdd(map));

          var inputMobile = document.querySelector(".geocoder input");

          try {
            var loadboi = document.querySelector(
              ".mapboxgl-ctrl-geocoder--icon-loading"
            );
            if (loadboi) {
              var brightspin: any = loadboi.firstChild;
              if (brightspin) {
                brightspin.setAttribute("style", "fill: #e2e8f0");
              }
              var darkspin: any = loadboi.lastChild;
              if (darkspin) {
                darkspin.setAttribute("style", "fill: #94a3b8");
              }
            }
          } catch (err) {
            console.error(err);
          }

          if (inputMobile) {
            inputMobile.addEventListener("focus", () => {
              //make the box below go away
            });
          }
        }

        geocoder2.on("result", (event: any) => {
          processgeocodereventresult(event);
        });

        geocoder2.on("select", function (object: any) {
          processgeocodereventselect(object);
        });

        geocoder3.on("result", (event: any) => {
          processgeocodereventresult(event);
        });

        geocoder3.on("select", function (object: any) {
          processgeocodereventselect(object);
        });
      }

      map.addSource("single-point", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "point",
        source: "single-point",
        type: "circle",
        paint: {
          "circle-radius": 10,
          "circle-color": "#41ffca",
        },
      });

      if (debugParam) {
        map.showTileBoundaries = true;
        map.showCollisionBoxes = true;
        map.showPadding = true;
      }

      if (urlParams.get("terraindebug")) {
        map.showTerrainWireframe = true;
      }

      // Create a popup, but don't add it to the map yet.
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      map.addSource("selected-park-point", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addSource("selected-park-area", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "selected-park-areas",
        source: "selected-park-area",
        type: "line",
        paint: {
          "line-color": "#7dd3fc",
          "line-width": 5,
          "line-blur": 0,
        },
      });

      map.addLayer({
        id: "selected-park-areasfill",
        source: "selected-park-area",
        type: "fill",
        paint: {
          "fill-color": "#7dd3fc",
          "fill-opacity": 0.2,
        },
      });

      map.loadImage("/map-marker.png", (error, image: any) => {
        if (error) throw error;

        // Add the image to the map style.
        map.addImage("map-marker", image);

        map.addLayer({
          id: "points-park",
          type: "symbol",
          source: "selected-park-point",
          paint: {
            "icon-color": "#f0abfc",
            "icon-translate": [0, -13],
          },
          layout: {
            "icon-image": "map-marker",
            // get the title name from the source's "title" property
            "text-allow-overlap": true,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "text-ignore-placement": true,

            "icon-size": 0.4,
            "icon-text-fit": "both",
          },
        });
      });

    

    

      if (
        !document.querySelector(
          ".mapboxgl-ctrl-top-right > .mapboxgl-ctrl-geocoder"
        )
      ) {
        map.addControl(geocoder2);
      }

      checkHideOrShowTopRightGeocoder();

      if (true) {
        map.addLayer({
          id: "citybound",
          type: "line",
          source: {
            type: "geojson",
            data: citybounds,
          },
          paint: {
            "line-color": "#dddddd",
            "line-opacity": 1,
            "line-width": 3,
          },
        });

        map.addLayer({
          id: "cityboundfill",
          type: "fill",
          source: {
            type: "geojson",
            data: citybounds,
          },
          paint: {
            "fill-color": "#dddddd",
            "fill-opacity": 0.02,
          },
        });
      }

      if (hasStartedControls === false) {
        // Add zoom and rotation controls to the map.
        map.addControl(new mapboxgl.NavigationControl());

        // Add geolocate control to the map.
        map.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
            },
            // When active the map will receive updates to the device's location as it changes.
            trackUserLocation: true,
            // Draw an arrow next to the location dot to indicate which direction the device is heading.
            showUserHeading: true,
          })
        );
      }

      checkHideOrShowTopRightGeocoder();
    });

    var getmapboxlogo: any = document.querySelector(".mapboxgl-ctrl-logo");

    if (getmapboxlogo) {
      getmapboxlogo.remove();
    }

    var mapname = "parks";
  }, []);

  return (
    <div className="flex flex-col h-full w-screen absolute">
      <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
      <Head>
        <link
          rel="icon"
          href="https://mejiaforcontroller.com/wp-content/uploads/2020/12/cropped-favicon-1-32x32.png"
          sizes="32x32"
        />
        <link
          rel="icon"
          href="https://mejiaforcontroller.com/wp-content/uploads/2020/12/cropped-favicon-1-192x192.png"
          sizes="192x192"
        />
        <link
          rel="apple-touch-icon"
          href="https://mejiaforcontroller.com/wp-content/uploads/2020/12/cropped-favicon-1-180x180.png"
        />
        <meta
          name="msapplication-TileImage"
          content="https://mejiaforcontroller.com/wp-content/uploads/2020/12/cropped-favicon-1-270x270.png"
        />

        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <title>311 Unhoused Request Statistics | Map</title>
        <meta property="og:type" content="website" />
        <meta name="twitter:site" content="@lacontroller" />
        <meta name="twitter:creator" content="@lacontroller" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          key="twittertitle"
          content="Unhoused Crime Victims Statistics"
        ></meta>
        <meta
          name="twitter:description"
          key="twitterdesc"
          content="311 Unhoused Request Statistics. View which areas our unhoused community are victims of crime."
        ></meta>
        <meta
          name="twitter:image"
          key="twitterimg"
          content="https://unhousedvictims.lacontroller.io"
        ></meta>
        <meta
          name="description"
          content="Unhoused Crime Victims Statistics. View which areas our unhoused community are victims of crime."
        />

        <meta
          property="og:url"
          content="https://unhousedvictims.lacontroller.io/"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Unhoused Crime Victims | Map and Statistics"
        />
        <meta
          property="og:description"
          content="Unhoused Crime Victims Statistics. View which areas our unhoused community are victims of crime."
        />
        <meta
          property="og:image"
          content="https://unhousedvictims.lacontroller.io"
        />
      </Head>

      <div className="flex-none">
        <Nav />
      </div>

      <div className="flex-initial h-content flex-col flex z-50">
        <div className="absolute mt-[3.1em] md:mt-[3.8em] md:ml-3 top-0 max-h-screen flex-col flex z-5">
          <div
            className="titleBox  ml-2 text-base bold md:semi-bold break-words bg-[#212121]"
            style={{
              backgroundColor: "#212121",
              color: "#ffffff",
            }}
          >
            <strong className="">Unhoused Crime Victims Statistics</strong>
          </div>

          <div
            className={`geocoder mt-0 ml-2 left-1 md:hidden xs:text-sm sm:text-base md:text-lg`}
            id="geocoder"
          ></div>



          <div className="w-content"></div>

          <div
            className={`text-sm ${
              housingaddyopen
                ? `px-3 pt-2 pb-3 fixed sm:relative 

 top-auto bottom-0 left-0 right-0
  w-full sm:static sm:mt-2 sm:w-auto 
  sm:top-auto sm:bottom-auto sm:left-auto 
  sm:right-auto bg-gray-900 sm:rounded-xl 
   bg-opacity-80 sm:bg-opacity-80 text-white 
   border-t-2  sm:border border-teal-500 sm:border-grey-500
  
   
   `
                : "hidden"
            }`}
          ></div>
        </div>
      </div>

      <div ref={divRef} style={{}} className="map-container w-full h-full " />

      {(typeof window !== "undefined" ? window.innerWidth >= 640 : false) && (
        <>
          <div
            className={`absolute md:mx-auto z-9 bottom-2 left-1 md:left-1/2 md:transform md:-translate-x-1/2`}
          >
            <a
              href="https://controller.lacontroller.gov/"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://lacontroller.io/images/KennethMejia-logo-white-elect.png"
                className="h-9 md:h-10 z-40"
                alt="Kenneth Mejia LA City Controller Logo"
              />
            </a>
          </div>
        </>
      )}
        </MantineProvider>
    </div>
  );
};

export default Home;
