import { useMemo, useState } from "react";
import busanDistrictBoundaries from "@/assets/geo/busan-district-boundaries.json";
import type { DistrictEmployeeGrowth } from "../types";

type BusanDistrictGrowthMapProps = {
  items: DistrictEmployeeGrowth[];
};

type Position = [number, number];
type PolygonCoordinates = Position[][];
type MultiPolygonCoordinates = PolygonCoordinates[];

type DistrictFeature = {
  geometry: {
    coordinates: PolygonCoordinates | MultiPolygonCoordinates;
    type: "Polygon" | "MultiPolygon";
  };
  properties: {
    districtName: string;
    regionCode: string;
  };
};

type FeatureCollection = {
  features: DistrictFeature[];
};

const SVG_WIDTH = 520;
const SVG_HEIGHT = 320;
const PADDING = 18;

const formatPercent = (value: number | null) => (value === null ? "-" : `${value > 0 ? "+" : ""}${value}%`);

const growthFill = (value: number | null | undefined) => {
  if (value === undefined || value === null) {
    return "#e7edf5";
  }

  if (value >= 15) {
    return "#fb7185";
  }

  if (value >= 5) {
    return "#fecdd3";
  }

  if (value <= -15) {
    return "#2563eb";
  }

  if (value <= -5) {
    return "#93c5fd";
  }

  return "#dbeafe";
};

const normalizePolygons = (feature: DistrictFeature): PolygonCoordinates[] =>
  feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates as PolygonCoordinates]
    : (feature.geometry.coordinates as MultiPolygonCoordinates);

const allPositions = (features: DistrictFeature[]) =>
  features.flatMap((feature) =>
    normalizePolygons(feature).flatMap((polygon) => polygon.flatMap((ring) => ring)),
  );

const ringToPath = (
  ring: Position[],
  project: (position: Position) => { x: number; y: number },
) =>
  ring
    .map((position, index) => {
      const point = project(position);
      return `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    })
    .join(" ") + " Z";

const featureToPath = (
  feature: DistrictFeature,
  project: (position: Position) => { x: number; y: number },
) =>
  normalizePolygons(feature)
    .flatMap((polygon) => polygon.map((ring) => ringToPath(ring, project)))
    .join(" ");

const featureCenter = (
  feature: DistrictFeature,
  project: (position: Position) => { x: number; y: number },
) => {
  const positions = normalizePolygons(feature).flatMap((polygon) => polygon[0] ?? []);
  const center = positions.reduce(
    (acc, position) => {
      acc.lng += position[0];
      acc.lat += position[1];
      return acc;
    },
    { lat: 0, lng: 0 },
  );
  const count = Math.max(1, positions.length);
  return project([center.lng / count, center.lat / count]);
};

const BusanDistrictGrowthMap = ({ items }: BusanDistrictGrowthMapProps) => {
  const [activeRegionCode, setActiveRegionCode] = useState<string | null>(null);
  const growthByCode = useMemo(
    () => new Map(items.map((item) => [item.sggCode, item])),
    [items],
  );

  const map = useMemo(() => {
    const features = (busanDistrictBoundaries as unknown as FeatureCollection).features;
    const positions = allPositions(features);
    const lngs = positions.map((position) => position[0]);
    const lats = positions.map((position) => position[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const scale = Math.min(
      (SVG_WIDTH - PADDING * 2) / (maxLng - minLng),
      (SVG_HEIGHT - PADDING * 2) / (maxLat - minLat),
    );
    const contentWidth = (maxLng - minLng) * scale;
    const contentHeight = (maxLat - minLat) * scale;
    const offsetX = (SVG_WIDTH - contentWidth) / 2;
    const offsetY = (SVG_HEIGHT - contentHeight) / 2;
    const project = ([lng, lat]: Position) => ({
      x: offsetX + (lng - minLng) * scale,
      y: offsetY + (maxLat - lat) * scale,
    });

    return features.map((feature) => ({
      center: featureCenter(feature, project),
      feature,
      path: featureToPath(feature, project),
    }));
  }, []);

  const activeFeature = activeRegionCode ? growthByCode.get(activeRegionCode) : null;

  return (
    <div className="relative mt-5 rounded-md bg-[#f7faff] p-3">
      <svg
        aria-label="부산 구군별 종사자 증감률 지도"
        className="h-[260px] w-full"
        role="img"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      >
        <g>
          {map.map(({ feature, path }) => {
            const growth = growthByCode.get(feature.properties.regionCode)?.growthRate;
            const isActive = activeRegionCode === feature.properties.regionCode;

            return (
              <path
                d={path}
                fill={growthFill(growth)}
                key={feature.properties.regionCode}
                onMouseEnter={() => setActiveRegionCode(feature.properties.regionCode)}
                onMouseLeave={() => setActiveRegionCode(null)}
                stroke={isActive ? "#0f3f91" : "#ffffff"}
                strokeWidth={isActive ? 2.2 : 1.2}
              >
                <title>
                  {feature.properties.districtName}: {formatPercent(growth ?? null)}
                </title>
              </path>
            );
          })}
        </g>
        <g pointerEvents="none">
          {map.map(({ center, feature }) => {
            const growth = growthByCode.get(feature.properties.regionCode)?.growthRate;

            return (
              <text
                fill={growth !== undefined && growth !== null && growth >= 15 ? "#ffffff" : "#263b59"}
                fontSize="11"
                fontWeight="800"
                key={`label-${feature.properties.regionCode}`}
                textAnchor="middle"
                x={center.x}
                y={center.y}
              >
                {feature.properties.districtName.replace("부산진구", "부산진")}
              </text>
            );
          })}
        </g>
      </svg>

      {activeFeature && (
        <div className="absolute left-4 top-4 rounded-md border border-[#d7e4f5] bg-white px-3 py-2 text-xs font-extrabold text-[#334766] shadow-sm">
          {activeFeature.districtName} {formatPercent(activeFeature.growthRate)}
        </div>
      )}

      <div className="mt-2 flex flex-wrap justify-end gap-x-4 gap-y-1 text-[11px] font-bold text-[#52647e]">
        <Legend color="#fb7185" label="+15% 이상" />
        <Legend color="#fecdd3" label="+5% ~ +15%" />
        <Legend color="#dbeafe" label="-5% ~ +5%" />
        <Legend color="#93c5fd" label="-15% ~ -5%" />
        <Legend color="#2563eb" label="-15% 이하" />
      </div>
    </div>
  );
};

const Legend = ({ color, label }: { color: string; label: string }) => (
  <span className="inline-flex items-center gap-1">
    <i className="inline-block h-2 w-2" style={{ backgroundColor: color }} />
    {label}
  </span>
);

export default BusanDistrictGrowthMap;
