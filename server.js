const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/weather', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/weather/:city', async (req, res) => {
    const cityName = req.params.city;
    try {
        const apiKey = '067e190178379e3350e93e4b85ae2185';

        // Fetch weather data
        const weatherResponse = await axios.get(
            `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
        );
        const weatherData = weatherResponse.data;

        // Fetch air pollution data
        const airPollutionResponse = await axios.get(
            `http://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}`
        );
        const airPollutionData = airPollutionResponse.data.list[0].main;

        // Check if the responses have the expected structure
        if (weatherData.coord && airPollutionData) {
            const latitude = weatherData.coord.lat;
            const longitude = weatherData.coord.lon;
            const temperatureCelsius = weatherData.main.temp - 273.15;

            res.json({
                weather: {
                    description: weatherData.weather[0].description,
                    temperature: temperatureCelsius,
                    coordinates: { latitude, longitude },
                },
                airPollution: {
                    aqi: airPollutionData.aqi,
                },
            });
        } else {
            res.status(500).json({ error: 'Invalid response from OpenWeatherMap API' });
        }
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json({ error: error.response.statusText });
        } else {
            res.status(500).json({ error: 'Error fetching weather data' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/weather`);
});
