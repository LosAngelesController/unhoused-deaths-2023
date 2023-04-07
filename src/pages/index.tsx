import type { NextPage } from "next";
import Head from "next/head";
import { titleCase } from "title-case";
import { computeclosestcoordsfromevent } from "../components/getclosestcoordsfromevent";
import { CloseButton } from "../components/CloseButton";
import { SelectButtons } from "@/components/SelectButtons";
import { MapTitle } from "@/components/MapTitle";
import { FilterButton } from "@/components/FilterButton";
import { signintrack, uploadMapboxTrack } from "../components/mapboxtrack";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import Nav from "../components/nav";
import { MantineProvider, Checkbox } from "@mantine/core";
import React, { useEffect, useState, useRef } from "react";
import CouncilDist from "./CouncilDistricts.json";
const councildistricts = require("./CouncilDistricts.json");
const citybounds = require("./citybounds.json");
// @ts-ignore: Unreachable code error
import * as turf from "@turf/turf";
import { datadogRum } from "@datadog/browser-rum";
import mapboxgl from "mapbox-gl";

// function isTouchScreen() {
//   return window.matchMedia("(hover: none)").matches;
// }

// var cacheofcdsfromnames: any = {};

function getLang() {
  if (navigator.languages != undefined) return navigator.languages[0];
  return navigator.language;
}

// var councilareasdistrict: any = {
//   "1": 39172374.513557486,
//   "2": 56028687.75752604,
//   "3": 91323827.86998883,
//   "4": 127051659.05853269,
//   "5": 85492955.75895034,
//   "6": 70583244.58359845,
//   "7": 140330608.52718654,
//   "8": 41642747.81303825,
//   "9": 33854278.76005373,
//   "10": 38455731.29742687,
//   "11": 165241605.83628467,
//   "12": 149947134.17462063,
//   "13": 42095086.21254906,
//   "14": 63974277.0096737,
//   "15": 83429528.39743595,
// };

const filterableYears: any = {
  2018: 39845,
  2019: 49590,
  2020: 12207,
  2021: 41847,
  2022: 31711,
  2023: 2088,
};

const filterableYearsKeys = Object.keys(filterableYears);

const filterableAreas: any = {
  Harbor: 29805,
  "West Los Angeles": 3543,
  Central: 6488,
  "South Valley": 58835,
  "North Valley": 41744,
  "South Los Angeles": 22981,
  "East Los Angeles": 13588,
};

const filterableAreasKeys = Object.keys(filterableAreas);

const filterableCases: any = {
  FRP: 489,
  GENERAL: 30767,
  CITATIONS: 2276,
  PACE: 140179,
  BILLBOARDS: 27,
  VEIP: 788,
  SIGNS: 822,
  XXX: 1,
  CNAP: 932,
  NAR: 1007,
};

const filterableCasesKeys = Object.keys(filterableCases);

const Home: NextPage = () => {
  // var councilBounds: any = {
  //   features: CouncilDist.features,
  //   type: "FeatureCollection",
  // };

  // const listofcouncildists = Array.from({ length: 15 }, (_, i) => i + 1).map(
  //   (eachItem) => String(eachItem)
  // );

  const shouldfilteropeninit =
    typeof window != "undefined" ? window.innerWidth >= 640 : false;
  const [showtotalarea, setshowtotalarea] = useState(false);
  var mapref: any = useRef(null);
  const okaydeletepoints: any = useRef(null);
  const [doneloadingmap, setdoneloadingmap] = useState(false);
  const [selectedfilteropened, setselectedfilteropened] = useState("year");
  const [filteredYears, setFilteredYears] = useState<number[]>(
    filterableYearsKeys.map((key) => Number(key))
  );
  const [filteredAreas, setFilteredAreas] =
    useState<string[]>(filterableAreasKeys);

  const [filteredCases, setFilteredCases] =
    useState<string[]>(filterableCasesKeys);

  const [filterpanelopened, setfilterpanelopened] =
    useState(shouldfilteropeninit);

  //template name, this is used to submit to the map analytics software what the current state of the map is.
  var mapname = "building-safety";

  const setFilteredYearPre = (input: string[]) => {
    console.log("inputvalidator", input);
    if (input.length === 0) {
      setFilteredYears([99999]);
    } else {
      setFilteredYears(input.map((x) => Number(x)));
    }
  };

  const setFilteredAreaPre = (input: string[]) => {
    console.log("inputvalidator", input);
    if (input.length === 0) {
      setFilteredAreas(["99999"]);
    } else {
      setFilteredAreas(input);
    }
  };

  const setFilteredCasesPre = (input: string[]) => {
    console.log("inputvalidator", input);
    if (input.length === 0) {
      setFilteredCases(["99999"]);
    } else {
      setFilteredCases(input);
    }
  };

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

  // function turfify(polygon: any) {
  //   var turffedpolygon;
  //   if (polygon.geometry.type == "Polygon") {
  //     turffedpolygon = turf.polygon(polygon.geometry.coordinates);
  //   } else {
  //     turffedpolygon = turf.multiPolygon(polygon.geometry.coordinates);
  //   }
  //   return turffedpolygon;
  // }

  // function polygonInWhichCd(polygon: any) {
  //   if (typeof polygon.properties.name === "string") {
  //     if (cacheofcdsfromnames[polygon.properties.name]) {
  //       return cacheofcdsfromnames[polygon.properties.name];
  //     } else {
  //       var turffedpolygon = turfify(polygon);

  //       const answerToReturn = councildistricts.features.find(
  //         (eachItem: any) => {
  //           //turf sucks for not having type checking, bypasses compile error Property 'booleanIntersects' does not exist on type 'TurfStatic'.
  //           //yes it works!!!! it's just missing types
  //           // @ts-ignore: Unreachable code error
  //           return turf.booleanIntersects(turfify(eachItem), turffedpolygon);
  //         }
  //       );

  //       cacheofcdsfromnames[polygon.properties.name] = answerToReturn;

  //       return answerToReturn;
  //     }
  //   }
  // }

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
    console.log("map div", divRef);

    if (divRef.current) {
      console.log("app render");
    }

    mapboxgl.accessToken =
      "pk.eyJ1Ijoia2VubmV0aG1lamlhIiwiYSI6ImNsZG1oYnpxNDA2aTQzb2tkYXU2ZWc1b3UifQ.PxO_XgMo13klJ3mQw1QxlQ";

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
      style: "mapbox://styles/kennethmejia/clg3x9ahb000001mzegwualfn", // style URL (THIS IS STREET VIEW)
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
        map.addLayer({
          id: "point",
          source: "single-point",
          type: "circle",
          paint: {
            "circle-radius": 10,
            "circle-color": "#41ffca",
          },
        });
      }

      if (debugParam) {
        map.showTileBoundaries = true;
        map.showCollisionBoxes = true;
        map.showPadding = true;
      }

      if (urlParams.get("terraindebug")) {
        map.showTerrainWireframe = true;
      }

      //create mousedown trigger
      map.on("mousedown", "building-safety", (e) => {
        console.log("mousedown", e, e.features);
        if (e.features) {
          const closestcoords = computeclosestcoordsfromevent(e);

          const filteredfeatures = e.features.filter((feature: any) => {
            return (
              feature.geometry.coordinates[0] === closestcoords[0] &&
              feature.geometry.coordinates[1] === closestcoords[1]
            );
          });

          if (filteredfeatures.length > 0) {
            console.log("filtered features", filteredfeatures);
          }
        }
      });

      // Create a popup, but don't add it to the map yet.
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      map.on("mouseover", "building-safety", (e: any) => {
        console.log("mouseover", e.features);

        if (e.features) {
          map.getCanvas().style.cursor = "pointer";
          const closestcoords: any = computeclosestcoordsfromevent(e);

          const filteredfeatures = e.features.filter((feature: any) => {
            return (
              feature.geometry.coordinates[0] === closestcoords[0] &&
              feature.geometry.coordinates[1] === closestcoords[1]
            );
          });

          // Copy coordinates array.
          const coordinates = closestcoords.slice();

          /*Ensure that if the map is zoomed out such that multiple
          copies of the feature are visible, the popup appears
          over the copy being pointed to.*/
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          if (filteredfeatures.length > 0) {
            if (filteredfeatures[0]) {
              if (filteredfeatures[0].properties) {
                if (
                  filteredfeatures[0].properties["Area Planning Commission"]
                ) {
                  const areaPC =
                    filteredfeatures[0].properties["Area Planning Commission"];
                  console.log("filteredfeatures", filteredfeatures);

                  const allthelineitems = filteredfeatures.map(
                    (eachCase: any) => {
                      if (eachCase.properties?.["Case #"]) {
                        return `<li class="leading-none  my-1">Case #${
                          eachCase.properties["Case #"]
                        }
                  ${
                    eachCase.properties?.["Case Type"] &&
                    eachCase.properties["Case Type"] != "UNKNOWN"
                      ? `<span class="text-teal-200">Type: ${eachCase.properties["Case Type"]}</span>`
                      : ""
                  }
                  <br/>
                  ${
                    eachCase.properties?.["Date Case Created"] &&
                    eachCase.properties["Date Case Created"] != "UNKNOWN"
                      ? `<span class="text-sky-400">Created: ${eachCase.properties["Date Case Created"]}</span>`
                      : ""
                  }${" "}
                  ${
                    eachCase.properties?.["Date Case Closed"] &&
                    eachCase.properties["Date Case Closed"] != "UNKNOWN"
                      ? `<span class="text-blue-200">Closed: ${eachCase.properties["Date Case Closed"]}</span>`
                      : ""
                  }${" "}
                  ${
                    eachCase.properties["CSR #"]
                      ? `<br/><span class="text-pink-200">CSR #${eachCase.properties["CSR #"]}</span>`
                      : ""
                  }${" "}${
                          eachCase.properties["CSR Problem Description"]
                            ? `<span class="text-pink-400">${eachCase.properties[
                                "CSR Problem Description"
                              ].toLowerCase()}</span>`
                            : ""
                        }
                  </li>`;
                      }
                    }
                  );

                  popup
                    .setLngLat(coordinates)
                    .setHTML(
                      ` <div>
                <p class="font-semibold">${titleCase(areaPC.toLowerCase())}</p>
                <p>${filteredfeatures.length} Case${
                        filteredfeatures.length > 1 ? "s" : ""
                      }</p>

                <ul class='list-disc leading-none'>${
                  allthelineitems.length <= 7
                    ? allthelineitems.join("")
                    : allthelineitems.splice(0, 7).join("")
                }</ul>
                
                ${
                  allthelineitems.length >= 7
                    ? `<p class="text-xs text-gray-300">Showing 10 of ${allthelineitems.length} cases</p>`
                    : ""
                }
              </div><style>
              .mapboxgl-popup-content {
                background: #212121e0;
                color: #fdfdfd;
              }
    
              .flexcollate {
                row-gap: 0.5rem;
                display: flex;
                flex-direction: column;
              }
              </style>`
                    )
                    .addTo(map);
                }
              }
            }
          }
        }
      });

      map.on("mouseleave", "building-safety", () => {
        //check if the url query string "stopmouseleave" is true
        //if it is, then don't do anything
        //if it is not, then do the following
        /* map.getCanvas().style.cursor = '';
          popup.remove();*/

        if (urlParams.get("stopmouseleave") === null) {
          map.getCanvas().style.cursor = "";
          popup.remove();
        }
      });

      map.addSource("building-safety-point", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.loadImage("/map-marker.png", (error, image: any) => {
        if (error) throw error;

        // Add the image to the map style.
        map.addImage("map-marker", image);

        if (true) {
          // example of how to add a pointer to what is currently selected
          map.addLayer({
            id: "points-selected-shelter-layer",
            type: "symbol",
            source: "building-safety-point",
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
          "road-label-navigation"
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
              "line-color": "#7FE5D4",
              "line-opacity": 1,
              "line-width": 2,
            },
          },
          "road-label-navigation"
        );

        map.addLayer(
          {
            id: "councildistrictsselectlayer",
            type: "fill",
            source: "citycouncildist",
            paint: {
              "fill-color": "#000000",
              "fill-opacity": 0,
            },
          },
          "road-label-navigation"
        );

        map.on("mousedown", "councildistrictsselectlayer", (e: any) => {
          var sourceofcouncildistselect: any = map.getSource(
            "selected-council-dist"
          );

          var clickeddata = e.features[0].properties.district;

          var councildistpolygonfound = councildistricts.features.find(
            (eachDist: any) => eachDist.properties.district === clickeddata
          );

          if (sourceofcouncildistselect) {
            if (councildistpolygonfound) {
              sourceofcouncildistselect.setData(councildistpolygonfound);
            }
          }
        });

        map.addSource("selected-council-dist", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        map.addLayer(
          {
            id: "selected-council-dist-layer",
            type: "fill",
            source: "selected-council-dist",
            paint: {
              "fill-color": "#002D25",
              "fill-opacity": 0.25,
            },
          },
          "road-label-navigation"
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

  useEffect(() => {
    let arrayoffilterables: any = [];

    arrayoffilterables.push([
      "match",
      ["get", "Year Case Created"],
      filteredYears,
      true,
      false,
    ]);

    arrayoffilterables.push([
      "match",
      ["get", "Area Planning Commission"],
      filteredAreas.map((area) => String(area)),
      true,
      false,
    ]);

    arrayoffilterables.push([
      "match",
      ["get", "Case Type"],
      filteredCases.map((caseType) => String(caseType)),
      true,
      false,
    ]);

    if (mapref.current) {
      if (doneloadingmap) {
        const filterinput = JSON.parse(
          JSON.stringify(["all", ...arrayoffilterables])
        );

        console.log(filterinput);

        if (doneloadingmap === true) {
          mapref.current.setFilter("building-safety", filterinput);
        }
      }
    }
  }, [filteredYears, filteredAreas, filteredCases]);

  const onSelect = () => {
    console.log("onSelect", selectedfilteropened);
    if (selectedfilteropened === "year") {
      setFilteredYearPre(filterableYearsKeys);
    } else if (selectedfilteropened === "area") {
      setFilteredAreaPre(filterableAreasKeys);
    } else if (selectedfilteropened === "case") {
      setFilteredCasesPre(filterableCasesKeys);
    }
  };

  const onUnselect = () => {
    if (selectedfilteropened === "year") {
      setFilteredYearPre([]);
    } else if (selectedfilteropened === "area") {
      setFilteredAreaPre([]);
    } else if (selectedfilteropened === "case") {
      setFilteredCasesPre([]);
    }
  };

  const onInvert = () => {
    if (selectedfilteropened === "year") {
      setFilteredYearPre(
        filterableYearsKeys.filter((n) => !filteredYears.includes(Number(n)))
      );
    } else if (selectedfilteropened === "area") {
      setFilteredAreaPre(
        filterableAreasKeys.filter((n) => !filteredAreas.includes(n))
      );
    } else if (selectedfilteropened === "case") {
      setFilteredCasesPre(
        filterableCasesKeys.filter((n) => !filteredCases.includes(n))
      );
    }
  };

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
          <title>Building and Safety Code Enforcement Cases</title>
          <meta property="og:type" content="website" />
          <meta name="twitter:site" content="@lacontroller" />
          <meta name="twitter:creator" content="@lacontroller" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            key="twittertitle"
            content="Twitter Template Map | Map"
          ></meta>
          <meta
            name="twitter:description"
            key="twitterdesc"
            content="This is a template name"
          ></meta>
          <meta
            name="twitter:image"
            key="twitterimg"
            content="https://templatemap.lacontroller.io/thumbnail.png"
          ></meta>
          <meta name="description" content="Search Engine Template name." />

          <meta
            property="og:url"
            content="https://templatemap.lacontroller.io"
          />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Shelter Beds Occupancy | Map" />
          <meta
            property="og:description"
            content="Search engine template name + facebook/instagram template name."
          />
          <meta
            property="og:image"
            content="https://templatemap.lacontroller.io"
          />
        </Head>

        <div className="flex-none">
          <Nav />
        </div>

        <div className="flex-initial h-content flex-col flex z-50">
          <div className="   max-h-screen flex-col flex z-5">
            <MapTitle />
            <div
              className={`geocoder absolute mt-[2.7em] md:mt-[4.1em] ml-1 left-1 md:hidden xs:text-sm sm:text-base md:text-lg`}
              id="geocoder"
            ></div>
            <div className="w-content"></div>

            <div
              className="filterandinfobox fixed top-auto bottom-0 left-0 right-0 
              sm:max-w-sm sm:absolute sm:mt-[6em] md:mt-[3em] sm:ml-3 sm:top-auto sm:bottom-auto sm:left-auto sm:right-auto flex flex-col gap-y-2"
            >
              {filterpanelopened === false && (<FilterButton setfilterpanelopened={setfilterpanelopened}/>)}
              <div
                className={`
              ${
                filterpanelopened
                  ? "relative bg-zinc-900 w-content bg-opacity-90 px-2 py-1 mt-1 sm:rounded-lg"
                  : "hidden"
              }
              `}
              >
                <CloseButton
                  onClose={() => {
                    setfilterpanelopened(false);
                  }}
                />
                <div className="gap-x-0 flex flex-row w-full pr-8">
                  <button
                    onClick={() => {
                      setselectedfilteropened("year");
                    }}
                    className={`px-2 border-b-2 py-1  font-semibold ${
                      selectedfilteropened === "year"
                        ? "border-[#41ffca] text-[#41ffca]"
                        : "hover:border-white border-transparent text-gray-50"
                    }`}
                  >
                    Year
                  </button>
                  <button
                    onClick={() => {
                      setselectedfilteropened("area");
                    }}
                    className={`px-2 border-b-2  py-1  font-semibold ${
                      selectedfilteropened === "area"
                        ? "border-[#41ffca] text-[#41ffca]"
                        : "hover:border-white border-transparent text-gray-50"
                    }`}
                  >
                    Area
                  </button>
                  <button
                    onClick={() => {
                      setselectedfilteropened("case");
                    }}
                    className={`px-2 border-b-2  py-1  font-semibold ${
                      selectedfilteropened === "case"
                        ? "border-[#41ffca] text-[#41ffca]"
                        : "hover:border-white border-transparent text-gray-50"
                    }`}
                  >
                    Case
                  </button>
                </div>
                <div className="flex flex-col">
                  {selectedfilteropened === "year" && (
                    <div className="mt-2">
                      <SelectButtons
                        onSelect={onSelect}
                        onUnselect={onUnselect}
                        onInvert={onInvert}
                      />
                      <div className="flex flex-row gap-x-1">
                        <div className="flex items-center">
                          <Checkbox.Group
                            value={filteredYears.map((year) => String(year))}
                            onChange={setFilteredYearPre}
                          >
                            <div
                              className={`grid grid-cols-3
                          } gap-x-4 `}
                            >
                              {Object.entries(filterableYears).map(
                                (eachEntry) => (
                                  <Checkbox
                                    value={eachEntry[0]}
                                    label={
                                      <span className="text-nowrap text-xs">
                                        <span className="text-white">
                                          {titleCase(
                                            eachEntry[0].toLowerCase()
                                          )}
                                        </span>{" "}
                                        <span>{eachEntry[1]}</span>
                                      </span>
                                    }
                                    key={eachEntry[0]}
                                  />
                                )
                              )}
                            </div>
                          </Checkbox.Group>
                        </div>
                      </div>
                      <p className="text-gray-200 text-xs mt-2">
                        Code Enforcement Cases by Year
                      </p>
                    </div>
                  )}
                  {selectedfilteropened === "area" && (
                    <div className="mt-2">
                      <SelectButtons
                        onSelect={onSelect}
                        onUnselect={onUnselect}
                        onInvert={onInvert}
                      />
                      <div className="flex flex-row gap-x-1">
                        <div className="flex items-center">
                          <Checkbox.Group
                            value={filteredAreas}
                            onChange={setFilteredAreaPre}
                          >
                            <div
                              className={`grid grid-cols-3
                          } gap-x-4 `}
                            >
                              {Object.entries(filterableAreas).map(
                                (eachEntry) => (
                                  <Checkbox
                                    value={eachEntry[0]}
                                    label={
                                      <span className="text-nowrap text-xs">
                                        <span className="text-white">
                                          {titleCase(eachEntry[0])}
                                        </span>{" "}
                                        <span>{eachEntry[1]}</span>
                                      </span>
                                    }
                                    key={eachEntry[0]}
                                  />
                                )
                              )}
                            </div>
                          </Checkbox.Group>
                        </div>
                      </div>
                      <p className="text-gray-200 text-xs mt-2">
                        Code Enforcement Cases by Area Planning Commission
                      </p>
                    </div>
                  )}
                  {selectedfilteropened === "case" && (
                    <div className="mt-2">
                      <SelectButtons
                        onSelect={onSelect}
                        onUnselect={onUnselect}
                        onInvert={onInvert}
                      />
                      <div className="flex flex-row gap-x-1">
                        <div className="flex items-center">
                          <Checkbox.Group
                            value={filteredCases}
                            onChange={setFilteredCasesPre}
                          >
                            <div
                              className={`grid grid-cols-3
                          } gap-x-4 `}
                            >
                              {Object.entries(filterableCases).map(
                                (eachEntry) => (
                                  <Checkbox
                                    value={eachEntry[0]}
                                    label={
                                      <span className="text-nowrap text-xs">
                                        <span className="text-white">
                                          {titleCase(eachEntry[0])}
                                        </span>{" "}
                                        <span>{eachEntry[1]}</span>
                                      </span>
                                    }
                                    key={eachEntry[0]}
                                  />
                                )
                              )}
                            </div>
                          </Checkbox.Group>
                        </div>
                      </div>
                      <p className="text-gray-200 text-xs mt-2">
                        Code Enforcement Cases by Case Type
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
