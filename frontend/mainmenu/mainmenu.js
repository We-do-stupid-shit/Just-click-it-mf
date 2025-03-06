// DOM elements
const continueBtn = document.getElementById('continue-btn');
const newGameBtn = document.getElementById('new-game-btn');
const profilesBtn = document.getElementById('profiles-btn');

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

// Check for existing saves
function checkForSaves() {
    const defaultSave = localStorage.getItem('pcClickerSave');
    
    // Get all named saves
    allSaves = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key === 'pcClickerSave' || key.startsWith('pcClickerSave_')) {
            try {
                const saveData = JSON.parse(localStorage.getItem(key));
                const saveId = key === 'pcClickerSave' ? 'default' : key.replace('pcClickerSave_', '');
                allSaves.push({
                    id: saveId,
                    name: saveId === 'default' ? 'Default Save' : saveId,
                    data: saveData,
                    lastSave: saveData.lastSave || Date.now()
                });
            } catch (e) {
                console.error(`Error parsing save ${key}:`, e);
            }
        }
    }
    
    // Sort saves by last save date (newest first)
    allSaves.sort((a, b) => b.lastSave - a.lastSave);
    
    // If there's at least one save, default to the most recent
    if (allSaves.length > 0) {
        currentSaveId = allSaves[0].id;
        continueBtn.disabled = false;
    } else {
        currentSaveId = null;
        continueBtn.disabled = true;
    }
    
    return allSaves;
}

// Load a save and start the game
function loadSave(saveId) {
    currentSaveId = saveId;
    
    // Redirect to the game with the save ID as a parameter
    if (saveId === 'default') {
        window.location.href = '/frontend/homepage/homepage.html?save=default';
    } else {
        window.location.href = `/frontend/homepage/homepage.html?save=${encodeURIComponent(saveId)}`;
    }
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
    
    // Load the new game
    loadSave(saveId);
}

// Show profiles menu (placeholder for future backend implementation)
function showProfiles() {
    // This is just a placeholder for now
    alert("Profiles feature will be implemented with backend. Available saves: " + 
          allSaves.map(save => save.name).join(", "));
    
    // You can expand this later with your backend implementation
}

// Initialize
function init() {
    // Check for saves
    checkForSaves();
    
    // Button event listeners
    continueBtn.addEventListener('click', () => {
        if (currentSaveId) {
            loadSave(currentSaveId);
        }
    });
    
    newGameBtn.addEventListener('click', createNewGame);
    
    profilesBtn.addEventListener('click', showProfiles);
}

// Run initialization when document is loaded
document.addEventListener('DOMContentLoaded', init);

// Redirect to the game with the save ID as a parameter
if (saveId === 'default') {
    window.location.href = '/frontend/homepage/homepage.html?save=default';
} else {
    window.location.href = `/frontend/homepage/homepage.html?save=${encodeURIComponent(saveId)}`;
}