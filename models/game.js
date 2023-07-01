const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  createDate: Date,
  player:  Array,
  elo:    Array,
  newElo: Array,
  comment: String
});

module.exports = mongoose.model('Game', gameSchema);