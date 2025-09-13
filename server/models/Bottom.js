const mongoose = require('mongoose');

const bottomSchema = mongoose.Schema({
  name: { type: String, required: true },
  style: {
    type: String,
    required: true,
    enum: ['casual', 'party', 'sporty', 'formal'], 
  },
  gender: { type: String, required: true, enum: ['male', 'female', 'unisex'] },
  temp_min: { type: Number, required: true },
  temp_max: { type: Number, required: true },
  weight: { 
    type: String,
    enum: ['light', 'medium', 'heavy'],
  },
  is_waterproof: { type: Boolean, default: false },
  fabric: { type: String, default: 'cotton' },
  image_url: { type: String, default: '/images/default.png' },
});

module.exports = mongoose.model('Bottom', bottomSchema);