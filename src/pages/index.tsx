import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, createRef } from "react";
import Slider from "rc-slider";

import { CloseButton } from "../components/CloseButton";
import { signintrack, uploadMapboxTrack } from "../components/mapboxtrack";
import TooltipSlider, { handleRender } from "../components/TooltipSlider";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import Nav from "../components/nav";
//import { CloseButton } from "@/components/CloseButton";
import { MantineProvider, Checkbox } from "@mantine/core";
import React, { useEffect, useState, useRef } from "react";
import { initializeApp } from "firebase/app";

import Icon from "@mdi/react";
import { mdiPlay } from "@mdi/js";
import { mdiPause, mdiSkipNext, mdiSkipPrevious } from "@mdi/js";

import CouncilDist from "./CouncilDistricts.json";
import { auth, signInWithGoogle, signOutOfApp } from "./../components/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const councildistricts = require("./CouncilDistricts.json");
const citybounds = require("./citybounds.json");
// @ts-ignore: Unreachable code error
import * as turf from "@turf/turf";
import { datadogRum } from "@datadog/browser-rum";

// added the following 6 lines.
import mapboxgl from "mapbox-gl";

import { assertDeclareExportAllDeclaration } from "@babel/types";

import { GeoJsonProperties, MultiPolygon, Polygon } from "geojson";

function isTouchScreen() {
  return window.matchMedia("(hover: none)").matches;
}

var cacheofcdsfromnames: any = {};

function getLang() {
  if (navigator.languages != undefined) return navigator.languages[0];
  return navigator.language;
}

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

const councilcount: any = {
  "13": 6380,
  "11": 5350,
  "5": 5102,
  "2": 5063,
  "3": 4338,
  "6": 4050,
  "10": 3961,
  "14": 3920,
  "1": 3905,
  "9": 3892,
  "12": 3243,
  "4": 2942,
  "7": 2689,
  "8": 2332,
  "15": 1681,
};

const createdbycount: any = {
  BOE: 1,
  BSS: 73,
  "Council's Office": 2142,
  ITA: 2978,
  LASAN: 5518,
  "Proactive Insert": 3,
  "Self Service": 46007,
  "Self Service_SAN": 1509,
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

  const calculateIntensityCoefficient = () => {
    const monthdomain = sliderMonth[1] - sliderMonth[0];

    if (monthdomain === 0) {
      return 12;
    } else {
      const coefficient = 12 / monthdomain;

      return coefficient;
    }
  };

  const listofcreatedbyoptions = [
    "Self Service",
    "LASAN",
    "Council's Office",
    "Self Service_SAN",
    "ITA",
    "BSS",
    "Proactive Insert",
    "BOE",
  ];

  const listofcouncildists = Array.from({ length: 15 }, (_, i) => i + 1).map(
    (eachItem) => String(eachItem)
  );

  const [createdby, setcreatedby] = useState<string[]>(listofcreatedbyoptions);
  const [filteredcouncildistricts, setfilteredcouncildistricts] =
    useState<string[]>(listofcouncildists);

  const shouldfilteropeninit =
    typeof window != "undefined" ? window.innerWidth >= 640 : false;

  const [showtotalarea, setshowtotalarea] = useState(false);
  let [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const touchref = useRef<any>(null);
  const isLoggedInRef = useRef(false);
  let [housingaddyopen, sethousingaddyopen] = useState(false);
  var mapref: any = useRef(null);
  const okaydeletepoints: any = useRef(null);
  var [metric, setmetric] = useState(false);
  const [showInitInstructions, setshowInitInstructions] = useState(true);
  const [doneloadingmap, setdoneloadingmap] = useState(false);
  const [sliderMonth, setsliderMonthAct] = useState<any>([1, 12]);
  const [selectedfilteropened, setselectedfilteropened] = useState("createdby");
  const [datasetloaded, setdatasetloaded] = useState(false);
  const refismaploaded = useRef(false);
  const [filterpanelopened, setfilterpanelopened] =
    useState(shouldfilteropeninit);

  const [mapboxloaded, setmapboxloaded] = useState(false);

  const [shelterselected, setshelterselected] = useState<any>(null);

  const [user, loading, error] = useAuthState(auth);

  const datadogconfig: any = {
    applicationId: "54ed9846-68b0-4811-a47a-7330cf1828a0",
    clientToken: "pub428d48e3143310cf6a9dd00003773f12",
    site: "datadoghq.com",
    service: "beds",
    env: "prod",
    // Specify a version number to identify the deployed version of your application in Datadog
    // version: '1.0.0',

    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: "allow",
  };

  datadogRum.init(datadogconfig);

  datadogRum.startSessionReplayRecording();

  const setsliderMonth = (event: Event, newValue: number | number[]) => {
    setsliderMonthAct(newValue as number[]);
  };

  const setsliderMonthVerTwo = (input: any) => {
    console.log(input);
    setsliderMonthAct(input);
  };

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

  function convertDataFromBackend(data: any) {
    /*
        var featuresarray = data.rows.map((eachRow:any) => {
          return {
            "type": "Feature",
      "properties": {
        ...eachRow
      },
      "geometry": {
        "coordinates": [
          eachRow.lng,
         eachRow.lat
        ],
        "type": "Point"
          }

        }*/

    var objectbylocation: any = {};

    data.rows.forEach((eachRow: any) => {
      const uniq = `${eachRow.lat}` + `${eachRow.lng}`;

      if (objectbylocation[uniq] === undefined) {
        objectbylocation[uniq] = {};
      }

      if (eachRow.total_beds === null) {
        eachRow.total_beds = 0;
      }

      if (eachRow.beds_available === null) {
        eachRow.beds_available = 0;
      }

      if (objectbylocation[uniq].total_beds === undefined) {
        objectbylocation[uniq].total_beds = eachRow.total_beds;
      } else {
        objectbylocation[uniq].total_beds += eachRow.total_beds;
      }

      if (objectbylocation[uniq].beds_available === undefined) {
        objectbylocation[uniq].beds_available = eachRow.beds_available;
      } else {
        objectbylocation[uniq].beds_available += eachRow.beds_available;
      }

      objectbylocation[uniq].occper =
        1 -
        objectbylocation[uniq].beds_available /
          objectbylocation[uniq].total_beds;

      objectbylocation[uniq].organization_name = eachRow.organization_name;
      objectbylocation[uniq].lat = eachRow.lat;
      objectbylocation[uniq].lng = eachRow.lng;
      objectbylocation[uniq].address = eachRow.address;

      if (objectbylocation[uniq].shelterarray === undefined) {
        objectbylocation[uniq].shelterarray = [];
      }
      objectbylocation[uniq].shelterarray.push(eachRow);
    });

    console.log(objectbylocation);

    const featuresarray = Object.values(objectbylocation).map(
      (eachLocation: any) => {
        return {
          type: "Feature",
          properties: {
            ...eachLocation,
          },
          geometry: {
            coordinates: [eachLocation.lng, eachLocation.lat],
            type: "Point",
          },
        };
      }
    );

    console.log(featuresarray);

    const geojsonsdflsf: any = {
      type: "FeatureCollection",
      features: featuresarray,
    };

    return geojsonsdflsf;
  }

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
      style: "mapbox://styles/comradekyler/cld95p0s6004001qibmrpbjgd", // style URL (THIS IS STREET VIEW)
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
      setdoneloadingmap(true);
      setshowtotalarea(window.innerWidth > 640 ? true : false);

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

      fetch("https://backend-beds-tracker-q73wor3ixa-uw.a.run.app/shelters")
        .then((response) => response.json())
        .then((data) => {
          console.log(data);

          const geojsonsdflsf = convertDataFromBackend(data);

          map.addSource("sheltersv2", {
            type: "geojson",
            data: geojsonsdflsf,
          });

          setInterval(() => {
            fetch(
              "https://backend-beds-tracker-q73wor3ixa-uw.a.run.app/shelters"
            )
              .then((response) => response.json())
              .then((data) => {
                console.log(data);

                const geojsonrefresh = convertDataFromBackend(data);

                const sheltersource:any = map.getSource("sheltersv2");

                if (sheltersource) {
                  sheltersource.setData(geojsonrefresh);
                }
              });
          }, 2000);

          map.addLayer({
            id: "shelterslayer",
            type: "circle",
            source: "sheltersv2",
            paint: {
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                10,
                ["*", 1.2, ["ln", ["get", "total_beds"]]],
                22,
                ["*", 5, ["ln", ["get", "total_beds"]]],
              ],
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "occper"],
                0,
                "#34d399",
                0.7,
                "#4ade80",
                0.8,
                "#facc15",
                0.9,
                "#f59e0b",
                0.99,
                "#f97316",
                1,
                "#ff0000",
              ],
              "circle-stroke-opacity": 0.9,
              "circle-opacity": 0.9,
              "circle-stroke-width": 2,
              "circle-stroke-color": "hsl(0, 12%, 13%)",
            },
          });

          setdatasetloaded(true);

          map.on("mousedown", "shelterslayer", (e: any) => {
            setshelterselected(e.features[0]);

            var affordablepoint: any = map.getSource("selected-shelter-point");
            affordablepoint.setData(e.features[0].geometry);

            mapref.current.setLayoutProperty(
              "points-selected-shelter-layer",
              "visibility",
              "visible"
            );
          });

          map.on("mouseleave", "shelterslayer", () => {
            //check if the url query string "stopmouseleave" is true
            //if it is, then don't do anything
            //if it is not, then do the following
            /*
        map.getCanvas().style.cursor = '';
        popup.remove();*/

            if (urlParams.get("stopmouseleave") === null) {
              map.getCanvas().style.cursor = "";
              popup.remove();
            }
          });

          map.on("mouseenter", "shelterslayer", (e: any) => {
            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = "pointer";

            var arrayOfSheltersText: any = [];

            console.log("properties", e.features[0].properties);

            console.log(JSON.parse(e.features[0].properties.shelterarray));

            JSON.parse(e.features[0].properties.shelterarray).forEach(
              (eachShelter: any) => {
                arrayOfSheltersText.push(`
          <div class="rounded-sm bg-slate-700 bg-opacity-70 px-1 py-1">
          <strong>${eachShelter.projectname}</strong><br/>
          ${eachShelter.type ? `Type: ${eachShelter.type}<br/>` : ""}
          ${
            eachShelter.criteria ? `Criteria: ${eachShelter.criteria}<br/>` : ""
          }
          ${eachShelter.total_beds} beds<br/>
          ${eachShelter.beds_available} beds available<br/>
          ${
            eachShelter.male_available
              ? `  ${eachShelter.male_available} male beds available<br/>`
              : ""
          }
          
          ${
            eachShelter.female_available
              ? `  ${eachShelter.female_available} female beds available<br/>`
              : ""
          }
        
          </div>
            `);
              }
            );

            var collateshelters = arrayOfSheltersText.join("");

            // Copy coordinates array.
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = `
          ${e.features[0].properties.organization_name}<br/>
          ${e.features[0].properties.address}<br/>
          <div className='flexcollate'
          style="
    display: flex;
    flex-direction: column;
    row-gap: 0.3rem;
"
          >${collateshelters}</div>
          <p>Click dot for more info</p>
          <style>
          .mapboxgl-popup-content {
            background: #212121ee;
            color: #fdfdfd;
          }

          .flexcollate {
            row-gap: 0.5rem;
            display: flex;
            flex-direction: column;
          }
          </style>
          `;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Populate the popup and set its coordinates
            // based on the feature found.
            popup.setLngLat(coordinates).setHTML(description).addTo(map);
          });
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

      if (true) {
        map.addLayer(
          {
            id: "point",
            source: "single-point",
            type: "circle",
            paint: {
              "circle-radius": 10,
              "circle-color": "#41ffca",
            },
          },
          "road-label"
        );
      }

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

      map.addSource("selected-shelter-point", {
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

      if (false) {
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
      }

      map.loadImage("/map-marker.png", (error, image: any) => {
        if (error) throw error;

        // Add the image to the map style.
        map.addImage("map-marker", image);

        if (true) {
          map.addLayer({
            id: "points-selected-shelter-layer",
            type: "symbol",
            source: "selected-shelter-point",
            paint: {
              "icon-color": "#41ffca",
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
        }
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
        map.addLayer(
          {
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
          },
          "road-label"
        );

        map.addSource("citycouncildist", {
          type: "geojson",
          data: councildistricts,
        });

        map.addLayer(
          {
            id: "councildistrictslayer",
            type: "line",
            source: "citycouncildist",
            paint: {
              "line-color": "#bbbbbb",
              "line-opacity": 1,
              "line-width": 1,
            },
          },
          "road-label"
        );
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

      var mapname = "beds";

      map.on("dragstart", (e) => {
        uploadMapboxTrack({
          mapname,
          eventtype: "dragstart",
          globallng: map.getCenter().lng,
          globallat: map.getCenter().lat,
          globalzoom: map.getZoom(),
        });
      });

      map.on("dragend", (e) => {
        uploadMapboxTrack({
          mapname,
          eventtype: "dragend",
          globallng: map.getCenter().lng,
          globallat: map.getCenter().lat,
          globalzoom: map.getZoom(),
        });
      });

      map.on("zoomstart", (e) => {
        uploadMapboxTrack({
          mapname,
          eventtype: "dragstart",
          globallng: map.getCenter().lng,
          globallat: map.getCenter().lat,
          globalzoom: map.getZoom(),
        });
      });

      map.on("zoomend", (e) => {
        uploadMapboxTrack({
          mapname,
          eventtype: "zoomend",
          globallng: map.getCenter().lng,
          globallat: map.getCenter().lat,
          globalzoom: map.getZoom(),
        });
      });

      //end of load
    });

    var getmapboxlogo: any = document.querySelector(".mapboxgl-ctrl-logo");

    if (getmapboxlogo) {
      getmapboxlogo.remove();
    }
  }, []);

  return (
    <div className="flex flex-col h-full w-screen absolute">
      <MantineProvider
        theme={{ colorScheme: "dark" }}
        withGlobalStyles
        withNormalizeCSS
      >
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
          <title>Shelter Beds Occupancy | Map</title>
          <meta property="og:type" content="website" />
          <meta name="twitter:site" content="@lacontroller" />
          <meta name="twitter:creator" content="@lacontroller" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            key="twittertitle"
            content="Shelter Beds Occupancy | Map"
          ></meta>
          <meta
            name="twitter:description"
            key="twitterdesc"
            content="Criteria, Capacity and Occupancy of Los Angeles Homeless Shelters."
          ></meta>
          <meta
            name="twitter:image"
            key="twitterimg"
            content="https://shelterbeds.lacontroller.io/shelter-thumbnail-min.png"
          ></meta>
          <meta
            name="description"
            content="Criteria, Capacity and Occupancy of Los Angeles Homeless Shelters."
          />

          <meta
            property="og:url"
            content="https://shelterbeds.lacontroller.io/"
          />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Shelter Beds Occupancy | Map" />
          <meta
            property="og:description"
            content="Criteria, Capacity and Occupancy of Los Angeles Homeless Shelters."
          />
          <meta
            property="og:image"
            content="https://shelterbeds.lacontroller.io/shelter-thumbnail-min.png"
          />
        </Head>

        <div className="flex-none">
          <Nav />
        </div>

        <div className="flex-initial h-content flex-col flex z-50">
          <div className="   max-h-screen flex-col flex z-5">
            <div
              className="absolute mt-[3.1em] md:mt-[3.8em] md:ml-3 top-0 z-5 titleBox  ml-2 text-base bold md:semi-bold break-words bg-[#212121]"
              style={{
                backgroundColor: "#212121",
                color: "#ffffff",
              }}
            >
              <strong className="">Shelter Beds Occupancy</strong>
            </div>

            <div
              className={`geocoder absolute mt-[2.7em] md:mt-[4.1em] ml-1 left-1 md:hidden xs:text-sm sm:text-base md:text-lg`}
              id="geocoder"
            ></div>
            <div className="w-content"></div>

            <div
              className={`text-sm ${
                shelterselected != null
                  ? `px-3 pt-2 pb-3 fixed 

 top-auto bottom-0 left-0 right-0
  w-full sm:max-w-sm sm:absolute sm:mt-[7em] md:mt-[4.5em] sm:ml-3 
  sm:top-auto sm:bottom-auto sm:left-auto 
  sm:right-auto bg-gray-900 sm:rounded-xl 
   bg-opacity-80 sm:bg-opacity-80 text-white 
   border-t-2  sm:border border-teal-500 sm:border-grey-500
   
   `
                  : "hidden"
              }`}
            >
              <CloseButton
                onClose={() => {
                  setshelterselected(null);

                  if (mapref.current) {
                    var affordablepoint: any = mapref.current.getSource(
                      "selected-shelter-point"
                    );
                    if (affordablepoint) {
                      affordablepoint.setData(null);

                      mapref.current.setLayoutProperty(
                        "points-selected-shelter-layer",
                        "visibility",
                        "none"
                      );
                    }
                  } else {
                    console.log("no ref current");
                  }
                }}
              />
              {shelterselected != null && (
                <div className="text-xs">
                  <p className="font-bold">
                    {shelterselected.properties.organization_name}
                  </p>
                  <p>{shelterselected.properties.address}</p>
                  <div className="flex flex-row gap-x-2 my-1">
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full px-2 pb-1 pt-0.5 text-white bg-blue-500"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${shelterselected.properties["address"]} Los Angeles, CA`
                      )}`}
                    >
                      View on Google Maps
                    </a>
                    <p className="bg-gray-800 px-1 py-2 rounded-sm">
                      CD {shelterselected.properties.cd}
                    </p>
                    <p className="bg-gray-800 px-1 py-2 rounded-sm">
                      SPA {shelterselected.properties.spa}
                    </p>
                  </div>
                  <div className="flex flex-col gap-y-2 ">
                    {JSON.parse(shelterselected.properties.shelterarray).map(
                      (eachShelter: any, index: number) => (
                        <div
                          key={index}
                          className="rounded-sm bg-slate-700 bg-opacity-90 px-1 py-1"
                        >
                          <span className="font-bold">
                            {eachShelter.projectname}
                          </span>
                          <br />
                          {eachShelter.type ? (
                            <>
                              Type: {eachShelter.type}
                              <br />
                            </>
                          ) : (
                            ""
                          )}
                          {eachShelter.criteria ? (
                            <>
                              Criteria: {eachShelter.criteria}
                              <br />
                            </>
                          ) : (
                            ""
                          )}
                          {eachShelter.total_beds} beds
                          <br />
                          {eachShelter.beds_available} beds available
                          <br />
                          {eachShelter.male_available ? (
                            <>
                              {eachShelter.male_available} male beds available
                              <br />
                            </>
                          ) : (
                            ""
                          )}
                          {eachShelter.female_available ? (
                            <>
                              {eachShelter.female_available} female beds
                              available
                              <br />
                            </>
                          ) : (
                            ""
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
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
                  src="https://controller.lacity.gov/images/KennethMejia-logo-white-elect.png"
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
