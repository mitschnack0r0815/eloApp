const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  playerName: {
    type: String,
    trim: true,
  },
  createDate: Date,
  elo: Number,
  active: Boolean
});

module.exports = mongoose.model('Player', playerSchema);