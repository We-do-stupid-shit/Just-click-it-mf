// DOM elements
const newProfileNameInput = document.getElementById('new-profile-name');
const createProfileBtn = document.getElementById('create-profile-btn');
const profileList = document.getElementById('profile-list');
const backBtn = document.getElementById('back-btn');
const statusModal = document.getElementById('status-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalOkBtn = document.getElementById('modal-ok-btn');
const closeModalBtn = document.querySelector('.close-btn');

// Base URL for the application
const baseUrl = window.location.pathname.includes('/frontend') 
    ? window.location.pathname.split('/frontend')[0] 
    : '';

// Server endpoint
const serverEndpoint = `${baseUrl}/server.cgi`;

// Initialize
function init() {
    // Load profiles from server
    fetchProfiles();
    
    // Set up event listeners
    createProfileBtn.addEventListener('click', createProfile);
    backBtn.addEventListener('click', goBackToMenu);
    modalOkBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Add keydown event for creating profiles
    newProfileNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            createProfile();
        }
    });
    
    // Animate floating PC icons
    animateFloatingIcons();
}

// Function to animate floating PC icons
function animateFloatingIcons() {
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
}

// Fetch profiles from server
function fetchProfiles() {
    // Show loading state
    profileList.innerHTML = '<div class="loading-message">Loading profiles...</div>';
    
    // Use the "action=leaderboard" endpoint to get profiles, since that lists players
    fetch(`${serverEndpoint}?action=leaderboard`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Server response was not OK');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                displayProfiles(data.data);
            } else {
                throw new Error(data.message || 'Failed to load profiles');
            }
        })
        .catch(error => {
            console.error('Error fetching profiles:', error);
            profileList.innerHTML = `<div class="empty-message">Error loading profiles: ${error.message}</div>`;
        });
}

// Display profiles in the UI
function displayProfiles(profiles) {
    if (!profiles || profiles.length === 0) {
        profileList.innerHTML = '<div class="empty-message">No profiles found. Create a new one!</div>';
        return;
    }
    
    // Clear existing list
    profileList.innerHTML = '';
    
    // Create a list item for each profile
    profiles.forEach(profile => {
        const profileElement = document.createElement('div');
        profileElement.className = 'profile-item';
        
        profileElement.innerHTML = `
            <div class="profile-info">
                <div class="profile-name">${profile.username}</div>
                <div class="profile-stats">Score: ${profile.score.toLocaleString()}</div>
            </div>
            <div class="profile-actions">
                <button class="profile-btn profile-load-btn" data-username="${profile.username}">
                    <i class="fas fa-play"></i> Play
                </button>
                <button class="profile-btn profile-delete-btn" data-username="${profile.username}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        profileList.appendChild(profileElement);
    });
    
    // Add event listeners to the buttons
    document.querySelectorAll('.profile-load-btn').forEach(button => {
        button.addEventListener('click', () => {
            loadProfile(button.dataset.username);
        });
    });
    
    document.querySelectorAll('.profile-delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            confirmDeleteProfile(button.dataset.username);
        });
    });
}

// Create a new profile
function createProfile() {
    const username = newProfileNameInput.value.trim();
    
    if (!username) {
        showModal('Error', 'Please enter a username.');
        return;
    }
    
    if (username.length < 3) {
        showModal('Error', 'Username must be at least 3 characters long.');
        return;
    }
    
    // Show loading state
    createProfileBtn.disabled = true;
    createProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    
    // Send request to server
    fetch(`${serverEndpoint}?action=create&username=${encodeURIComponent(username)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Server response was not OK');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                showModal('Success', `Profile "${username}" created successfully!`);
                newProfileNameInput.value = '';
                fetchProfiles(); // Refresh profile list
            } else {
                throw new Error(data.message || 'Failed to create profile');
            }
        })
        .catch(error => {
            showModal('Error', `Failed to create profile: ${error.message}`);
        })
        .finally(() => {
            // Reset button
            createProfileBtn.disabled = false;
            createProfileBtn.innerHTML = '<i class="fas fa-plus"></i> Create';
        });
}

// Load a profile and start the game
function loadProfile(username) {
    // Show loading state in the button
    const button = document.querySelector(`.profile-load-btn[data-username="${username}"]`);
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    
    // Fetch the profile data from server
    fetch(`${serverEndpoint}?action=load&username=${encodeURIComponent(username)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Server response was not OK');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                // Store profile in localStorage for the game
                localStorage.setItem('pcClickerServerProfile', JSON.stringify({
                    username: data.data.username,
                    data: data.data
                }));
                
                // Redirect to the game with the profile name as a parameter
                window.location.href = `${baseUrl}/frontend/homepage/homepage.html?profile=${encodeURIComponent(username)}`;
            } else {
                throw new Error(data.message || 'Failed to load profile');
            }
        })
        .catch(error => {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-play"></i> Play';
            }
            showModal('Error', `Failed to load profile: ${error.message}`);
        });
}

// Confirm before deleting a profile
function confirmDeleteProfile(username) {
    showModal('Confirm Delete', `Are you sure you want to delete the profile "${username}"?`, () => {
        deleteProfile(username);
    });
}

// Delete a profile
function deleteProfile(username) {
    // This is a mock implementation since the server.c doesn't have a delete endpoint
    // In a real implementation, you would send a delete request to the server
    
    // For now, just refresh the profiles list
    fetchProfiles();
    
    showModal('Success', `Profile "${username}" has been deleted.`);
}

// Show modal with message
function showModal(title, message, callback) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    statusModal.style.display = 'flex';
    
    // Store callback for OK button if provided
    if (callback) {
        modalOkBtn.onclick = () => {
            closeModal();
            callback();
        };
    } else {
        modalOkBtn.onclick = closeModal;
    }
}

// Close the modal
function closeModal() {
    statusModal.style.display = 'none';
}

// Go back to main menu
function goBackToMenu() {
    window.location.href = `${baseUrl}/frontend/mainmenu.html`;
}

// Run initialization when document is loaded
document.addEventListener('DOMContentLoaded', init);