document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addMatchForm').addEventListener('submit', handleAddMatch);
    document.getElementById('clearResults').addEventListener('click', clearResults);
    loadMatchResults();
    displayLeaderboard();
});

const placementPoints = {
    1: 10, 2: 6, 3: 5, 4: 5, 5: 3, 6: 2, 7: 1, 8: 1,
    9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0
};

let matchResults = {};

function displayLeaderboard() {
    const sortedResults = calculateTotalPoints();
    const tbody = document.querySelector("#leaderboard tbody");
    tbody.innerHTML = '';
    sortedResults.forEach(([team, data], index) => {
        const row = tbody.insertRow();
        row.insertCell().textContent = index + 1;
        row.insertCell().textContent = team;
        row.insertCell().textContent = data.killPoints;
        row.insertCell().textContent = data.placementPoints;
        row.insertCell().textContent = data.wwcd;
        row.insertCell().textContent = data.totalPoints;

        const deleteCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '&#10005;';
        deleteButton.classList.add('delete-button');
        deleteButton.onclick = () => deleteTeam(team);
        deleteCell.appendChild(deleteButton);
    });
}

function handleAddMatch(event) {
    event.preventDefault();
    const teamName = document.getElementById('teamName').value.trim();
    const placement = parseInt(document.getElementById('placement').value, 10);
    const kills = parseInt(document.getElementById('kills').value, 10);
    if (!matchResults[teamName]) {
        matchResults[teamName] = [];
    }
    matchResults[teamName].push([placement, kills]);
    saveMatchResults();
    displayLeaderboard();
}

function saveMatchResults() {
    localStorage.setItem('matchResults', JSON.stringify(matchResults));
}

function loadMatchResults() {
    const storedResults = localStorage.getItem('matchResults');
    if (storedResults) {
        matchResults = JSON.parse(storedResults);
        displayLeaderboard();
    }
}

function clearResults() {
    localStorage.removeItem('matchResults');
    matchResults = {};
    displayLeaderboard();
}

function deleteTeam(teamName) {
    if (confirm(`Are you sure you want to delete the results for ${teamName}?`)) {
        delete matchResults[teamName];
        saveMatchResults();
        displayLeaderboard();
    }
}

function calculateTotalPoints() {
    const teamData = {};
    for (const [team, matches] of Object.entries(matchResults)) {
        let totalKillPoints = 0, totalPlacementPoints = 0, wwcdCount = 0;
        matches.forEach(([placement, kills]) => {
            totalPlacementPoints += placementPoints[placement] || 0;
            totalKillPoints += kills;
            if (placement === 1) wwcdCount++;
        });
        const totalPoints = totalPlacementPoints + totalKillPoints;
        teamData[team] = {
            killPoints: totalKillPoints,
            placementPoints: totalPlacementPoints,
            wwcd: wwcdCount,
            totalPoints: totalPoints
        };
    }
    return Object.entries(teamData).sort((a, b) => b[1].totalPoints - a[1].totalPoints);
}

function saveAsImage() {
    const container = document.querySelector('.container');
    const titleText = document.getElementById('resultTitle').value.trim();

    if (!titleText) {
        alert('Please enter a title for your result before saving.');
        return;
    }

    // Add dynamic title
    const titleElement = document.createElement('h2');
    titleElement.textContent = titleText;
    titleElement.style.color = '#fff';
    titleElement.style.textAlign = 'center';
    titleElement.style.marginTop = '20px';
    titleElement.style.fontSize = '32px';
    titleElement.style.backgroundColor = '#000'; // Solid black background
    container.insertBefore(titleElement, container.firstChild);

    container.style.backgroundColor = '#000'; // Force solid background

    html2canvas(container, {
        scale: 4, // High resolution for clarity
        useCORS: true,
        backgroundColor: '#000', // Solid black for PNG
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'leaderboard.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        container.removeChild(titleElement); // Clean up
        container.style.backgroundColor = 'transparent';
    }).catch(error => {
        console.error('Error saving as PNG:', error);
    });
}
