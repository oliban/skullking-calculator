document.addEventListener('DOMContentLoaded', () => {
    const numPlayersSelect = document.getElementById('num-players');
    const scoreTable = document.getElementById('score-table');
    const tableHead = scoreTable.querySelector('thead tr');
    const tableBody = scoreTable.querySelector('tbody');
    const totalScoreRow = document.getElementById('total-score-row');
    const roundCountDisplay = document.getElementById('round-count-display');

    let numPlayers = parseInt(numPlayersSelect.value);
    let numRounds = 8; // Default, will be updated

    function getNumberOfRounds(players) {
        if (players <= 4) return 8;
        if (players === 5) return 7;
        if (players === 6) return 6;
        return 8; // Default fallback
    }

    const pirateNames = [
        "Svartskägg", "Kapten Krok", "Skräck-Roberts", "Blod-Jack", "Stormöga Stina",
        "Envoyé Erik", "Järn-Jenny", "Guld-Gustav", "Röda Rakel", "Pesten Petter",
        "Havs-Hanna", "Dödskalle-Danne", "Blixt-Berit", "Kölhalar-Kalle", "Salta Sara",
        "Mördar-Mats", "Våghals-Vera", "Tjär-Torsten", "Skräckens Sigrid", "Enögda Einar"
    ];

    function getRandomPirateName(existingNames) {
        const availableNames = pirateNames.filter(name => !existingNames.includes(name));
        if (availableNames.length === 0) return `Pirat ${existingNames.length + 1}`; // Fallback if we run out
        const randomIndex = Math.floor(Math.random() * availableNames.length);
        return availableNames[randomIndex];
    }

    function initializeTable() {
        // Clear existing table content
        tableHead.innerHTML = '<th>Runda</th>';
        tableBody.innerHTML = '';
        totalScoreRow.innerHTML = '<td>Total</td>';

        numPlayers = parseInt(numPlayersSelect.value);
        numRounds = getNumberOfRounds(numPlayers);
        roundCountDisplay.textContent = numRounds; // Update round display

        // Create player headers
        let assignedNames = [];
        for (let i = 1; i <= numPlayers; i++) {
            const th = document.createElement('th');
            th.contentEditable = true; // Make player names editable
            const defaultName = getRandomPirateName(assignedNames);
            assignedNames.push(defaultName);
            th.textContent = defaultName; // Assign random name
            th.addEventListener('blur', () => {
                th.textContent = th.textContent.trim();
                if (!th.textContent) {
                    // Find the original default name for this column if possible
                    // This is tricky as assignedNames isn't directly mapped to columns after edits
                    // Simple fallback: Reset to placeholder if empty
                     th.textContent = `Spelare ${i}`;
                }
            }); // Save on edit loss focus, prevent empty
            tableHead.appendChild(th);

            const tdTotal = document.createElement('td');
            tdTotal.id = `player-${i}-total`;
            tdTotal.textContent = '0';
            totalScoreRow.appendChild(tdTotal);
        }

        // Create rows for each round (up to the determined numRounds)
        for (let round = 1; round <= numRounds; round++) {
            const tr = document.createElement('tr');
            tr.id = `round-${round}`;
            const thRound = document.createElement('th');
            thRound.textContent = round;
            tr.appendChild(thRound);

            for (let player = 1; player <= numPlayers; player++) {
                const td = document.createElement('td');
                td.id = `r${round}-p${player}`;

                // Bid input
                const bidInput = document.createElement('input');
                bidInput.type = 'number';
                bidInput.id = `r${round}-p${player}-bid`;
                bidInput.min = '0';
                bidInput.placeholder = 'Bud';
                bidInput.title = 'Antal budade stick';
                bidInput.addEventListener('input', calculateScores);

                // Tricks won input
                const tricksInput = document.createElement('input');
                tricksInput.type = 'number';
                tricksInput.id = `r${round}-p${player}-tricks`;
                tricksInput.min = '0';
                tricksInput.placeholder = 'Stick';
                tricksInput.title = 'Antal vunna stick';
                tricksInput.addEventListener('input', calculateScores);

                // Bonus inputs
                const bonusDiv = document.createElement('div');
                bonusDiv.className = 'bonus-section';

                const mermaidLabel = document.createElement('label');
                mermaidLabel.textContent = 'M+SK:';
                mermaidLabel.title = 'Fångade Skull King med Sjöjungfru?';
                const mermaidCheckbox = document.createElement('input');
                mermaidCheckbox.type = 'checkbox';
                mermaidCheckbox.id = `r${round}-p${player}-mermaid`;
                mermaidCheckbox.title = 'Fångade Skull King med Sjöjungfru?';
                mermaidCheckbox.addEventListener('change', calculateScores);

                const pirateLabel = document.createElement('label');
                pirateLabel.textContent = 'SK+P x';
                pirateLabel.title = 'Antal pirater fångade med Skull King';
                const pirateSelect = document.createElement('select');
                pirateSelect.id = `r${round}-p${player}-pirates`;
                pirateSelect.title = 'Antal pirater fångade med Skull King';
                pirateSelect.addEventListener('change', calculateScores);
                for (let k = 0; k <= 6; k++) {
                    const option = document.createElement('option');
                    option.value = k;
                    option.textContent = k;
                    pirateSelect.appendChild(option);
                }

                // Score display
                const scoreDisplay = document.createElement('span');
                scoreDisplay.id = `r${round}-p${player}-score`;
                scoreDisplay.className = 'score-display';
                scoreDisplay.textContent = '0';

                bonusDiv.appendChild(mermaidLabel);
                bonusDiv.appendChild(mermaidCheckbox);
                bonusDiv.appendChild(pirateLabel);
                bonusDiv.appendChild(pirateSelect);

                td.appendChild(bidInput);
                td.appendChild(tricksInput);
                td.appendChild(scoreDisplay);
                td.appendChild(bonusDiv);
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        }
        // Initial calculation
        calculateScores();
    }

    function calculateScores() {
        const playerTotals = Array(numPlayers + 1).fill(0); // Index 0 unused

        // Use the current numRounds determined by initializeTable
        for (let round = 1; round <= numRounds; round++) {
            for (let player = 1; player <= numPlayers; player++) {
                const bidInput = document.getElementById(`r${round}-p${player}-bid`);
                const tricksInput = document.getElementById(`r${round}-p${player}-tricks`);
                const mermaidCheckbox = document.getElementById(`r${round}-p${player}-mermaid`);
                const pirateInput = document.getElementById(`r${round}-p${player}-pirates`);
                const scoreDisplay = document.getElementById(`r${round}-p${player}-score`);

                // Ensure elements exist before trying to access value
                if (!bidInput || !tricksInput || !mermaidCheckbox || !pirateInput || !scoreDisplay) continue;

                const bid = parseInt(bidInput.value);
                const tricksWon = parseInt(tricksInput.value);
                const mermaidCapturesSK = mermaidCheckbox.checked;
                const piratesCapturedBySK = parseInt(pirateInput.value) || 0; // Get value from select

                let roundScore = 0;

                // Only calculate if both bid and tricks are entered
                if (!isNaN(bid) && !isNaN(tricksWon)) {
                    if (bid === tricksWon) {
                        // Correct bid
                        if (bid === 0) {
                            roundScore = round * 10;
                        } else {
                            roundScore = bid * 20;
                        }
                        // Add bonuses only if bid was correct
                        if (mermaidCapturesSK) {
                            roundScore += 50;
                        }
                        roundScore += piratesCapturedBySK * 30;
                    } else {
                        // Incorrect bid
                        if (bid === 0) {
                            // Bid zero but took tricks
                            roundScore = round * -10; // Updated based on rules image: -10 per trick difference (so round * -10 for 0 bid)
                        } else {
                            // Bid > 0 but missed
                            const difference = Math.abs(bid - tricksWon);
                            roundScore = difference * -10;
                        }
                    }
                } else {
                    roundScore = 0; // Reset score if inputs are invalid/missing
                }

                scoreDisplay.textContent = roundScore;
                playerTotals[player] += roundScore;
            }
        }

        // Update total scores
        for (let player = 1; player <= numPlayers; player++) {
            const totalCell = document.getElementById(`player-${player}-total`);
             if (totalCell) { // Check if cell exists
                totalCell.textContent = playerTotals[player];
            }
        }
    }

    // Event listener for player count change
    numPlayersSelect.addEventListener('change', initializeTable);

    // Initialize the table on page load
    initializeTable();
}); 