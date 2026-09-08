"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import {
  setOptions,
  importLibrary,
} from "@googlemaps/js-api-loader";

type Centre = {
  id: string;
  centre_code: string;
  name: string;
  state: string;
  district: string;
  address: string;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  daily_capacity: number;
  is_active: boolean;
};

type CentreMapProps = {
  centres: Centre[];
};

const DEFAULT_LOCATION = {
  lat: 12.9716,
  lng: 77.5946,
};

export default function CentreMap({
  centres,
}: CentreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // Store the actual Google Map instance
  const mapInstanceRef =
    useRef<google.maps.Map | null>(null);

  // Store the user's location circle
  const userLocationCircleRef =
    useRef<google.maps.Circle | null>(null);

  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] =
    useState<string | null>(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      try {
        const apiKey =
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          throw new Error(
            "Google Maps API key is missing. Check your .env.local file."
          );
        }

        setOptions({
          key: apiKey,
          v: "weekly",
        });

        const { Map } =
          (await importLibrary(
            "maps"
          )) as google.maps.MapsLibrary;

        if (!mapRef.current || cancelled) {
          return;
        }

        const validCentres = centres.filter(
          (centre) =>
            centre.latitude !== null &&
            centre.longitude !== null
        );

        const initialCenter =
          validCentres.length > 0
            ? {
                lat: validCentres[0].latitude!,
                lng: validCentres[0].longitude!,
              }
            : DEFAULT_LOCATION;

        const map = new Map(mapRef.current, {
          center: initialCenter,
          zoom: validCentres.length > 0 ? 13 : 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        // Save map instance so other functions can control it
        mapInstanceRef.current = map;

        // Add procurement centre markers
        validCentres.forEach((centre) => {
          new google.maps.Marker({
            position: {
              lat: centre.latitude!,
              lng: centre.longitude!,
            },
            map,
            title: centre.name,
          });
        });

        setLoading(false);
      } catch (error) {
        console.error(
          "Google Maps error:",
          error
        );

        if (!cancelled) {
          setMapError(
            error instanceof Error
              ? error.message
              : "Unable to load Google Maps."
          );

          setLoading(false);
        }
      }
    }

    loadMap();

    return () => {
      cancelled = true;

      if (userLocationCircleRef.current) {
        userLocationCircleRef.current.setMap(
          null
        );

        userLocationCircleRef.current = null;
      }

      mapInstanceRef.current = null;
    };
  }, [centres]);

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setMapError(
        "Location is not supported by this browser."
      );

      return;
    }

    setLocationLoading(true);
    setMapError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(location);

        // Get the current Google Map
        const map = mapInstanceRef.current;

        if (map) {
          // Move map to user's location
          map.setCenter(location);

          // Zoom closer
          map.setZoom(14);

          // Remove previous location circle
          if (userLocationCircleRef.current) {
            userLocationCircleRef.current.setMap(
              null
            );
          }

          // Add circle around user's location
          userLocationCircleRef.current =
            new google.maps.Circle({
              map,
              center: location,
              radius: 60,
              fillOpacity: 0.2,
              strokeOpacity: 0.7,
              strokeWeight: 2,
            });
        }

        setLocationLoading(false);
      },
      (error) => {
        console.error(
          "Location error:",
          error
        );

        setLocationLoading(false);

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          setMapError(
            "Location permission was denied. You can still search for centres."
          );
        } else if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {
          setMapError(
            "Your location is currently unavailable."
          );
        } else if (
          error.code ===
          error.TIMEOUT
        ) {
          setMapError(
            "Location request timed out. Please try again."
          );
        } else {
          setMapError(
            "Unable to get your current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Procurement Centres
          </h2>

          <p className="text-sm text-[var(--color-text-secondary)]">
            Find a centre near you.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locationLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locationLoading ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <MapPin size={16} />
          )}

          {locationLoading
            ? "Finding you..."
            : "Use my location"}
        </button>
      </div>

      {mapError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mapError}
        </div>
      )}

      <div className="relative h-[420px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
        <div
          ref={mapRef}
          className="h-full w-full"
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <Loader2
                size={18}
                className="animate-spin"
              />

              Loading map...
            </div>
          </div>
        )}

        {userLocation && (
          <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-white px-3 py-2 text-xs font-medium shadow-md">
            📍 Your location detected
          </div>
        )}
      </div>
    </div>
  );
}