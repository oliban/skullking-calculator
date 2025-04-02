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

    let numPlayers = parseInt(numPlayersSelect.value);
    let numRounds = 8; // Default

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

    function initializeTable() {
        headerRow.innerHTML = ''; // Clear existing header content
        tableBody.innerHTML = ''; // Clear existing body content

        numPlayers = parseInt(numPlayersSelect.value);
        numRounds = getNumberOfRounds(numPlayers);
        if (roundCountDisplay) { // Check if element exists
             roundCountDisplay.textContent = numRounds;
        }

        // Create NEW header row based on sketch
        ['Runda', 'Spelare', 'Bud', 'Stick', 'Poäng', 'Bonus'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });

        // Get player names
        let playerNames = {};
        let assignedNames = [];
        for (let i = 1; i <= numPlayers; i++) {
             const defaultName = getRandomPirateName(assignedNames);
             assignedNames.push(defaultName);
             playerNames[i] = defaultName;
        }

        // Create rows: one row per player per round, using rowspan for Round
        for (let round = 1; round <= numRounds; round++) {
            for (let player = 1; player <= numPlayers; player++) {
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

                // 2. Player Name Cell
                const tdPlayer = document.createElement('td');
                tdPlayer.textContent = playerNames[player];
                tdPlayer.classList.add('player-name-cell');
                tr.appendChild(tdPlayer);

                // 3. Bid Cell (Select)
                const tdBid = document.createElement('td');
                const bidSelect = document.createElement('select');
                bidSelect.id = `r${round}-p${player}-bid`;
                bidSelect.title = `Spelare ${playerNames[player]} - Bud Runda ${round}`;
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
                tricksSelect.title = `Spelare ${playerNames[player]} - Stick Runda ${round}`;
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
                bonusButton.addEventListener('click', () => openBonusModal(round, player, playerNames[player], bonusButton));
                tdBonus.appendChild(bonusButton);
                tr.appendChild(tdBonus);

                tableBody.appendChild(tr);
            }
        }
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
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const rowIdMatch = row.id.match(/r(\d+)-p(\d+)-row/);
            if (!rowIdMatch) return;

            const round = parseInt(rowIdMatch[1]);
            const player = parseInt(rowIdMatch[2]);

            const bidSelect = row.querySelector(`#r${round}-p${player}-bid`);
            const tricksSelect = row.querySelector(`#r${round}-p${player}-tricks`);
            const scoreDisplay = row.querySelector(`#r${round}-p${player}-score`);
            const bonusButton = row.querySelector(`#r${round}-p${player}-bonus-btn`);

            if (!bidSelect || !tricksSelect || !scoreDisplay || !bonusButton) return;

            const bidValue = bidSelect.value;
            const tricksValue = tricksSelect.value;
            const bid = bidValue === "" ? NaN : parseInt(bidValue);
            const tricksWon = tricksValue === "" ? NaN : parseInt(tricksValue);

            const mermaidCapturesSK = bonusButton.dataset.mermaid === 'true';
            const piratesCapturedBySK = parseInt(bonusButton.dataset.pirates || '0');

            let roundScore = 0;
            if (!isNaN(bid) && !isNaN(tricksWon)) {
                 if (bid === tricksWon) { // Correct bid
                    roundScore = (bid === 0) ? round * 10 : bid * 20;
                    if (mermaidCapturesSK) roundScore += 50;
                    roundScore += piratesCapturedBySK * 30;
                } else { // Incorrect bid
                    roundScore = (bid === 0) ? round * -10 : Math.abs(bid - tricksWon) * -10;
                }
            }
            scoreDisplay.textContent = roundScore;
        });
    }

    numPlayersSelect.addEventListener('change', initializeTable);
    document.addEventListener('click', (event) => { // Close modal on outside click
        const modal = document.getElementById('bonus-modal-dynamic');
        if (modal && !modal.contains(event.target) && !event.target.classList.contains('bonus-button')) {
            modal.remove();
        }
    });

    initializeTable();
}); 