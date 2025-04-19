// client/src/components/map/MapComponent.jsx
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

// Get Mapbox token from Vite environment variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoic3BpZGVybmlzaGFudGEiLCJhIjoiY20ydW5ubGZuMDNlZTJpc2I1N2o3YWo0aiJ9.tKmf9gr1qgyi_N7WOaPoZw';
mapboxgl.accessToken = MAPBOX_TOKEN;

const MapComponent = ({ onAreaDrawn }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const [lng, setLng] = useState(-98);
  const [lat, setLat] = useState(39);
  const [zoom, setZoom] = useState(3);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // initialize map only once

    const initializeMap = () => {
      try {
        console.log('Initializing map with token:', MAPBOX_TOKEN.substring(0, 10) + '...');
        
        // Create map instance
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [lng, lat],
          zoom: zoom
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // When map is loaded
        map.current.on('load', () => {
          console.log('Map loaded successfully');
          setMapLoaded(true);
          
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
          
          // Try to get user location
          getUserLocation();
        });

        // Handle map errors
        map.current.on('error', (e) => {
          console.error('Map error:', e);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Try to initialize the map
    initializeMap();

    // Cleanup function to remove the map instance
    return () => {
      if (map.current) {
        map.current.off('draw.create', updateArea);
        map.current.off('draw.update', updateArea);
        map.current.off('draw.delete', deleteArea);
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Get user's location if available
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          console.log('User location found:', longitude, latitude);
          
          // Update state
          setLng(longitude);
          setLat(latitude);
          
          // Fly to user location
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 12,
              essential: true
            });
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
    }
  };

  // Update area when drawing completes
  const updateArea = (e) => {
    try {
      const data = draw.current.getAll();
      console.log('Draw data:', data);
      
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
    } catch (error) {
      console.error('Error updating area:', error);
    }
  };

  // Clear area data when polygon is deleted
  const deleteArea = () => {
    try {
      onAreaDrawn(null);
    } catch (error) {
      console.error('Error deleting area:', error);
    }
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
      {/* <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow-md text-sm">
        Draw a polygon to define the survey area
      </div> */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-700">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;