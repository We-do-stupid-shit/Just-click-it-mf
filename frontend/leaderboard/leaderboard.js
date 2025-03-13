// DOM Elements
const leaderboardBody = document.getElementById('leaderboard-body');
const backBtn = document.getElementById('back-btn');
const refreshBtn = document.getElementById('refresh-btn');

// Base URL for the application
const baseUrl = window.location.pathname.includes('/frontend') 
    ? window.location.pathname.split('/frontend')[0] 
    : '';

// Animate floating PC icons
document.querySelectorAll('.floating-pc').forEach(element => {
    // Random starting position
    const startX = Math.random() * 10 - 5;
    const startY = Math.random() * 10 - 5;
    element.style.transform = `translate(${startX}px, ${startY}px)`;
    
    // Create animation
    const duration = 5 + Math.random() * 5;
    const xMovement = 20 + Math.random() * 20;
    const yMovement = 20 + Math.random() * 20;
    
    // Apply animation
    element.animate([
        { transform: `translate(${startX}px, ${startY}px)` },
        { transform: `translate(${startX + xMovement}px, ${startY - yMovement}px)` },
        { transform: `translate(${startX - xMovement}px, ${startY + yMovement}px)` },
        { transform: `translate(${startX}px, ${startY}px)` }
    ], {
        duration: duration * 1000,
        iterations: Infinity,
        easing: 'ease-in-out'
    });
});

// Format large numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Fetch leaderboard data from server
function fetchLeaderboard() {
    // Show loading state
    leaderboardBody.innerHTML = `
        <tr class="loading-row">
            <td colspan="3">
                <div class="loading-spinner">
                    <i class="fas fa-circle-notch fa-spin"></i>
                    <span>Loading leaderboard data...</span>
                </div>
            </td>
        </tr>
    `;
    
    // Make request to server
    fetch(`${baseUrl}/server.cgi?action=leaderboard`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                displayLeaderboard(data.data);
            } else {
                showError(data.message || 'Failed to load leaderboard');
            }
        })
        .catch(error => {
            console.error('Error fetching leaderboard:', error);
            showError('Connection error. Please try again later.');
        });
}

// Display leaderboard data
function displayLeaderboard(leaderboardData) {
    if (!leaderboardData || leaderboardData.length === 0) {
        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 2rem;">
                    No players found. Be the first to join the leaderboard!
                </td>
            </tr>
        `;
        return;
    }
    
    // Clear previous data
    leaderboardBody.innerHTML = '';
    
    // Add each player to the table
    leaderboardData.forEach((player, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="rank-badge ${rankClass}">${rank}</div>
            </td>
            <td>${player.username}</td>
            <td class="score">${formatNumber(player.score)}</td>
        `;
        
        leaderboardBody.appendChild(row);
    });
}

// Show error message
function showError(message) {
    leaderboardBody.innerHTML = `
        <tr>
            <td colspan="3">
                <div class="error-message visible">
                    <i class="fas fa-exclamation-circle"></i> ${message}
                </div>
                <div style="text-align: center; padding: 1rem;">
                    Please try again later or check your connection.
                </div>
            </td>
        </tr>
    `;
}

// Initialize
function init() {
    // Fetch leaderboard on page load
    fetchLeaderboard();
    
    // Button event listeners
    backBtn.addEventListener('click', () => {
        window.location.href = `${baseUrl}/frontend/mainmenu/mainmenu.html`;
    });
    
    refreshBtn.addEventListener('click', fetchLeaderboard);
}

// Run initialization when document is loaded
document.addEventListener('DOMContentLoaded', init);