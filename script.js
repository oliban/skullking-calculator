document.addEventListener('DOMContentLoaded', () => {
    const numPlayersSelect = document.getElementById('num-players');
    const scoreTable = document.getElementById('score-table');
    let tableHead = scoreTable.querySelector('thead');
    let tableBody = scoreTable.querySelector('tbody');

    if (!tableHead) {
        tableHead = document.createElement('thead');
        scoreTable.insertBefore(tableHead, scoreTable.firstChild);
    }
    if (!tableBody) {
        tableBody = document.createElement('tbody');
        scoreTable.appendChild(tableBody);
    }

    let headerRow = tableHead.querySelector('tr');
    if (!headerRow) {
        headerRow = document.createElement('tr');
        tableHead.appendChild(headerRow);
    }

    const roundCountDisplay = document.getElementById('round-count-display');
    const totalScoresDisplay = document.getElementById('total-scores-display');
    const totalScoreRow = document.getElementById('total-score-row');

    // --- Get New Game Buttons ---
    const newGameBtnTop = document.getElementById('new-game-btn-top');
    const newGameBtnBottom = document.getElementById('new-game-btn-bottom');

    let numPlayers = parseInt(numPlayersSelect.value);
    let numRounds = 8; // Default
    let playerInfo = {}; // Use object to store { name: "...", emoji: "..." }

    // --- ADD Unique Emojis ---
    const playerEmojis = [
        '☠️', '🐙', '🦜', '⚓', '⚔️', '🗺️', '👑', '💎', // Add more if needed
        '🦑', '🦀', '💰', '🧭', '💣', '🌴', '🌊', '⛵'
    ];

    function getUniqueEmoji(index) {
        // Return emoji based on index, loop around if more players than emojis
        return playerEmojis[index % playerEmojis.length];
    }

    function getNumberOfRounds(players) {
        if (players <= 4) return 8;
        if (players === 5) return 7;
        if (players === 6) return 6;
        return 8;
    }

    const pirateNames = [
        "Svartskägg", "Kapten Krok", "Skräck-Roberts", "Blod-Jack", "Stormöga Stina",
        "Envoyé Erik", "Järn-Jenny", "Guld-Gustav", "Röda Rakel", "Pesten Petter",
        "Havs-Hanna", "Dödskalle-Danne", "Blixt-Berit", "Kölhalar-Kalle", "Salta Sara",
        "Mördar-Mats", "Våghals-Vera", "Tjär-Torsten", "Skräckens Sigrid", "Enögda Einar"
    ];

    function getRandomPirateName(existingNames) {
        const availableNames = pirateNames.filter(name => !existingNames.includes(name));
        if (availableNames.length === 0) return `Pirat ${existingNames.length + 1}`;
        const randomIndex = Math.floor(Math.random() * availableNames.length);
        return availableNames[randomIndex];
    }

    function initializeTable(reusePlayers = false) {
        headerRow.innerHTML = '';
        tableBody.innerHTML = '';
        totalScoreRow.innerHTML = '';
        if (!reusePlayers) { // Only reset players if not reusing
             playerInfo = {};
        }

        numPlayers = parseInt(numPlayersSelect.value);
        numRounds = getNumberOfRounds(numPlayers);
        if (roundCountDisplay) {
             roundCountDisplay.textContent = numRounds;
        }

        // Create NEW header row based on sketch
        ['Runda', 'Spelare', 'Bud', 'Stick', 'Poäng', 'Bonus'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });

        // --- Get player names/emojis OR reuse them ---
        if (!reusePlayers) {
            let assignedNames = [];
            for (let i = 1; i <= numPlayers; i++) {
                const defaultName = getRandomPirateName(assignedNames);
                assignedNames.push(defaultName);
                playerInfo[i] = {
                    name: defaultName,
                    emoji: getUniqueEmoji(i - 1)
                };
            }
        } else {
            // Make sure we still only use players up to the current numPlayers setting
            // (In case user changed player count THEN clicked New Game)
            const currentValidPlayerIds = Object.keys(playerInfo).map(id => parseInt(id)).filter(id => id <= numPlayers);
            const newPlayerInfo = {};
            currentValidPlayerIds.forEach(id => {
                newPlayerInfo[id] = playerInfo[id];
            });
            playerInfo = newPlayerInfo; // Keep only relevant players
        }

        // Create rows: one row per player per round, using rowspan for Round
        for (let round = 1; round <= numRounds; round++) {
            for (let player = 1; player <= numPlayers; player++) {
                if (!playerInfo[player]) continue; // Skip if player was removed due to count change

                const tr = document.createElement('tr');
                tr.id = `r${round}-p${player}-row`;
                tr.classList.add(round % 2 === 0 ? 'round-group-even' : 'round-group-odd');

                // 1. Round Cell - ONLY add for the first player, with rowspan
                if (player === 1) {
                    const tdRound = document.createElement('td');
                    tdRound.textContent = round;
                    tdRound.rowSpan = numPlayers;
                    tdRound.classList.add('round-cell'); // Class for CSS targeting
                    tr.appendChild(tdRound);
                }

                // 2. Player Name Cell - Wrap content in a span
                const tdPlayer = document.createElement('td');
                tdPlayer.classList.add('player-name-cell'); // Keep class on TD

                const playerNameSpan = document.createElement('span'); // <<< Create SPAN
                playerNameSpan.classList.add('player-name-content'); // <<< Add class to SPAN
                if (playerInfo[player]) {
                    playerNameSpan.textContent = `${playerInfo[player].emoji} ${playerInfo[player].name}`;
                } else {
                    playerNameSpan.textContent = `Spelare ${player}`; // Fallback
                }
                tdPlayer.appendChild(playerNameSpan); // <<< Append SPAN to TD
                tr.appendChild(tdPlayer); // Append TD to TR

                // 3. Bid Cell (Select)
                const tdBid = document.createElement('td');
                const bidSelect = document.createElement('select');
                bidSelect.id = `r${round}-p${player}-bid`;
                bidSelect.title = `Spelare ${playerInfo[player].name} - Bud Runda ${round}`;
                bidSelect.addEventListener('change', calculateScores);
                const defaultBidOption = document.createElement('option');
                defaultBidOption.value = ""; defaultBidOption.textContent = "-"; defaultBidOption.disabled = true; defaultBidOption.selected = true;
                bidSelect.appendChild(defaultBidOption);
                for (let i = 0; i <= round; i++) {
                    const option = document.createElement('option'); option.value = i; option.textContent = i; bidSelect.appendChild(option);
                }
                tdBid.appendChild(bidSelect);
                tr.appendChild(tdBid);

                // 4. Tricks Cell (Select)
                const tdTricks = document.createElement('td');
                const tricksSelect = document.createElement('select');
                tricksSelect.id = `r${round}-p${player}-tricks`;
                tricksSelect.title = `Spelare ${playerInfo[player].name} - Stick Runda ${round}`;
                tricksSelect.addEventListener('change', calculateScores);
                const defaultTricksOption = document.createElement('option');
                defaultTricksOption.value = ""; defaultTricksOption.textContent = "-"; defaultTricksOption.disabled = true; defaultTricksOption.selected = true;
                tricksSelect.appendChild(defaultTricksOption);
                for (let i = 0; i <= round; i++) {
                    const option = document.createElement('option'); option.value = i; option.textContent = i; tricksSelect.appendChild(option);
                }
                tdTricks.appendChild(tricksSelect);
                tr.appendChild(tdTricks);

                // 5. Score Cell (Display)
                const tdScore = document.createElement('td');
                const scoreDisplay = document.createElement('span');
                scoreDisplay.id = `r${round}-p${player}-score`;
                scoreDisplay.className = 'score-display';
                scoreDisplay.textContent = '0';
                tdScore.appendChild(scoreDisplay);
                tr.appendChild(tdScore);

                // 6. Bonus Cell (Button)
                const tdBonus = document.createElement('td');
                const bonusButton = document.createElement('button');
                bonusButton.id = `r${round}-p${player}-bonus-btn`;
                bonusButton.className = 'bonus-button';
                bonusButton.textContent = 'Bonus';
                bonusButton.dataset.mermaid = 'false';
                bonusButton.dataset.pirates = '0';
                const currentName = playerInfo[player].name;
                bonusButton.addEventListener('click', () => openBonusModal(round, player, currentName, bonusButton));
                tdBonus.appendChild(bonusButton);
                tr.appendChild(tdBonus);

                tableBody.appendChild(tr);
            }
        }

        // --- Setup Footer Row based on NEW sketch ---
        totalScoreRow.innerHTML = ''; // Clear again just in case

        // 1. Create "Total" cell with rowspan (matching numPlayers conceptually)
        const tdTotalLabel = document.createElement('td');
        tdTotalLabel.textContent = 'Total';
        tdTotalLabel.rowSpan = numPlayers > 0 ? numPlayers : 1; // Set rowspan to match player count
        tdTotalLabel.classList.add('total-label-cell'); // Add class for styling
        totalScoreRow.appendChild(tdTotalLabel);

        // 2. Create ONE cell to hold all player scores (will span columns visually)
        // NOTE: This cell is added only ONCE, not in the player loop.
        // It seems the sketch implies the 'Total' cell spans vertically,
        // and the player scores are listed vertically next to it.
        // This requires a slightly different structure or interpretation.

        // ---- REVISED APPROACH for Footer based on visual sketch ----
        // We need multiple rows in the tfoot, or a single row with complex cell content.
        // Let's try a single row, where the second cell contains a list.

        totalScoreRow.innerHTML = ''; // Clear previous attempt

        const tdFooterTotal = document.createElement('td');
        tdFooterTotal.textContent = 'Total';
        // No rowspan needed if only one footer row
        totalScoreRow.appendChild(tdFooterTotal);

        const tdPlayerScores = document.createElement('td');
        // Span the remaining 5 columns (Spelare, Bud, Stick, Poäng, Bonus)
        tdPlayerScores.colSpan = 5;
        tdPlayerScores.id = 'player-totals-list-cell'; // ID for updating content
        totalScoreRow.appendChild(tdPlayerScores);

        // --- End Footer Setup ---

        calculateScores();
    }

    function openBonusModal(round, player, playerName, buttonElement) {
        const existingModal = document.getElementById('bonus-modal-dynamic');
        if (existingModal) existingModal.remove();

        const currentMermaid = buttonElement.dataset.mermaid === 'true';
        const currentPirates = parseInt(buttonElement.dataset.pirates || '0');

        const modal = document.createElement('div');
        modal.id = 'bonus-modal-dynamic';
        modal.className = 'bonus-modal';

        const header = document.createElement('h4');
        header.textContent = `Bonus: R${round} - ${playerName}`;
        modal.appendChild(header);

        // Mermaid Checkbox
        const mermaidDiv = document.createElement('div');
        const mermaidCheckbox = document.createElement('input');
        mermaidCheckbox.type = 'checkbox';
        mermaidCheckbox.id = `modal-r${round}-p${player}-mermaid`;
        mermaidCheckbox.checked = currentMermaid;
        mermaidCheckbox.addEventListener('change', () => {
            buttonElement.dataset.mermaid = mermaidCheckbox.checked ? 'true' : 'false';
            updateBonusButtonVisuals(buttonElement);
            calculateScores();
        });
        const mermaidLabel = document.createElement('label');
        mermaidLabel.htmlFor = mermaidCheckbox.id;
        mermaidLabel.textContent = ' M+SK (Sjöjungfru fångar SK)';
        mermaidDiv.appendChild(mermaidCheckbox);
        mermaidDiv.appendChild(mermaidLabel);
        modal.appendChild(mermaidDiv);

        // Pirate Select
        const pirateDiv = document.createElement('div');
        const pirateLabel = document.createElement('label');
        pirateLabel.htmlFor = `modal-r${round}-p${player}-pirates`;
        pirateLabel.textContent = 'SK+P x (Pirater fångade med SK): ';
        const pirateSelect = document.createElement('select');
        pirateSelect.id = `modal-r${round}-p${player}-pirates`;
        for (let k = 0; k <= 5; k++) { // Max 5 pirates
            const option = document.createElement('option');
            option.value = k; option.textContent = k;
            if (k === currentPirates) option.selected = true;
            pirateSelect.appendChild(option);
        }
        pirateSelect.addEventListener('change', () => {
            buttonElement.dataset.pirates = pirateSelect.value;
            updateBonusButtonVisuals(buttonElement);
            calculateScores();
        });
        pirateDiv.appendChild(pirateLabel);
        pirateDiv.appendChild(pirateSelect);
        modal.appendChild(pirateDiv);

        // Close Button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Stäng';
        closeButton.className = 'close-modal-btn';
        closeButton.addEventListener('click', () => modal.remove());
        modal.appendChild(closeButton);

        document.body.appendChild(modal);
    }

    function updateBonusButtonVisuals(buttonElement) {
        const hasMermaid = buttonElement.dataset.mermaid === 'true';
        const pirateCount = parseInt(buttonElement.dataset.pirates || '0');
        let bonusText = 'Bonus';
        let activeBonuses = [];
        if (hasMermaid) activeBonuses.push("M");
        if (pirateCount > 0) activeBonuses.push(`P:${pirateCount}`);
        if (activeBonuses.length > 0) {
            bonusText = activeBonuses.join('/');
            buttonElement.classList.add('has-bonus');
        } else {
            buttonElement.classList.remove('has-bonus');
        }
        buttonElement.textContent = bonusText;
    }

    function calculateScores() {
        const playerTotals = {};
        for (let i = 1; i <= numPlayers; i++) { playerTotals[i] = 0; }

        // --- Determine latest fully completed round ---
        let maxCompletedRound = 0;
        for (let r = 1; r <= numRounds; r++) {
            let roundComplete = true;
            for (let p = 1; p <= numPlayers; p++) {
                const bidSelect = document.getElementById(`r${r}-p${p}-bid`);
                const tricksSelect = document.getElementById(`r${r}-p${p}-tricks`);
                // Check if BOTH selects have a non-empty value for this player
                if (!bidSelect || !tricksSelect || bidSelect.value === "" || tricksSelect.value === "") {
                    roundComplete = false;
                    break; // No need to check other players for this round
                }
            }
            if (roundComplete) {
                maxCompletedRound = r;
            } else {
                break; // Stop checking rounds once an incomplete one is found
            }
        }
        // console.log("Max completed round:", maxCompletedRound); // For debugging

        // --- Calculate scores and totals ---
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const rowIdMatch = row.id.match(/r(\d+)-p(\d+)-row/);
            if (!rowIdMatch) return;
            const round = parseInt(rowIdMatch[1]);
            const player = parseInt(rowIdMatch[2]);
            const bidSelect = row.querySelector(`#r${round}-p${player}-bid`);
            const tricksSelect = row.querySelector(`#r${round}-p${player}-tricks`);
            const scoreDisplay = row.querySelector(`#r${round}-p${player}-score`);
            const bonusButton = row.querySelector(`#r${round}-p${player}-bonus-btn`); // Needed if recalculating

            if (!bidSelect || !tricksSelect || !scoreDisplay || !bonusButton) return;

            // --- Recalculate score here for consistency ---
            const bidValue = bidSelect.value;
            const tricksValue = tricksSelect.value;
            const bid = bidValue === "" ? NaN : parseInt(bidValue);
            const tricksWon = tricksValue === "" ? NaN : parseInt(tricksValue);
            const mermaidCapturesSK = bonusButton.dataset.mermaid === 'true';
            const piratesCapturedBySK = parseInt(bonusButton.dataset.pirates || '0');

            let roundScore = 0;
            if (!isNaN(bid) && !isNaN(tricksWon)) {
                 if (bid === tricksWon) {
                    roundScore = (bid === 0) ? round * 10 : bid * 20;
                    if (mermaidCapturesSK) roundScore += 50;
                    roundScore += piratesCapturedBySK * 30;
                } else {
                    roundScore = (bid === 0) ? round * -10 : Math.abs(bid - tricksWon) * -10;
                }
            }
            scoreDisplay.textContent = roundScore; // Update the score display
            // --- End Recalculation ---

            if (playerTotals.hasOwnProperty(player)) {
                playerTotals[player] += roundScore;
            }
        });

        // --- Determine "Usel" status after round 3 ---
        const isPlayerUsel = {}; // Store status { playerIndex: boolean }
        if (maxCompletedRound >= 3) {
            for (let i = 1; i <= numPlayers; i++) {
                // Condition: Total score is negative
                if (playerTotals[i] < 0) {
                     isPlayerUsel[i] = true;
                } else {
                     isPlayerUsel[i] = false;
                }
                 // Future enhancement: Check if last AND far behind non-negative players
            }
        } else {
            // Before round 3 is complete, no one is "usel"
             for (let i = 1; i <= numPlayers; i++) {
                isPlayerUsel[i] = false;
             }
        }

        // --- Apply/Remove Visual Effects on Table Rows ---
        rows.forEach(row => {
            const rowIdMatch = row.id.match(/r(\d+)-p(\d+)-row/);
            if (!rowIdMatch) return;
            const player = parseInt(rowIdMatch[2]);

            if (isPlayerUsel[player]) {
                row.classList.add('usel-effect');
            } else {
                row.classList.remove('usel-effect');
            }
        });

        // --- Assign Medals based on Total Scores ---

        // 1. Create sorted scores array: [ { index: 1, score: 100 }, { index: 2, score: 50 }, ... ]
        const sortedPlayers = Object.entries(playerTotals) // [ ['1', 100], ['2', 50], ... ]
                                .map(([index, score]) => ({ index: parseInt(index), score: score }))
                                .sort((a, b) => b.score - a.score); // Sort descending by score

        // 2. Get unique top scores (max 3 needed for medals)
        const uniqueScores = [...new Set(sortedPlayers.map(p => p.score))].sort((a, b) => b - a);
        const goldScore = uniqueScores.length > 0 ? uniqueScores[0] : -Infinity;
        const silverScore = uniqueScores.length > 1 ? uniqueScores[1] : -Infinity;
        const bronzeScore = uniqueScores.length > 2 ? uniqueScores[2] : -Infinity;

        // 3. Assign medals based on scores
        const playerMedals = {};
        for (const player of sortedPlayers) {
            // Assign medal only if score is > 0 or based on your ranking preference for negative scores
            if (player.score === goldScore && player.score > -Infinity ) { // Check score exists
                playerMedals[player.index] = '🥇';
            } else if (player.score === silverScore && player.score > -Infinity) {
                playerMedals[player.index] = '🥈';
            } else if (player.score === bronzeScore && player.score > -Infinity) {
                playerMedals[player.index] = '🥉';
            } else {
                playerMedals[player.index] = ''; // No medal
            }
        }

        // --- Update the total scores display in the single footer cell ---
        const totalsCell = document.getElementById('player-totals-list-cell');
        if (totalsCell) {
            totalsCell.innerHTML = '';
            const scoresList = document.createElement('div');
            scoresList.className = 'footer-scores-list';

            for (let i = 1; i <= numPlayers; i++) {
                if (playerInfo.hasOwnProperty(i)) {
                    const pInfo = playerInfo[i];
                    const playerScore = playerTotals[i] || 0;
                    const medal = playerMedals[i] || '';
                    const uselText = isPlayerUsel[i] ? " (Usel är du!)" : ""; // <<< Add Usel text

                    const scoreEntry = document.createElement('div');
                    scoreEntry.className = 'footer-score-entry';
                    scoreEntry.textContent = `${pInfo.emoji} ${medal ? medal + ' ' : ''}${pInfo.name}${uselText}: ${playerScore}`; // <<< Append Usel text
                    scoresList.appendChild(scoreEntry);
                }
            }
            totalsCell.appendChild(scoresList);
        }
    }

    // --- Function to handle New Game Button Click ---
    function startNewGame() {
        // Instead of confirm(), call the function to open the custom modal
        openNewGameConfirmModal();
    }

    // --- NEW Function to open the New Game confirmation modal ---
    function openNewGameConfirmModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('new-game-confirm-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal elements
        const modal = document.createElement('div');
        modal.id = 'new-game-confirm-modal';
        modal.className = 'confirm-modal'; // Use a general class or reuse bonus-modal? Let's use new one

        const header = document.createElement('h4');
        header.textContent = 'Starta ny match?';
        modal.appendChild(header);

        const message = document.createElement('p');
        message.textContent = 'Nuvarande poäng nollställs, men spelarna behålls.';
        modal.appendChild(message);

        // Button container for better layout
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'confirm-modal-buttons';

        // Confirm Button ("Ja")
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Ja, starta ny';
        confirmButton.className = 'confirm-btn yes';
        confirmButton.addEventListener('click', () => {
            initializeTable(true); // Start new game reusing players
            modal.remove(); // Close modal
        });
        buttonDiv.appendChild(confirmButton);

        // Cancel Button ("Avbryt")
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Avbryt';
        cancelButton.className = 'confirm-btn cancel';
        cancelButton.addEventListener('click', () => {
            modal.remove(); // Close modal
        });
        buttonDiv.appendChild(cancelButton);

        modal.appendChild(buttonDiv);

        // Append modal to body
        document.body.appendChild(modal);
    }

    // --- Event Listeners ---
    numPlayersSelect.addEventListener('change', () => initializeTable(false));
    newGameBtnTop.addEventListener('click', startNewGame);
    newGameBtnBottom.addEventListener('click', startNewGame);

    document.addEventListener('click', (event) => {
        // Close BOTH modals on outside click
        const bonusModal = document.getElementById('bonus-modal-dynamic');
        const confirmModal = document.getElementById('new-game-confirm-modal');

        if (bonusModal && !bonusModal.contains(event.target) && !event.target.classList.contains('bonus-button')) {
            bonusModal.remove();
        }
        if (confirmModal && !confirmModal.contains(event.target) && !event.target.classList.contains('new-game-btn')) {
            confirmModal.remove();
        }
    });

    initializeTable(false);
}); 