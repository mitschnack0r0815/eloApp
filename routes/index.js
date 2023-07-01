var express = require('express');
var Task = require('../models/task');
var Player = require('../models/player');
var Game = require('../models/game');

var router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  try {
    const availablePlayer = await Player.find({ active: true });
    const playedGames = await Game.find();

    const currentTasks = await Task.find({ completed: null });

    console.log(`Active player: ${availablePlayer.length} Games: ${playedGames.length}`);
    res.render('index', { currentTasks: currentTasks, availablePlayer: availablePlayer, playedGames: playedGames });
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

router.post('/addTask', function(req, res, next) {
  const taskName = req.body.taskName;
  const createDate = Date.now();
  
  var task = new Task({
    taskName: taskName,
    createDate: createDate
  });
  console.log(`Adding a new task ${taskName} - createDate ${createDate}`)

  task.save()
      .then(() => { 
        console.log(`Added new task ${taskName} - createDate ${createDate}`)        
        res.redirect('/'); })
      .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong.');
      });
});

router.post('/completeTask', function(req, res, next) {
  console.log("I am in the PUT method")
  const taskId = req.body._id;
  const completedDate = Date.now();

  Task.findByIdAndUpdate(taskId, { completed: true, completedDate: Date.now()})
    .then(() => { 
      console.log(`Completed task ${taskId}`)
      res.redirect('/'); }  )
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});


router.post('/deleteTask', function(req, res, next) {
  const taskId = req.body._id;
  const completedDate = Date.now();
  Task.findByIdAndDelete(taskId)
    .then(() => { 
      console.log(`Deleted task $(taskId)`)      
      res.redirect('/'); }  )
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
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
  const createDate = Date.now();
  let playerNames = [];
  let playerElos = [];
  let playerElosUpdated = [];
  let comment = 'none';

  Object.keys(req.body).forEach((key) => {
    //console.log(key);
    if (key.startsWith('playerDropdown')) {
      var value = req.body[key];
      // Perform operations with the value
      console.log('Key: ' + key + ' Value: ' + value);

      playerNames.push(value);
    }

    if (key.startsWith('playerChange')) {
      var value = req.body[key];
      // Perform operations with the value
      console.log('Key: ' + key + ' Value: ' + value);

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

  // try {

  //   await Player.findOneAndUpdate(
  //     { playerName: player1 },
  //     { elo: p1Elo },
  //     { new: true } // Return the updated document
  //   );

  //   await Player.findOneAndUpdate(
  //     { playerName: player2 },
  //     { elo: p2Elo },
  //     { new: true } // Return the updated document
  //   );

  var game = new Game({
    createDate: createDate,
    player:  playerNames,
    elo:    playerElos,
    newElo: playerElosUpdated,
    comment: comment
  });

  game.save();
  res.redirect('/');

  // } catch (err) {
  //   console.log(err);
  //   res.send('Sorry! Something went wrong.');
  // }
});

//---------------------------------------------------------------------

module.exports = router;
