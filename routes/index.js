var express = require('express');
var Task = require('../models/task');
var Player = require('../models/player');
var Game = require('../models/game');

var router = express.Router();

function getDateID()
{
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const formattedDate = `${year}${month}${day}${hours}${minutes}${seconds}`;
  console.log(formattedDate); // Output: 20220510123615
  return formattedDate;
}

/* GET home page. */
router.get('/', async (req, res) => {
  try {
    const availablePlayer = await Player.find({ active: true });
    const playedGames = await Game.find();

    availablePlayer.sort((a, b) => b.elo - a.elo);

    console.log(`Active player: ${availablePlayer.length} Games: ${playedGames.length}`);
    res.render('index', { availablePlayer: availablePlayer, playedGames: playedGames });
  } catch (err) {
    console.log(err);
    res.send('Sorry! Something went wrong.');
  }
});

router.get('/models', async (req, res) => {
  // Retrieve models data from your database or any other source
  const availablePlayer = await Player.find({ active: true });

  res.json(availablePlayer);
});

//---------------------------------------------------------------------

router.post('/addPlayer', async (req, res) => {
  const playerName = req.body.playerName;
  const createDate = Date.now();
  
  try {
    const playerExists = await Player.find({ playerName: playerName });

    console.log(playerExists.length);

    if (playerExists.length >= 1) 
    {
      //console.log(err);
      /* TODO: player exists handle */
      res.send('Sorry! Player exists...');
    } else {
      var player = new Player({
        playerName: playerName,
        createDate: createDate,
        elo: 1500,
        active: true
      });
      console.log(`Adding a new Player ${playerName} - createDate ${createDate}`)
  
      player.save();
      res.redirect('/'); 
    }
    
  /*
  
      .then(() => { 
        console.log(`Added new Player ${playerName} - createDate ${createDate}`)        
        
      .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong.');
      });
      */

  } catch (err) {
    console.log(err);
    res.send('Sorry! Something went wrong.');
  }
});

router.post('/addGame', async (req, res) => {
  const createDate = getDateID();
  let playerNames = [];
  let playerElos = [];
  let playerElosUpdated = [];
  let comment = req.body.comment;

  Object.keys(req.body).forEach((key) => {
    //console.log(key);
    if (key.startsWith('playerDropdown')) {
      var value = req.body[key];
      playerNames.push(value);
    }

    if (key.startsWith('playerChange')) {
      var value = req.body[key];
      playerElos.push(value);
    }
  });


  for (let index = 0; index < playerElos.length; index++) {
    await Player.findOneAndUpdate(
      { playerName: playerNames[index] },
      { $inc: { elo: playerElos[index] } },
      { new: true } // Return the updated document
    ).then(updatedItem => {
      if (updatedItem) {
        // Access the updated value
        const updatedElo = Math.round(updatedItem.elo);
        playerElosUpdated.push(updatedElo);
      } else {
        console.log('Item not found');
      }
    }).catch(error => {
      console.error('Error:', error);
    });
  }
  console.log(playerNames + ' - ' + playerElos + ' - ' + playerElosUpdated);

  var game = new Game({
    createDate: createDate,
    player:  playerNames,
    elo:    playerElos,
    newElo: playerElosUpdated,
    comment: comment
  });

  game.save();
  res.redirect('/');

});

router.post('/gameDel', async (req, res) => {
  const { gameID } = req.body;
  const { playerArr } = req.body;
  const { playerEloArr } = req.body;

  console.log(playerArr);
  console.log(playerEloArr);

  for (let index = 0; index < playerArr.length; index++) {
    await Player.findOneAndUpdate(
      { playerName: playerArr[index] },
      { elo: playerEloArr[index] },
      { new: true }
    ).catch(error => {
      console.error('Error:', error);
    });
  }

  await Game.findOneAndDelete(
    { createDate: gameID }
  ).catch(error => {
    console.error('Error:', error);
    res.redirect('/');
  });

  res.redirect('/');
});

//---------------------------------------------------------------------

module.exports = router;
