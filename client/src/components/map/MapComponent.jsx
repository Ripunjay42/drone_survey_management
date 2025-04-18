// client/src/components/map/MapComponent.jsx
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

// This should be set to your Mapbox access token in a production environment
// You'd typically store this in an environment variable
mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xhbXBsZWFwaWtleSJ9.exampletoken123456';

const MapComponent = ({ onAreaDrawn }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const [lng, setLng] = useState(-74.5);
  const [lat, setLat] = useState(40);
  const [zoom, setZoom] = useState(9);

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [lng, lat],
      zoom: zoom
    });

    // Get user location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        map.current.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          essential: true
        });
      });
    }

    // Add drawing controls
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'draw_polygon'
    });

    map.current.addControl(draw.current);
    
    // Handle drawing events
    map.current.on('draw.create', updateArea);
    map.current.on('draw.update', updateArea);
    map.current.on('draw.delete', deleteArea);

    return () => {
      map.current.off('draw.create', updateArea);
      map.current.off('draw.update', updateArea);
      map.current.off('draw.delete', deleteArea);
      map.current?.remove();
    };
  }, []);

  // Update coordinates when drawing completes
  const updateArea = (e) => {
    const data = draw.current.getAll();
    if (data.features.length > 0) {
      const polygonCoordinates = data.features[0].geometry;
      // Calculate area using turf.js (if needed)
      const area = calculateArea(polygonCoordinates);
      
      // Send data to parent component
      onAreaDrawn({
        polygon: polygonCoordinates,
        area: area
      });
    }
  };

  // Clear area data when polygon is deleted
  const deleteArea = () => {
    onAreaDrawn(null);
  };

  // Basic area calculation (simplified for example)
  const calculateArea = (polygon) => {
    // In a real application, you would use turf.js or similar to calculate the actual area
    // This is a placeholder
    return "Calculated area would go here";
  };

  return (
    <div className="relative w-full">
      <div className="w-full h-[500px]" ref={mapContainer} />
      <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow-md text-sm">
        Draw a polygon to define the survey area
      </div>
    </div>
  );
};

export default MapComponent;