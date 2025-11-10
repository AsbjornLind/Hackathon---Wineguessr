// Fix: Add TypeScript declarations for the Google Maps API to resolve type errors.
// Since the Google Maps script is loaded dynamically, TypeScript needs to be
// aware of the `google` object on the global scope. These declarations provide
// the necessary type information for the parts of the API used in this component.
declare global {
  namespace google {
    namespace maps {
      type MapTypeStyle = {
        elementType?: string;
        featureType?: string;
        stylers: Array<Record<string, any>>;
      };

      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }
      
      class LatLngBounds {
          constructor(sw?: LatLng | null, ne?: LatLng | null);
          extend(point: LatLng | {lat: number, lng: number}): void;
      }

      interface MapMouseEvent {
        latLng: LatLng | null;
      }

      class Map {
        constructor(mapDiv: Element, opts?: any);
        addListener(eventName: string, handler: (event: MapMouseEvent) => void): any;
        fitBounds(bounds: LatLngBounds, padding?: number | any): void;
        setOptions(options: any): void;
      }

      namespace marker {
        class AdvancedMarkerElement {
          constructor(opts?: any);
          position: LatLng | {lat: number, lng: number} | null;
          map: Map | null;
          content?: HTMLElement | null;
          title?: string | null;
        }
      }

      class Polyline {
        constructor(opts?: any);
        setMap(map: Map | null): void;
      }

      const event: {
        removeListener(listener: any): void;
      };
    }
  }
}

import React, { useRef, useEffect, useState } from 'react';
import { Coordinates, GameResult } from '../types';

interface MapProps {
  onGuess: (guess: Coordinates) => void;
  isGuessing: boolean;
  result?: GameResult & { allPlayerGuesses?: { [playerId: string]: GameResult } };
}

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
    { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d1d5' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
];

export const Map: React.FC<MapProps> = ({ onGuess, isGuessing, result }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  const [mapElements, setMapElements] = useState<{
    markers: google.maps.marker.AdvancedMarkerElement[],
    lines: google.maps.Polyline[]
  }>({ markers: [], lines: [] });

  const [guessCoords, setGuessCoords] = useState<Coordinates | null>(null);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapId: 'WINEGUESSER_MAP',
        disableDefaultUI: true,
        zoomControl: true,
        styles: mapStyles,
      });
      setMap(newMap);
    }
  }, [map]);

  // Handle map click for guessing
  useEffect(() => {
    if (!map || !isGuessing) return;

    const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setGuessCoords(coords);
      }
    });

    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [map, isGuessing]);

  // Update temporary guess marker
  useEffect(() => {
    if (map && guessCoords) {
        if (mapElements.markers.length === 0) {
             const pinGlyph = document.createElement('div');
             pinGlyph.className = 'w-3 h-3 rounded-full bg-white ring-2 ring-rose-600';
             const marker = new google.maps.marker.AdvancedMarkerElement({
                position: guessCoords,
                map,
                title: 'Your Guess',
                content: pinGlyph,
            });
            setMapElements(prev => ({ ...prev, markers: [marker] }));
        } else {
            mapElements.markers[0].position = guessCoords;
        }
    }
  }, [map, guessCoords, mapElements.markers]);


  // Clean up markers and line from the map
  const cleanupMapElements = () => {
    mapElements.markers.forEach(m => m.map = null);
    mapElements.lines.forEach(l => l.setMap(null));
    setMapElements({ markers: [], lines: [] });
    setGuessCoords(null);
  };
  
  // Effect to draw result markers and line
  useEffect(() => {
    if (map && result) {
        cleanupMapElements();
        
        const bounds = new google.maps.LatLngBounds();
        const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
        const newLines: google.maps.Polyline[] = [];

        // Actual Location Marker
        const actualCoords = result.wine.winefarm_coordinates;
        const actualPinElement = document.createElement('div');
        actualPinElement.innerHTML = `
            <div class="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-rose-800 drop-shadow-lg">
                    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 005.16-4.249 16.975 16.975 0 00-5.16-16.175A16.975 16.975 0 0012 1.92a16.975 16.975 0 00-5.16 4.249 16.975 16.975 0 00-5.16 16.175 16.975 16.975 0 005.16 4.249zM12 14.25a3.375 3.375 0 100-6.75 3.375 3.375 0 000 6.75z" clip-rule="evenodd" />
                </svg>
            </div>`;
        const newActualMarker = new google.maps.marker.AdvancedMarkerElement({
            position: actualCoords,
            map,
            title: 'Actual Location',
            content: actualPinElement
        });
        newMarkers.push(newActualMarker);
        bounds.extend(actualCoords);

        // This handles both solo and multiplayer summary views
        const guessesToDraw = result.allPlayerGuesses ? Object.values(result.allPlayerGuesses) : [result];

        guessesToDraw.forEach(guessResult => {
            const guessCoordsResult = guessResult.guess;
            const guessPinElement = document.createElement('div');
            guessPinElement.innerHTML = `
                <div class="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-amber-500 drop-shadow-lg">
                        <path fill-rule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clip-rule="evenodd" />
                    </svg>
                </div>`;
            const newGuessMarker = new google.maps.marker.AdvancedMarkerElement({
                position: guessCoordsResult,
                map,
                title: 'Your Guess',
                content: guessPinElement,
            });
            newMarkers.push(newGuessMarker);
            bounds.extend(guessCoordsResult);

            // Polyline
            const newLine = new google.maps.Polyline({
                path: [actualCoords, guessCoordsResult],
                geodesic: true,
                strokeColor: '#881337',
                strokeOpacity: 0.8,
                strokeWeight: 2,
            });
            newLine.setMap(map);
            newLines.push(newLine);
        });
        
        setMapElements({ markers: newMarkers, lines: newLines });
        map.fitBounds(bounds, 50);
    }
  }, [map, result]);

  // Effect to reset the map for a new round
  useEffect(() => {
    if (map && !result && !isGuessing) {
      cleanupMapElements();
      map.setOptions({ center: { lat: 20, lng: 0 }, zoom: 2 });
    }
  }, [map, result, isGuessing]);


  const handleConfirmGuess = () => {
    if (guessCoords) {
      onGuess(guessCoords);
      cleanupMapElements();
    }
  };

  return (
    <div className="w-full h-full relative">
        <div ref={mapRef} className="w-full h-full" />
        {isGuessing && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-2xl flex flex-col items-center">
                 <p className="text-stone-600 mb-4 text-center">Click on the map to place your pin.</p>
                 <button 
                    onClick={handleConfirmGuess}
                    disabled={!guessCoords}
                    className="w-full bg-rose-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-rose-900 transition-colors duration-300 disabled:bg-rose-400 disabled:cursor-not-allowed"
                >
                    Confirm Guess
                </button>
            </div>
        )}
    </div>
  );
};
