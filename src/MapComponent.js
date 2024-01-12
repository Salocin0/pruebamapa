import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { booleanPointInPolygon } from "@turf/turf";

const MapComponent = () => {
  const [mymap, setMap] = useState(null);
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const featureGroup = L.featureGroup();
  const drawControlRef = React.useRef(null);

  const drawControl = new L.Control.Draw({
    draw: {
      polygon: true,
      marker: true,
      circlemarker: false,
      circle: false,
      rectangle: false,
      polyline: false,
    },
    edit: {
      featureGroup: featureGroup,
      remove: true,
    },
  });

  useEffect(() => {
    if (!mymap) {
      const mapInstance = L.map("mapid").setView(
        [52.684707, -8.350982666015627],
        13
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        noWrap: true,
        trackResize: false,
      }).addTo(mapInstance);

      setMap(mapInstance);

      drawControlRef.current = drawControl;

      drawControl.addTo(mapInstance);

      mapInstance.addLayer(featureGroup);

      mapInstance.on("draw:created", (event) => {
        const layer = event.layer;
        featureGroup.addLayer(layer);

        if (layer instanceof L.Marker) {
          const markerLatLng = layer.getLatLng();
          const currentPolygon =
            featureGroup
              .getLayers()
              .find((layer) => layer instanceof L.Polygon)
              ?.getLatLngs()[0] || [];
          const pointInsidePolygon = isPointInsidePolygon(
            markerLatLng,
            currentPolygon
          );

          if (pointInsidePolygon) {
            alert("Marcador agregado correctamente.");
          } else {
            featureGroup.removeLayer(layer);
            alert("El marcador debe estar dentro del polígono.");
          }
        } else if (layer instanceof L.Polygon) {
          setCurrentPolygon(layer.getLatLngs()[0]);
        }
      });

      mapInstance.on("draw:deleted", () => {
        setCurrentPolygon(null);
        alert("Polígono y marcadores eliminados.");
      });
    }
  }, [mymap]);

  const isPointInsidePolygon = (point, polygon) => {
    console.log("Turf Point:", point);
    console.log("Turf Polygon:", polygon);

   /* if (!point || !polygon || !polygon[0] || !Array.isArray(polygon[0]) || polygon[0].length < 3) {
      console.error("Datos incorrectos: point, polygon o estructura del polígono no válidos.");
      return false; // Verificación básica para evitar errores si point o polygon son nulos o no tienen suficientes puntos
    }*/

     // Convertir el punto a GeoJSON
  const turfPoint = {
    type: 'Point',
    coordinates: [point.lng, point.lat]
  };

  // Convertir el polígono a GeoJSON
  const turfPolygon = {
    type: 'Polygon',
    coordinates: [polygon.map(coord => [coord.lng, coord.lat])]
  };

    console.log("Turf Point:", turfPoint);
    console.log("Turf Polygon:", turfPolygon);

    return booleanPointInPolygon(turfPoint, turfPolygon);
  };

  return (
    <div>
      <div
        id="mapid"
        className="leaflet-map-container"
        style={{ height: "800px" }}
      ></div>
    </div>
  );
};

export default MapComponent;
