// DOM elements
const continueBtn = document.getElementById('continue-btn');
const newGameBtn = document.getElementById('new-game-btn');
const profilesBtn = document.getElementById('profiles-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');

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

// Save data management
let currentSaveId = null;
let allSaves = [];

// Check for existing saves and determine the most recently played one
function checkForSaves() {
    // Get all named saves
    allSaves = [];
    
    // Check all items in localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key === 'pcClickerSave' || key.startsWith('pcClickerSave_')) {
            try {
                const saveData = JSON.parse(localStorage.getItem(key));
                const saveId = key === 'pcClickerSave' ? 'default' : key.replace('pcClickerSave_', '');
                
                // Make sure lastSave property exists
                if (!saveData.lastSave) {
                    saveData.lastSave = Date.now();
                    localStorage.setItem(key, JSON.stringify(saveData));
                }
                
                allSaves.push({
                    id: saveId,
                    name: saveId === 'default' ? 'Default Save' : saveId,
                    data: saveData,
                    lastSave: saveData.lastSave
                });
            } catch (e) {
                console.error(`Error parsing save ${key}:`, e);
            }
        }
    }
    
    // Sort saves by last save date (newest first)
    allSaves.sort((a, b) => b.lastSave - a.lastSave);
    
    // Update last played save ID in localStorage
    if (allSaves.length > 0) {
        currentSaveId = allSaves[0].id;
        localStorage.setItem('pcClickerLastSave', currentSaveId);
        continueBtn.disabled = false;
    } else {
        currentSaveId = null;
        localStorage.removeItem('pcClickerLastSave');
        continueBtn.disabled = true;
    }
    
    return allSaves;
}

// Load a save and start the game
function loadSave(saveId) {
    // Update the last played save
    const saveKey = saveId === 'default' ? 'pcClickerSave' : `pcClickerSave_${saveId}`;
    
    try {
        // Update lastSave timestamp
        const saveData = JSON.parse(localStorage.getItem(saveKey));
        saveData.lastSave = Date.now();
        localStorage.setItem(saveKey, JSON.stringify(saveData));
        
        // Update last played save ID
        localStorage.setItem('pcClickerLastSave', saveId);
    } catch (e) {
        console.error('Error updating save timestamp:', e);
    }
    
    // Redirect to the game with the save ID as a parameter
    window.location.href = `${baseUrl}/frontend/homepage/homepage.html?save=${encodeURIComponent(saveId)}`;
}

// Create a new game
function createNewGame() {
    // Generate a new save ID based on date and a random number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const saveId = `Save_${dateStr}_${randomStr}`;
    
    // Create empty save data
    const saveData = {
        pcs: 0,
        clickValue: 1,
        pcsPerSecond: 0,
        totalClicks: 0,
        totalPcs: 0,
        upgrades: {
            click: {
                basePrice: 50,
                price: 50,
                level: 0,
                increment: 1
            },
            intern: {
                basePrice: 100,
                price: 100,
                count: 0,
                value: 1
            },
            technician: {
                basePrice: 500,
                price: 500,
                count: 0,
                value: 5
            },
            engineer: {
                basePrice: 2000,
                price: 2000,
                count: 0,
                value: 20
            },
            factory: {
                basePrice: 10000,
                price: 10000,
                count: 0,
                value: 100
            },
            datacenter: {
                basePrice: 50000,
                price: 50000,
                count: 0,
                value: 500
            }
        },
        lastSave: Date.now()
    };
    
    // Save the new game
    localStorage.setItem(`pcClickerSave_${saveId}`, JSON.stringify(saveData));
    
    // Update last played save ID
    localStorage.setItem('pcClickerLastSave', saveId);
    
    // Load the new game
    loadSave(saveId);
}

// Continue the last played save
function continueSave() {
    // Try to get the last played save ID from localStorage
    const lastSaveId = localStorage.getItem('pcClickerLastSave');
    
    if (lastSaveId) {
        // Check if this save still exists
        const saveKey = lastSaveId === 'default' ? 'pcClickerSave' : `pcClickerSave_${lastSaveId}`;
        if (localStorage.getItem(saveKey)) {
            loadSave(lastSaveId);
            return;
        }
    }
    
    // If no valid last save ID is found, use the most recent one from allSaves
    if (allSaves.length > 0) {
        loadSave(allSaves[0].id);
    } else {
        // If no saves exist, prompt to create a new game
        alert('No saves found. Please create a new game.');
    }
}

// Show profiles menu with server interaction
function showProfiles() {
    // Fixed path to profiles.html
    window.location.href = `../profiles/profiles.html`;
}

// Navigate to leaderboard
function goToLeaderboard() {
    window.location.href = `${baseUrl}/frontend/leaderboard/leaderboard.html`;
}

// Initialize
function init() {
    // Check for saves
    checkForSaves();
    
    // Button event listeners
    continueBtn.addEventListener('click', continueSave);
    newGameBtn.addEventListener('click', createNewGame);
    profilesBtn.addEventListener('click', showProfiles);
    
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', goToLeaderboard);
    }
}

// Run initialization when document is loaded
document.addEventListener('DOMContentLoaded', init);