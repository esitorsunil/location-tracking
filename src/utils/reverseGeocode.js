export async function reverseGeocode(lat, lng) {
  const apiKey = 'd1ef2f5a15ae46dd87d047f301a8f30b';
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();
  return data.results[0]?.formatted || "Address not found";
}
