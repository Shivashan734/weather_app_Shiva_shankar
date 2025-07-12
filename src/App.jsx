import React, { useState, useEffect } from "react";
import { fetchWeather } from "./api/fetchWeather";
import { messaging, getToken, onMessage } from "./firebase";

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [cityName, setCityName] = useState("");
  const [error, setError] = useState(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Geolocation + default city
  useEffect(() => {
    const savedSearches =
      JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(savedSearches);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchData({ lat: latitude, lon: longitude });
        },
        (error) => {
          console.error("Geolocation error:", error.message);
          fetchData("Paris");
        }
      );
    } else {
      console.warn("Geolocation not supported");
      fetchData("Paris");
    }
  }, []);

  useEffect(() => {
    const syncQueuedSearch = () => {
      const queuedCity = localStorage.getItem("queuedCity");
      if (queuedCity) {
        fetchData(queuedCity);
        localStorage.removeItem("queuedCity");
        alert(`You're back online! Showing weather for "${queuedCity}"`);
      }
    };
  
    window.addEventListener("online", syncQueuedSearch);
    return () => window.removeEventListener("online", syncQueuedSearch);
  }, []);  

  // FCM Setup with manual service worker registration
  useEffect(() => {
    if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw-custom.js") // ✅ updated
      .then((registration) => {
        console.log("✅ FCM SW registered:", registration);

        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            getToken(messaging, {
              vapidKey: "BM5mWJfoEqNdEoETP0FMLOVWjSy026VHtBnrQKLmh6dWQL2-_lvTyfQmva-VQ5Lx3NuYIwHMz5P-KmjJvvVOBrk",
              serviceWorkerRegistration: registration,
            })
              .then((currentToken) => {
                if (currentToken) {
                  console.log("🎯 FCM Token:", currentToken);
                } else {
                  console.warn("⚠️ No FCM token received.");
                }
              })
              .catch((err) =>
                console.error("❌ Error getting FCM token:", err)
              );
          }
        });

        onMessage(messaging, (payload) => {
          alert(`${payload.notification.title}\n${payload.notification.body}`);
        });
      })
      .catch((err) => {
        console.error("❌ Service worker registration failed:", err);
      });
    }
  }, []);

  const fetchData = async (input) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(input);
      setWeatherData(data);
      setCityName("");

      if (typeof input === "string") {
        updateRecentSearches(data.location.name);
      }
    } catch (error) {
      setError("City not found or location issue. Try again.");
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (!navigator.onLine) {
        // User is offline – store city
        localStorage.setItem("queuedCity", cityName);
        alert("You're offline! The city will be searched once you're back online.");
      } else {
        fetchData(cityName);
      }
    }
  };  

  const updateRecentSearches = (city) => {
    const updatedSearches = [
      city,
      ...recentSearches.filter((c) => c !== city),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const handleRecentSearch = (city) => {
    setCityName(city);
    fetchData(city);
  };

  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius);
  };

  const getTemperature = () => {
    if (!weatherData) return "";
    return isCelsius
      ? `${weatherData.current.temp_c} °C`
      : `${weatherData.current.temp_f} °F`;
  };

  return (
    <div>
      <div className="app">
        <h1>Weather App</h1>
        <div className="search">
          <input
            type="text"
            placeholder="Enter city name..."
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>
        <div className="unit-toggle">
          <span>°C</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={!isCelsius}
              onChange={toggleTemperatureUnit}
            />
            <span className="slider round"></span>
          </label>
          <span>°F</span>
        </div>
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        {weatherData && (
          <div className="weather-info">
            <h2>
              {weatherData.location.name}, {weatherData.location.region},{" "}
              {weatherData.location.country}
            </h2>
            <p>Temperature: {getTemperature()}</p>
            <p>Condition: {weatherData.current.condition.text}</p>
            <img
              src={weatherData.current.condition.icon}
              alt={weatherData.current.condition.text}
            />
            <p>Humidity: {weatherData.current.humidity}%</p>
            <p>Pressure: {weatherData.current.pressure_mb} mb</p>
            <p>Visibility: {weatherData.current.vis_km} km</p>
          </div>
        )}
        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <h3>Recent Searches</h3>
            <ul>
              {recentSearches.map((city, index) => (
                <li key={index} onClick={() => handleRecentSearch(city)}>
                  {city}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
