// import axios from "axios";

// const URL = "https://api.weatherapi.com/v1/current.json";
// const API_KEY = "b0a7bad410d5400c8c3145734251107";

// export const fetchWeather = async (cityName) => {
//     const { data } = await axios.get(URL, {
//         params: {
//             q: cityName,
//             key: API_KEY
//         }
//     })
//     return data;
// }

const API_KEY = "b0a7bad410d5400c8c3145734251107"; // replace with your real key

export const fetchWeather = async (queryOrCoords) => {
  let url = "";

  if (typeof queryOrCoords === "string") {
    // City name
    url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${queryOrCoords}`;
  } else if (
    typeof queryOrCoords === "object" &&
    queryOrCoords.lat &&
    queryOrCoords.lon
  ) {
    // Coordinates
    url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${queryOrCoords.lat},${queryOrCoords.lon}`;
  } else {
    throw new Error("Invalid query format");
  }

  console.log("Fetching URL:", url); // for debugging

  const response = await fetch(url);
  if (!response.ok) throw new Error("Weather API error");
  const data = await response.json();
  return data;
};
