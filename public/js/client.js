 
function calculateElo(playerA, playerB, result) {
    const kFactor = 32; // The K-factor determines the impact of each game result on the players' ratings
  
    const expectedScoreA = 1 / (1 + Math.pow(10, (playerB - playerA) / 400));
    const expectedScoreB = 1 / (1 + Math.pow(10, (playerA - playerB) / 400));
  
    const newRatingA = playerA + kFactor * (result - expectedScoreA);
    const newRatingB = playerB + kFactor * ((1 - result) - expectedScoreB);
  
    return [newRatingA, newRatingB];
}

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

        /* Player dropdown */
        const playerDropdown = document.querySelectorAll('select[name^="playerDropdown"]');

        playerDropdown.forEach((dropdown) => {
            dropdown.addEventListener('change', (event) => {
                const playerElo = document.getElementById(dropdown.value + '_elo');
                const playerEloDiv = document.getElementById(dropdown.id + 'Elo');
                playerEloDiv.innerHTML = playerElo.innerText;

                console.log(dropdown.value + ' - ' + playerElo.innerText);
            });
        });
    });
}