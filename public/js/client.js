let nPlayerCount = 0;
let avaiablePlayer;

//-----------------Elo calc-------------------------

// Calculate Elo changes based on placings
function calculateEloChanges(placings, ratings) {
  const N = placings.length; // Total number of players
  const K = 32; // K-factor, adjust as needed

  // Calculate Elo changes for each player
  const eloChanges = [];
  for (let i = 0; i < N; i++) {
    const rating = ratings[i];
    const placing = placings[i];
    const expectedScore = calculateExpectedScore(ratings, placings, i);
    const actualScore = calculateActualScore(placing, N);
    const eloChange = calculateEloChange(rating, expectedScore, actualScore, K);
    eloChanges.push(eloChange);
  }
  
  return eloChanges;
}

// Calculate expected score for a player based on the ratings and placings
function calculateExpectedScore(ratings, placings, playerIndex) {
  const N = placings.length;
  let expectedScore = 0;
  
  for (let i = 0; i < N; i++) {
    if (i === playerIndex) continue;
    
    const ratingDiff = ratings[i] - ratings[playerIndex];
    const expectedResult = 1 / (1 + Math.pow(10, ratingDiff / 400));
    expectedScore += expectedResult;
  }
  
  return expectedScore / (N - 1);
}

// Calculate actual score for a player based on their placing
function calculateActualScore(placing, N) {
  return (N - placing) / (N - 1);
}

// Calculate Elo change for a player based on their rating, expected score, actual score, and K-factor
function calculateEloChange(rating, expectedScore, actualScore, K) {
  return Math.round(K * (actualScore - expectedScore));
}

// // Example usage
// // Define initial Elo ratings for each player
// const ratings = [1600, 1500, 1400, 1100]; // Example ratings, replace with actual values
// const placings = [1, 2, 3, 4]; // Example placings, replace with actual placings
// const eloChanges = calculateEloChanges(placings, ratings);
// console.log(eloChanges); // Output: Array of Elo changes for each player

function calculateElo(playerA, playerB, result) {
    const kFactor = 32; // The K-factor determines the impact of each game result on the players' ratings
  
    const expectedScoreA = 1 / (1 + Math.pow(10, (playerB - playerA) / 400));
    const expectedScoreB = 1 / (1 + Math.pow(10, (playerA - playerB) / 400));
  
    const newRatingA = playerA + kFactor * (result - expectedScoreA);
    const newRatingB = playerB + kFactor * ((1 - result) - expectedScoreB);
  
    return [newRatingA, newRatingB];
}

//-------------------Events & setup---------------------------

function gameSetup()
{
    document.addEventListener('DOMContentLoaded', () => {
        /* Player win radio boxes */
        const checkPlayerWinBoxes = document.querySelectorAll('input[name="checkPlayerWin"]');

        checkPlayerWinBoxes.forEach((radio) => {
            radio.addEventListener('change', (event) => {
                const playerName = document.getElementById('playerDropdown' + event.target.value).value;
                console.log(playerName);

                const player1Rating = Number(document.getElementById('playerDropdown1Elo').innerText);
                const player2Rating = Number(document.getElementById('playerDropdown2Elo').innerText);
                /* had to switch 1 and 0 logic */
                const result = (Number(event.target.value) - 1) == 0 ? 1 : 0; // Result can be 0 (loss), 0.5 (draw), or 1 (win)

                const [newRating1, newRating2] = calculateElo(player1Rating, player2Rating, result);

                document.getElementById('player1Change').value = Math.round(newRating1);
                document.getElementById('player2Change').value = Math.round(newRating2);

                console.log(`Player A's new rating: ${newRating1}`);
                console.log(`Player B's new rating: ${newRating2}`);
            });
        });

        const playerCount = document.getElementById('playerCount');
        playerCount.addEventListener('input', () => {
            const inputValue = playerCount.value;
            const regex = /^[2-9]$/;

            console.log("playerCount: " + inputValue);
            if (!regex.test(inputValue)) {
                playerCount.value = '';
                console.log("Number outside of " + regex);
            } else {
                nPlayerCount = inputValue;
            }
        });
    });
}

async function addRows() 
{
    var iterationsInput = document.getElementById('playerCount');
    var iterations = parseInt(iterationsInput.value);

    var playerCountContainer = document.querySelector('.playerCount-container');
    playerCountContainer.innerHTML = '';
    playerCountContainer.id = 'playerCount-container';

    for (var i = 1; i <= iterations; i++) {
        var formPlayer = document.createElement('div');
        formPlayer.className = 'row mb-0 sortable-row drag-me';
        formPlayer.setAttribute('data-id', i );

        var row = document.createElement('div');
        row.className = 'row mb-2';

        /* select col */
        var col1 = document.createElement('div');
        col1.className = 'col-sm-5';
        /* select */
        var select = document.createElement('select');
        select.id = `playerDropdown${i}`;
        select.name = `playerDropdown${i}`;
        col1.appendChild(select);
        /* option */
        var option = document.createElement('option');
        option.value = '-';
        option.innerText = '-';
        select.appendChild(option);
        /* for each player option */
        await fetch('/models')
            .then(response => response.json())
            .then(players => {
                players.forEach(player => {
                    console.log(player);
                    // Perform operations on each model here
                    var option = document.createElement('option');
                    option.value = player.playerName;
                    option.innerText = player.playerName;
                    select.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });

        /* elo col */   
        var col2 = document.createElement('div');
        col2.className = 'col-sm-2';
        col2.id = `playerDropdown${i}Elo`;

        /* Place or winner */
        var col3 = document.createElement('div');
        col3.className = 'col-sm-1';
        col3.id = `player${i}Rank`;

        /* new elo */
        var col4 = document.createElement('input');
        col4.className = 'col-sm-3';
        col4.id = `player${i}Change`;
        col4.name = `playerChange${i}`;
        col4.value = '0'
        col4.readOnly = true;
        col4.style.outline = 'none'
        // var inputElo = document.createElement('div');
        // inputElo.name = `playerChange${i}`;
        // inputElo.id = `player${i}Changes`;
        // inputElo.className = 'col-sm-12';
        // inputElo.type = 'text';
        // inputElo.readOnly = true;
        // inputElo.placeholder = '0';
        // col4.appendChild(inputElo);

        playerCountContainer.appendChild(formPlayer);
        formPlayer.appendChild(row);
        row.appendChild(col3);
        row.appendChild(col1);
        row.appendChild(col2);
        row.appendChild(col4);
    }

    /* Player dropdown */
    const playerDropdown = document.querySelectorAll('select[name^="playerDropdown"]');

    playerDropdown.forEach((dropdown) => {
        dropdown.addEventListener('change', (event) => {
            const playerElo = document.getElementById(dropdown.value + '_elo');
            const playerEloDiv = document.getElementById(dropdown.id + 'Elo');
            playerEloDiv.innerHTML = playerElo.innerText;

            console.log(dropdown.id + 'Elo' + ' - ' + dropdown.value + ' - ' + playerElo.innerText);
        });
    });

    let sortedList = Sortable.create(document.getElementById('playerCount-container'), {
        animation: 150,
        onEnd: function (evt) {
            // Callback when a row is dropped in a new position
            console.log('Moved row:', evt.item.textContent);

            var ratingsPlaced = [];
            var sortedPlaceList = [];
            var listOrder = sortedList.toArray(function (item) {
                return item.getAttribute('data-id');
            });
            //console.log(listOrder);

            listOrder.forEach((place, index) => {
                let playerName = document.getElementById('playerDropdown' + place).value;
                let playerElo = document.getElementById('playerDropdown' + place + 'Elo').innerText;
                //console.log(`Index: ${index}, Player: ${playerName}, Elo: ${playerElo}`);

                sortedPlaceList.push(index + 1);
                ratingsPlaced.push(playerElo);
            });

            const eloChanges = calculateEloChanges(sortedPlaceList, ratingsPlaced);
            //console.log(eloChanges + ' - ' + listOrder);

            let eloInput = document.getElementById(`eloInput`);
            eloInput.value = 'x';

            for (var i = 0; i < listOrder.length; i++) {    
                console.log(`player${listOrder[i]} gets ${eloChanges[i]}`);            
                let newElo = document.getElementById(`player${listOrder[i]}Change`);
                newElo.value = eloChanges[i];

                let newRank = document.getElementById(`player${listOrder[i]}Rank`);
                newRank.innerText = i +1;

                //let eloInput = document.getElementById(`eloInput`);
                eloInput.value = eloInput.value + ';' + eloChanges[i];
            }
        }
    });
}

function reloadPage() 
{
    location.reload();
}

