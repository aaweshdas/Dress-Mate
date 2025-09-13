const { getOutfitSuggestion } = require('../logic/suggestionLogic');
const axios = require('axios');

const getSuggestion = async (req, res) => {
  const { style, gender, lat, lon, temp_celsius, condition } = req.query;
  if (!style || !gender) {
    return res.status(400).json({ message: 'Style and gender parameters are required' });
  }
  let weatherData = {};
  if (lat && lon) {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
      const geoResponse = await axios.get(geoUrl);
      const locationName = geoResponse.data[0] ? geoResponse.data[0].name : "Unknown Location";
      const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&appid=${apiKey}`;
      const weatherResponse = await axios.get(oneCallUrl);
      const { current, hourly } = weatherResponse.data;
      const airQualityResponse = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
      const aqi = airQualityResponse.data.list[0].main.aqi;

      weatherData = {
        location: locationName,
        temp_celsius: Math.round(current.temp),
        condition: current.weather[0].main,
        wind_kph: Math.round(current.wind_speed * 3.6),
        humidity_percent: current.humidity,
        precipitation_chance: Math.round((hourly[0].pop || 0) * 100),
        aqi: aqi,
      };
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch external weather data" });
    }
  } else if (temp_celsius && condition) {
    weatherData = {
      location: 'Manual Input',
      temp_celsius: req.query.temp_celsius,
      condition: req.query.condition,
      wind_kph: req.query.wind_kph || 0,
      humidity_percent: req.query.humidity_percent || 50,
      precipitation_chance: req.query.precipitation_chance || 0,
      aqi: req.query.aqi || 40,
    };
  } 
  else {
    return res.status(400).json({ message: 'Provide either lat/lon for auto mode or manual weather metrics' });
  }
  
  const suggestion = await getOutfitSuggestion(weatherData, style, gender);
  res.status(200).json({ weather: weatherData, suggestion });
};

module.exports = { getSuggestion };