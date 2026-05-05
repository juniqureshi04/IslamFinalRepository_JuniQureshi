import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";

import { islamWorldMapData } from "../../data/islamWorldMapData";
import "./WorldMap.css";

function createMarkerIcon(name, index) {
  return L.divIcon({
    className: "world-map__marker-wrapper",
    html: `
      <button
        class="world-map__marker"
        type="button"
        aria-label="Open marker for ${name}"
        style="animation-delay:${index * 60}ms"
      ></button>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });
}

function WorldMapMarkers({ locations, activeId, onMarkerSelect, markerRefs }) {
  const markers = useMemo(
    () =>
      locations.map((location, index) => ({
        ...location,
        icon: createMarkerIcon(location.name, index),
      })),
    [locations]
  );

  return (
    <MarkerClusterGroup
      chunkedLoading
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
      maxClusterRadius={36}
      iconCreateFunction={(cluster) =>
        L.divIcon({
          className: "world-map__marker-wrapper",
          html: `<div class="world-map__marker world-map__marker--cluster">${cluster.getChildCount()}</div>`,
          iconSize: [34, 34],
        })
      }
    >
      {markers.map((location) => (
        <Marker
          key={location.id}
          position={location.coordinates}
          icon={location.icon}
          eventHandlers={{
            click: (event) => {
              markerRefs.current[location.id] = event.target;
              onMarkerSelect(location.id, true);
            },
            add: (event) => {
              markerRefs.current[location.id] = event.target;
            },
          }}
        >
          <Popup className="world-map__popup-shell" closeButton={false} offset={[0, -8]}>
            <div className="world-map__popup">
              <p className="world-map__popup-region">{location.region}</p>
              <h3 className="world-map__popup-title">{location.name}</h3>
              <p className="world-map__popup-text">{location.shortDescription}</p>
              <details className="world-map__popup-details">
                <summary>Expand</summary>
                <p>{location.detail}</p>
              </details>
            </div>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}

export default function WorldMap({
  locations = islamWorldMapData,
  center = [20, 0],
  zoom = 2,
  className = "",
}) {
  const [activeId, setActiveId] = useState(locations[0]?.id ?? null);
  const markerRefs = useRef({});
  const mapRef = useRef(null);

  const handleMarkerSelect = (id, animateZoom = false) => {
    setActiveId(id);

    const marker = markerRefs.current[id];
    const map = mapRef.current;
    const selected = locations.find((location) => location.id === id);

    if (!marker || !map || !selected) {
      return;
    }

    if (animateZoom) {
      map.flyTo(selected.coordinates, Math.max(map.getZoom(), 3), {
        animate: true,
        duration: 1.15,
      });
    }

    marker.openPopup();
  };

  useEffect(() => {
    if (!activeId) {
      return;
    }

    const marker = markerRefs.current[activeId];
    const element = marker?.getElement()?.querySelector(".world-map__marker");

    document
      .querySelectorAll(".world-map__marker.is-active")
      .forEach((node) => node.classList.remove("is-active"));

    if (element) {
      element.classList.add("is-active");
    }
  }, [activeId]);

  return (
    <section className={`world-map ${className}`.trim()} aria-label="Islam around the world interactive map">
      <div className="world-map__surface">
        <MapContainer
          center={center}
          zoom={zoom}
          zoomControl={false}
          scrollWheelZoom
          className="world-map__leaflet"
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <WorldMapMarkers
            locations={locations}
            activeId={activeId}
            onMarkerSelect={handleMarkerSelect}
            markerRefs={markerRefs}
          />
        </MapContainer>
      </div>
    </section>
  );
}
