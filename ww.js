const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "343c1fa74e6baba2b7f459fa2a25e4d9"; // OpenWeatherMap API Key

// Function to create weather cards
const createWeatherCard = (cityName, weatherItem, index) => {
    const date = weatherItem.dt_txt.split(" ")[0];
    const temp = (weatherItem.main.temp - 273.15).toFixed(2);
    const wind = weatherItem.wind.speed;
    const humidity = weatherItem.main.humidity;
    const icon = weatherItem.weather[0].icon;
    const description = weatherItem.weather[0].description;

    if (index === 0) { // Main Weather Card
        return `
            <div class="details">
                <h2>${cityName} (${date})</h2>
                <h6>Temperature: ${temp}°C</h6>
                <h6>Wind: ${wind} M/S</h6>
                <h6>Humidity: ${humidity}%</h6>
            </div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="weather-icon">
                <h6>${description}</h6>
            </div>
        `;
    } else { // Weather Forecast Cards
        return `
            <li class="card">
                <h3>(${date})</h3>
                <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="weather-icon">
                <h6>Temp: ${temp}°C</h6>
                <h6>Wind: ${wind} M/S</h6>
                <h6>Humidity: ${humidity}%</h6>
            </li>
        `;
    }
};

// Function to get weather details
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            if (!data.list) throw new Error("No weather data found!");

            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            // Clear old data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            // Generate and display weather cards
            fiveDaysForecast.forEach((weatherItem, index) => {
                const html = createWeatherCard(cityName, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};

// Function to get city coordinates
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return alert("Please enter a city name!");

    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};

// Function to get user coordinates
const getUserCoordinates = () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser!");
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(API_URL)
                .then(response => response.json())
                .then(data => {
                    if (!data.length) return alert("Location data not found!");
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("An error occurred while fetching the city name!");
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please enable location access.");
            } else {
                alert("An error occurred with geolocation request.");
            }
        }
    );
};

// Event Listeners
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
