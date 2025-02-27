let pcs = 0;
let clickValue = 1;
let pcsPerSecond = 0;
let totalClicks = 0;
let totalPcs = 0;


const upgrades = {
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
};

const counterElement = document.getElementById('counter');
const perSecondValueElement = document.getElementById('per-second-value');
const totalClicksElement = document.getElementById('total-clicks');
const totalPcsElement = document.getElementById('total-pcs');
const perClickElement = document.getElementById('per-click');
const pcContainer = document.querySelector('.pc-container');


function updateUI() {
    counterElement.textContent = formatNumber(Math.floor(pcs));
    perSecondValueElement.textContent = formatNumber(pcsPerSecond);
    totalClicksElement.textContent = formatNumber(totalClicks);
    totalPcsElement.textContent = formatNumber(totalPcs);
    perClickElement.textContent = formatNumber(clickValue);
    

    for (const [key, upgrade] of Object.entries(upgrades)) {
        const costElement = document.getElementById(`${key}-cost`);
        costElement.textContent = formatNumber(upgrade.price);
        
       
        if (key === 'click') {
            document.getElementById(`${key}-level`).textContent = upgrade.level;
        } else {
            document.getElementById(`${key}-count`).textContent = upgrade.count;
        }
        
      
        const upgradeElement = document.getElementById(`upgrade-${key}`);
        if (pcs >= upgrade.price) {
            upgradeElement.classList.remove('disabled');
        } else {
            upgradeElement.classList.add('disabled');
        }
    }
    
   
    document.title = `${formatNumber(Math.floor(pcs))} PCs - PC Clicker`;
}

function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    } else {
        return num.toFixed(0);  
}
}


function clickPC() {
    pcs += clickValue;
    totalClicks += 1;
    totalPcs += clickValue;
    
   
    const animation = document.createElement('div');
    animation.textContent = '+' + clickValue;
    animation.className = 'click-animation';
    
  
    const randomX = Math.random() * 80 - 40;
    const randomY = Math.random() * 20 - 40;
    animation.style.left = `calc(50% + ${randomX}px)`;
    animation.style.top = `calc(50% + ${randomY}px)`;
    
    
    const sizeVar = Math.random() * 0.5 + 0.8;
    animation.style.fontSize = `${sizeVar * 1.2}rem`;
    
    pcContainer.appendChild(animation);
    setTimeout(() => {
        animation.remove();
    }, 1000);
    
    
    const screenContent = document.querySelector('.screen-content');
    screenContent.style.opacity = '0.3';
    setTimeout(() => {
        screenContent.style.opacity = '1';
    }, 100);
    
    updateUI();
}


function buyUpgrade(type) {
    const upgrade = upgrades[type];
    
    if (pcs >= upgrade.price) {
        pcs -= upgrade.price;
        
        
        const upgradeElement = document.getElementById(`upgrade-${type}`);
        upgradeElement.classList.add('purchase-animation');
        setTimeout(() => {
            upgradeElement.classList.remove('purchase-animation');
        }, 300);
        
        if (type === 'click') {
            upgrade.level += 1;
            clickValue *= 2;
            upgrade.price = Math.round(upgrade.basePrice * Math.pow(1.5, upgrade.level));
        } else {
            upgrade.count += 1;
            pcsPerSecond += upgrade.value;
            upgrade.price = Math.round(upgrade.basePrice * Math.pow(1.15, upgrade.count));
        }
        
        
        updateUI();
    } else {
       
        const upgradeElement = document.getElementById(`upgrade-${type}`);
        upgradeElement.classList.add('insufficient-funds');
        setTimeout(() => {
            upgradeElement.classList.remove('insufficient-funds');
        }, 300);
        
    }
}


function autoGenerate() {
    if (pcsPerSecond > 0) {
        const increment = pcsPerSecond / 10;
        pcs += increment;
        totalPcs += increment;
        updateUI();
    }
}


function saveGame() {
    const saveData = {
        pcs: pcs,
        clickValue: clickValue,
        pcsPerSecond: pcsPerSecond,
        totalClicks: totalClicks,
        totalPcs: totalPcs,
        upgrades: upgrades,
        lastSave: Date.now()
    };
    
    localStorage.setItem('pcClickerSave', JSON.stringify(saveData));
}


function loadGame() {
    const saveData = localStorage.getItem('pcClickerSave');
    
    if (saveData) {
        const data = JSON.parse(saveData);
        
        pcs = data.pcs || 0;
        clickValue = data.clickValue || 1;
        pcsPerSecond = data.pcsPerSecond || 0;
        totalClicks = data.totalClicks || 0;
        totalPcs = data.totalPcs || 0;
        
        
        if (data.upgrades) {
            for (const [key, value] of Object.entries(data.upgrades)) {
                if (upgrades[key]) {
                    upgrades[key] = value;
                }
            }
        }
        
        
        if (data.lastSave) {
            const timeDiff = (Date.now() - data.lastSave) / 1000; 
            const offlineProduction = pcsPerSecond * timeDiff;
            
            if (offlineProduction > 0) {
                pcs += offlineProduction;
                totalPcs += offlineProduction;
                
                
                console.log(`You earned ${formatNumber(offlineProduction)} PCs while away!`);
            }
        }
        
        updateUI();
    }
}


document.createElement('style').textContent = `
.purchase-animation {
    animation: purchase-pulse 0.3s ease;
}

@keyframes purchase-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); background-color: rgba(46, 213, 115, 0.3); }
    100% { transform: scale(1); }
}

.insufficient-funds {
    animation: insufficient-shake 0.3s ease;
}

@keyframes insufficient-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}
`;
document.head.appendChild(document.createElement('style'));


function init() {
   
    loadGame();
    
    
    updateUI();
    
    
    setInterval(autoGenerate, 100);
    
    
    setInterval(saveGame, 30000); 
    
    
    window.addEventListener('beforeunload', saveGame);
}


window.onload = init;