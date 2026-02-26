import { globalLocAssetCountsMinMax } from "./constants.js";

export const assetTypes = [
  { type: "Camera", description: "Outdoor security camera" },
  { type: "Camera", description: "Indoor security camera" },
  { type: "Camera", description: "PTZ surveillance camera" },
  { type: "Sensor", description: "Motion detector sensor" },
  { type: "Sensor", description: "Temperature monitoring sensor" },
  { type: "Alarm", description: "Emergency alarm system" },
  { type: "Alarm", description: "Fire alarm panel" },
  { type: "Access Control", description: "Biometric access reader" },
  { type: "Access Control", description: "RFID card reader" },
  { type: "Intercom", description: "Video intercom station" },
  { type: "Smoke Detector", description: "Photoelectric smoke detector" },
  {
    type: "Glass Break Sensor",
    description: "Acoustic glass break detector",
  },
  { type: "Floodlight", description: "Motion-activated floodlight" },
  { type: "Video Doorbell", description: "Smart video doorbell" },
  { type: "Engine", description: "V6 3.5L engine block" },
  { type: "Engine", description: "V8 5.0L engine assembly" },
  { type: "Transmission", description: "Automatic 6-speed transmission" },
  { type: "Transmission", description: "Manual 5-speed gearbox" },
  { type: "Brake System", description: "Hydraulic disc brake kit" },
  { type: "Brake System", description: "ABS brake control module" },
  { type: "Alternator", description: "120A alternator assembly" },
  { type: "Starter Motor", description: "12V starter motor" },
  { type: "Radiator", description: "Aluminum cooling radiator" },
  { type: "Battery", description: "12V lead-acid car battery" },
  { type: "Fuel Pump", description: "Electric fuel pump assembly" },
  { type: "Air Filter", description: "High-flow air filter" },
  { type: "Oil Filter", description: "Spin-on oil filter" },
  { type: "Spark Plugs", description: "Iridium spark plug set" },
  { type: "Suspension", description: "Front strut assembly" },
  { type: "Suspension", description: "Rear shock absorber" },
  { type: "Exhaust", description: "Catalytic converter" },
  { type: "Exhaust", description: "Muffler assembly" },
  { type: "Tire", description: "All-season radial tire" },
  { type: "Tire", description: "Performance summer tire" },
  { type: "Wheel", description: "17-inch alloy wheel" },
  { type: "Headlight", description: "LED headlight assembly" },
  { type: "Taillight", description: "LED tail lamp assembly" },
  { type: "Windshield", description: "Laminated safety windshield" },
  { type: "Side Mirror", description: "Power-adjust side mirror" },
  { type: "Bumper", description: "Front bumper cover" },
  { type: "Hood", description: "Steel hood panel" },
  { type: "Fender", description: "Front fender panel" },
  { type: "Door", description: "Front driver side door" },
  { type: "Seat", description: "Leather driver seat" },
  { type: "Steering Wheel", description: "Multi-function steering wheel" },
  { type: "Dashboard", description: "Instrument panel assembly" },
];

export const globalLocations = [
  { city: "Berlin", country: "Germany", coords: [52.52, 13.405] },
  { city: "Oakland", country: "USA", coords: [37.8044, -122.2711] },
  { city: "Philadelphia", country: "USA", coords: [39.9526, -75.1652] },
  { city: "Vancouver", country: "Canada", coords: [49.2827, -123.1207] },
  { city: "Singapore", country: "Singapore", coords: [1.3521, 103.8198] },
  { city: "Sydney", country: "Australia", coords: [-33.8688, 151.2093] },
  { city: "Tokyo", country: "Japan", coords: [35.6762, 139.6503] },
  { city: "Brasília", country: "Brazil", coords: [-15.8267, -47.9218] },
].sort((a, b) => a.city.localeCompare(b.city));

export const cityLocations = [
  {
    address: "Alexanderplatz 1",
    city: "Berlin",
    country: "Germany",
    neighborhood: "Mitte",
    coords: [52.5219, 13.4132],
  },
  {
    city: "Berlin",
    country: "Germany",
    neighborhood: "Kreuzberg",
    address: "Oranienstraße 1",
    coords: [52.502, 13.419],
  },
  {
    city: "Berlin",
    country: "Germany",
    neighborhood: "Prenzlauer Berg",
    address: "Kollwitzstraße 1",
    coords: [52.538, 13.424],
  },
  {
    city: "Berlin",
    country: "Germany",
    neighborhood: "Friedrichshain",
    address: "Boxhagener Platz 1",
    coords: [52.515, 13.454],
  },
  {
    city: "Berlin",
    country: "Germany",
    neighborhood: "Charlottenburg",
    address: "Kurfürstendamm 1",
    coords: [52.502, 13.333],
  },
  {
    city: "Berlin",
    country: "Germany",
    neighborhood: "Neukölln",
    address: "Karl-Marx-Straße 1",
    coords: [52.487, 13.439],
  },
  {
    city: "Berlin",
    country: "Germany",
    neighborhood: "Spandau",
    address: "Altstädter Ring 1",
    coords: [52.537, 13.199],
  },
];

export const localLocations = [
  { name: "Warehouse A", coords: [0, 0] },
  { name: "Warehouse B", coords: [0, 0] },
  { name: "Warehouse C", coords: [0, 0] },
  { name: "Warehouse D", coords: [0, 0] },
  { name: "Administration A", coords: [0, 0] },
  { name: "Administration B", coords: [0, 0] },
  { name: "Administration C", coords: [0, 0] },
  { name: "Repair Shop A", coords: [0, 0] },
  { name: "Repair Shop B", coords: [0, 0] },
  { name: "Maintenance Area A", coords: [0, 0] },
  { name: "Maintenance Area B", coords: [0, 0] },
];

export const statuses = [
  "Active",
  "Inactive",
  "Under Maintenance",
  "Decommissioned",
  "Lost",
  "In Repair",
  "New",
  "Retired",
];

// For each global location, come up with a number of total assets that would be "seen" there, ranging from 150 to 3000
export const globalAssetCounts = globalLocations.map((loc) => {
  const randomAssetCount = () => {
    const [min, max] = globalLocAssetCountsMinMax;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  const count = randomAssetCount();
  return { location: loc.city, coords: loc.coords, count };
});
