const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  createDate: Date,
  player1:  String,
  player2:  String,
  p1Elo:    Number,
  p2Elo:    Number,
  winner:   String
});

module.exports = mongoose.model('Game', gameSchema);