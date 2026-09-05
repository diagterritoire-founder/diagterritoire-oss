"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  geoJSON,
  map as createMap,
} from "leaflet";

import type {
  Feature,
  FeatureCollection,
  GeoJsonObject,
  Geometry,
} from "geojson";

import {
  mayotteCommunes,
} from "@/data/mayotte-territories";

type CommuneProperties = {
  code: string;
  nom: string;
  departement?: string;
  region?: string;
  epci?: string;
};

type CommuneFeature = Feature<
  Geometry,
  CommuneProperties
>;

type MayotteGeoJSON = FeatureCollection<
  Geometry,
  CommuneProperties
>;

export default function MayotteLeafletMap() {
  const [geoData, setGeoData] =
    useState<MayotteGeoJSON | null>(
      null,
    );

  const mapElementRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const territoriesByCode =
    useMemo(
      () =>
        new Map(
          mayotteCommunes.map(
            (territory) => [
              territory.code,
              territory,
            ],
          ),
        ),
      [],
    );

  useEffect(() => {
    let active = true;

    fetch(
      "/geo/mayotte-communes.geojson",
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `GeoJSON HTTP ${response.status}`,
          );
        }

        return response.json();
      })
      .then(
        (
          data: MayotteGeoJSON,
        ) => {
          if (active) {
            setGeoData(data);
          }
        },
      )
      .catch((error) => {
        console.error(
          "Impossible de charger la carte de Mayotte",
          error,
        );
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      !geoData ||
      !mapElementRef.current
    ) {
      return;
    }

    const bounds = geoJSON(
      geoData as GeoJsonObject,
    ).getBounds();

    const leafletMap = createMap(
      mapElementRef.current,
      {
        maxBounds: bounds.pad(0.35),
        maxBoundsViscosity: 1,
        minZoom: 9,
        maxZoom: 14,
        zoomSnap: 0.5,
        scrollWheelZoom: false,
      },
    );

    leafletMap.fitBounds(
      bounds,
      {
        padding: [40, 40],
      },
    );

    geoJSON(
      geoData as GeoJsonObject,
      {
        style: () => ({
          color: "#0891b2",
          weight: 2,
          fillColor: "#cffafe",
          fillOpacity: 0.55,
        }),

        onEachFeature: (
          feature,
          layer,
        ) => {
          const communeFeature =
            feature as CommuneFeature;

          const territory =
            territoriesByCode.get(
              communeFeature.properties.code,
            );

          const name =
            territory?.name ??
            communeFeature.properties.nom;

          layer.bindTooltip(
            `<strong>${name}</strong><br />Code INSEE : ${communeFeature.properties.code}`,
          );

          layer.on({
            click: () => {
              if (!territory) {
                return;
              }

              window.location.href =
                `/territoires/${territory.id}`;
            },
          });
        },
      },
    ).addTo(leafletMap);

    return () => {
      leafletMap.remove();
    };
  }, [
    geoData,
    territoriesByCode,
  ]);

  if (!geoData) {
    return (
      <div className="flex h-[620px] items-center justify-center rounded-3xl bg-slate-100 text-sm text-slate-500">
        Chargement des contours communaux…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div
        ref={mapElementRef}
        className="h-[620px] w-full bg-slate-100"
      />
    </div>
  );
}
