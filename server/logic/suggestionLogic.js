const Top = require('../models/Top');
const Bottom = require('../models/Bottom');
const Outerwear = require('../models/Outerwear');

const getRandomItem = (items) => {
  if (!items || items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
};

const getOutfitSuggestion = async (weatherData, style, gender) => {
  const suggestion = {
    outfit_name: 'Outfit Suggestion',
    outfits: [],
    accessories: [],
    additional_recommendations: [],
  };

  const temp = parseInt(weatherData.temp_celsius || 25, 10);
  const wind = parseInt(weatherData.wind_kph || 0, 10);
  const precipitation_chance = parseInt(weatherData.precipitation_chance || 0, 10);
  const humidity_percent = parseInt(weatherData.humidity_percent || 50, 10);
  const aqi = parseInt(weatherData.aqi || 0, 10);
  const condition = weatherData.condition;

  let advisoryReason = null;
  if (temp > 45) { advisoryReason = "Extreme heat with temperatures above 45°C."; }
  else if (temp < 5) { advisoryReason = "Extreme cold with temperatures below 5°C."; }
  else if (wind > 60) { advisoryReason = "Extreme wind speeds over 60 km/h."; }
  else if (aqi === 5) { advisoryReason = "Hazardous air quality."; }
  else if (['Thunderstorm', 'Tornado', 'Squall'].includes(condition)) { advisoryReason = `Severe weather condition: ${condition}.`;}

  if (advisoryReason) {
    suggestion.outfit_name = "Stay Home Advisory";
    suggestion.additional_recommendations.push({ type: 'Advisory', message: "Better to stay at Home" });
    suggestion.additional_recommendations.push({ type: 'Reason', message: advisoryReason });
    return suggestion;
  }
  
  const baseQuery = {
    style: new RegExp('^' + style + '$', 'i'), 
    gender: { $in: [gender, 'unisex'] },
    temp_min: { $lte: temp },
    temp_max: { $gte: temp },
  };

  const matchingTops = await Top.find(baseQuery);
  const matchingBottoms = await Bottom.find(baseQuery);
  const top = getRandomItem(matchingTops);
  const bottom = getRandomItem(matchingBottoms);
  
  if (!top || !bottom) {
    suggestion.outfit_name = "No Complete Outfit Found";
    suggestion.additional_recommendations.push({ type: 'Info', message: 'Could not find a suitable top and bottom in the database for the current weather and style.' });
    return suggestion;
  }
  suggestion.outfits.push({ name: top.name, image_url: top.image_url });
  suggestion.outfits.push({ name: bottom.name, image_url: bottom.image_url });
  
  let outerwear = null;
  const outerwearBaseQuery = { style: new RegExp('^' + style + '$', 'i'), gender: { $in: [gender, 'unisex'] } };
  let matchingOuterwear = [];
  if (precipitation_chance > 70) {
    matchingOuterwear = await Outerwear.find({ ...outerwearBaseQuery, is_waterproof: true });
  } else if (temp < 10) {
    matchingOuterwear = await Outerwear.find({ ...outerwearBaseQuery, weight: 'heavy' });
  } else if (wind > 37) {
    matchingOuterwear = await Outerwear.find({ ...outerwearBaseQuery, is_windproof: true });
  } else if (temp < 16) {
    matchingOuterwear = await Outerwear.find({ ...outerwearBaseQuery, weight: { $in: ['light', 'medium'] } });
  }
  
  outerwear = getRandomItem(matchingOuterwear);
  if (outerwear) {
    suggestion.outfits.push({ name: outerwear.name, image_url: outerwear.image_url });
  }
  if (precipitation_chance >= 31 && precipitation_chance <= 70) {
    suggestion.accessories.push({
      name: 'Umbrella',
      image_url: 'https://thumbs.dreamstime.com/b/black-male-umbrella-black-male-automatic-umbrella-isolated-white-115350875.jpg'
    });
  }

  if (humidity_percent > 80) {
    suggestion.additional_recommendations.push({ type: 'Comfort Tip', message: 'Humidity is very high. Stick to breathable fabrics and be sure to drink plenty of water to stay hydrated.' });
  } else if (humidity_percent >= 60 && humidity_percent <= 80) {
    suggestion.additional_recommendations.push({ type: 'Comfort Tip', message: "It's quite humid. Breathable fabrics are a good choice." });
  } else if (humidity_percent < 30) {
    suggestion.additional_recommendations.push({ type: 'Comfort Tip', message: 'The air is very dry. Consider using moisturizer.' });
  }

  if (aqi >= 4) {
    suggestion.accessories.push({
      name: 'Face Mask',
      image_url: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQH54r3sS07TGGvkqR-3zpKJ_0f2QFDbXqqgJSNJl1okANyaCfrJpP7Jhy8pTsoP7DUYsXR-SAdMy-wCoQIHc1KvOaXUtOVK4erTGqjIfzCFPZhAgr3wHGV5w'
    });
  }
  let outfitName = `${style.charAt(0).toUpperCase() + style.slice(1)} Outfit for `;
  if (temp > 28) outfitName += 'a Warm Day';
  else if (temp < 16) outfitName += 'a Cold Day';
  else outfitName += 'a Mild Day';

  if (precipitation_chance > 70) outfitName += ' (Rainy)';
  else if (wind > 37) outfitName += ' (Windy)';
  
  suggestion.outfit_name = outfitName;
  return suggestion;
};

module.exports = { getOutfitSuggestion };