# React World Map Module

This workspace is not currently a React app, so the reusable map component was added as isolated React source files under `src/`.

## Files

- `src/components/WorldMap/WorldMap.jsx`
- `src/components/WorldMap/WorldMap.css`
- `src/components/WorldMap/index.js`
- `src/data/islamWorldMapData.js`

## Expected dependencies

Install these in your React project:

```bash
npm install leaflet react-leaflet react-leaflet-cluster
```

## Usage

```jsx
import WorldMap from "./components/WorldMap";
import "leaflet/dist/leaflet.css";

export default function App() {
  return <WorldMap />;
}
```

## Notes

- Uses OpenStreetMap tiles, so no API key is required.
- Includes marker clustering by default.
- Marker content is stored separately in `src/data/islamWorldMapData.js`.
- Styling is dark-themed with gold accents and mobile-safe sizing.
