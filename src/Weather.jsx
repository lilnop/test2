import React, { useState, useEffect, useCallback } from "react";
import PropTypes from 'prop-types';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Loader } from 'lucide-react';

const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

// Separate WeatherIcon component for better organization
const WeatherIcon = ({ condition }) => {
    switch (condition.toLowerCase()) {
        case "clear":
            return <Sun className="weather-icon sun" aria-label="Clear sky" />;
        case 'rain':
            return <CloudRain className="weather-icon rain" aria-label="Rain" />;
        case 'clouds':
            return <Cloud className="weather-icon cloud" aria-label="Cloudy" />;
        default:
            return <Sun className="weather-icon sun" aria-label="Default weather" />;
    }
};

WeatherIcon.propTypes = {
    condition: PropTypes.string.isRequired
};

function Weather() {
    const [city, setCity] = useState('Accra');
    const [weatherData, setWeatherData] = useState(null);
    const [temp, setTemp] = useState('celsius');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Memoized temperature conversion
    const convertTemp = useCallback((unit) => {
        if (temp === 'fahrenheit') {
            return ((unit * 9 / 5) + 32).toFixed(1);
        }
        return unit.toFixed(1);
    }, [temp]);

    const fetchWeather = async (cityName) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}?q=${cityName}&appid=${API_KEY}&units=metric`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("City not found. Please check the spelling and try again.");
                }
                throw new Error("Failed to fetch weather data. Please try again later.");
            }
            const data = await response.json();
            setWeatherData(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch weather on component mount and when city changes
    useEffect(() => {
        fetchWeather(city);
    }, []); // Empty dependency array means this runs once on mount

    const handleInput = (e) => {
        setCity(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (city.trim()) {
            fetchWeather(city);
        }
    };

    return (
        <section className="weather-section">
            <h1>Weather App</h1>
            <form onSubmit={handleSubmit} role="search">
                <input
                    type="text"
                    placeholder="Enter a city name..."
                    value={city}
                    onChange={handleInput}
                    aria-label="City name"
                />
                <button className='search-button' type="submit" aria-label="Search weather">
                    Search
                </button>
            </form>

            <div className="temperature-toggle" role="group" aria-label="Temperature unit selection">
                <button 
                    className={`temp-button ${temp === 'celsius' ? 'active' : ''}`}
                    onClick={() => setTemp("celsius")}
                    aria-pressed={temp === 'celsius'}
                >
                    °C
                </button>
                <button 
                    className={`temp-button ${temp === 'fahrenheit' ? 'active' : ''}`}
                    onClick={() => setTemp("fahrenheit")}
                    aria-pressed={temp === 'fahrenheit'}
                >
                    °F
                </button>
            </div>

            {loading && (
                <div className="loading-container" role="status">
                    <Loader size={200} color='#ef4444' />
                    <span className="sr-only">Loading weather data...</span>
                </div>
            )}

            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}

            {weatherData && !error && !loading && (
                <div className='container'>
                    <h2 className="city-name">{weatherData.name}, {weatherData.sys.country}</h2>
                    <div className="temperature">
                        <WeatherIcon condition={weatherData.weather[0].main} />
                        <span className="temperature-value">
                            {convertTemp(weatherData.main.temp)}°
                            {temp === 'celsius' ? 'C' : 'F'}
                        </span>
                    </div>
                    <div className='weather-description'>{weatherData.weather[0].description}</div>
                    <div className="weather">
                        <div className='weather-card'>
                            <Thermometer className='weather-icon' aria-hidden="true" />
                            <p className='weather-label'>Feels Like</p>
                            <p className='weather-value'>{convertTemp(weatherData.main.feels_like)}°{temp === 'celsius' ? 'C' : 'F'}</p>
                        </div>
                        <div className='weather-card'>
                            <Wind className='weather-icon' aria-hidden="true" />
                            <p className='weather-label'>Wind Speed</p>
                            <p className='weather-value'>{weatherData.wind.speed} m/s</p>
                        </div>
                        <div className='weather-card'>
                            <Cloud className='weather-icon' aria-hidden="true" />
                            <p className='weather-label'>Cloudiness</p>
                            <p className='weather-value'>{weatherData.clouds.all}%</p>
                        </div>
                        <div className='weather-card'>
                            <Droplets className='weather-icon' aria-hidden="true" />
                            <p className='weather-label'>Humidity</p>
                            <p className='weather-value'>{weatherData.main.humidity}%</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Weather;