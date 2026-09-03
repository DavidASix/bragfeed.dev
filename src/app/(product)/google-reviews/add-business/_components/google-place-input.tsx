"use client";

import React, { useEffect, useId, useState } from "react";
import Script from "next/script";

import { cn } from "@/lib/utils";

import { LoadingSpinner } from "@/components/ui/custom/loading-spinner";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface GMPSelectEvent extends Event {
  placePrediction: google.maps.places.PlacePrediction;
}

interface GooglePlaceInputProps {
  onPlaceSelect?: (
    placeId: string,
    place: google.maps.places.PlaceResult,
  ) => void;
  className?: string;
}

/**
 * GooglePlaceInput component provides a Google Maps Places Autocomplete input.
 *
 * @requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to be set in environment variables.
 *
 * The internal gmp-place-autocomplete component implements a shadow DOM structure, which is not accessible directly.
 * This means we cannot directly access things like the input element or the clear button element. Apparently you can
 * partially open the shadow DOM but I haven't bothered with that yet:
 * Hack to open the shadow-root -> https://stackoverflow.com/questions/79556333/how-to-style-google-maps-placeautocompleteelement-to-match-existing-form-inputs
 */
export default function GooglePlaceInput({
  onPlaceSelect,
  className,
}: GooglePlaceInputProps) {
  const autocompleteId = useId();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    const autocompleteElement = document.getElementById(autocompleteId);
    if (!autocompleteElement) return;

    let timeoutId: NodeJS.Timeout | null = null;

    /**
     * Callback to handle a place being selected from the autocomplete input.
     * The function parses out the place information from the Google selection event, sets the place ID
     * to state, and calls the onPlaceSelect callback with the place ID and a legacy PlaceResult object.
     *
     * @param event GMPSelectEvent
     */
    const handlePlaceSelect = async (event: GMPSelectEvent) => {
      const { placePrediction } = event;

      // Convert placePrediction to Place and fetch details
      const place = placePrediction.toPlace();
      await place.fetchFields({
        fields: ["id", "displayName", "formattedAddress", "location"],
      });

      // Extract place data using proper Place API methods
      const placeId = place.id;
      const displayName = place.displayName;
      const formattedAddress = place.formattedAddress;
      const location = place.location;

      if (placeId) {
        setSelectedPlaceId(placeId);

        // Create a proper PlaceResult
        const legacyPlaceResult: google.maps.places.PlaceResult = {
          place_id: placeId,
          name: displayName || undefined,
          formatted_address: formattedAddress || undefined,
          geometry: location
            ? {
                location: location,
              }
            : undefined,
        };

        onPlaceSelect?.(placeId, legacyPlaceResult);
      }
    };

    const selectEventHandler = (event: Event) => {
      handlePlaceSelect(event as GMPSelectEvent);
    };

    /**
     * Clear the selected place ID when the user starts typing in the input or clicks the input.
     * This is necessary because the gmp-place-autocomplete component does not provide a direct way to access
     * the input element or the clear button element.
     */
    const clearEventHandler = () => {
      if (selectedPlaceId) {
        // Small delay to let any internal clear logic execute first
        timeoutId = setTimeout(() => {
          setSelectedPlaceId(null);
          onPlaceSelect?.("", {
            place_id: "",
            name: undefined,
            formatted_address: undefined,
            geometry: undefined,
          });
        }, 100);
      }
    };

    autocompleteElement.addEventListener("gmp-select", selectEventHandler);
    autocompleteElement.addEventListener("input", clearEventHandler);
    // Since we can't access shadow DOM, assume any click while place is selected clears it
    autocompleteElement.addEventListener("click", clearEventHandler);

    return () => {
      autocompleteElement.removeEventListener("gmp-select", selectEventHandler);
      autocompleteElement.removeEventListener("input", clearEventHandler);
      autocompleteElement.removeEventListener("click", clearEventHandler);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [autocompleteId, onPlaceSelect, selectedPlaceId]);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`}
        strategy="afterInteractive"
        onLoad={() => setIsLoaded(true)}
      />
      {React.createElement("gmp-place-autocomplete", {
        id: autocompleteId,
        className: cn("w-full  border rounded-lg", className),
        style: {
          display: isLoaded ? "block" : "none",
        },
      })}
      {!isLoaded && (
        <div className="flex justify-center items-center">
          <LoadingSpinner />
        </div>
      )}
    </>
  );
}
