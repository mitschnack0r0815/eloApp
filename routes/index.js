var express = require('express');
var Task = require('../models/task');
var Player = require('../models/player');
var Game = require('../models/game');

var router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  try {
    const availablePlayer = await Player.find({ active: true });
    const currentTasks = await Task.find({ completed: null });

    console.log(`Active player: ${availablePlayer.length} Current Tasks: ${currentTasks.length}`);
    res.render('index', { currentTasks: currentTasks, availablePlayer: availablePlayer });
  } catch (err) {
    console.log(err);
    res.send('Sorry! Something went wrong.');
  }
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

router.post('/addPlayer', function(req, res, next) {
  const playerName = req.body.playerName;
  const createDate = Date.now();
  
  var player = new Player({
    playerName: playerName,
    createDate: createDate,
    elo: 1500,
    active: true
  });
  console.log(`Adding a new Player ${playerName} - createDate ${createDate}`)

  player.save()
      .then(() => { 
        console.log(`Added new Player ${playerName} - createDate ${createDate}`)        
        res.redirect('/'); })
      .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong.');
      });
});

router.post('/addGame', function(req, res, next) {
  const createDate = Date.now();
  const player1 = req.body.dropdown1;
  const player2 = req.body.dropdown2;
  const p1Elo = 123;
  const p2Elo = 321;
  const winner = req.body.option;
  
  var game = new Game({
    createDate: createDate,
    player1:  player1,
    player2:  player2,
    p1Elo:    p1Elo,
    p2Elo:    p2Elo,
    winner:   winner
  });

  game.save()
      .then(() => {      
        res.redirect('/'); })
      .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong.');
      });
});

//---------------------------------------------------------------------

module.exports = router;
