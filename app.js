const regionCode = "US-TX";
const EBIRD_API_KEY = "orfoupja4iho"; 

let cachedBirds = []; 

fetch(`https://api.ebird.org/v2/data/obs/${regionCode}/recent`, {
  headers: { "X-eBirdApiToken": EBIRD_API_KEY }
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error("Error fetching data:", err));
document.getElementById('fetchBtn').addEventListener('click', fetchRecentSightings);
async function fetchRecentSightings() {
    const regionCode = document.getElementById('regionInput').value.trim();
    const birdList = document.getElementById('birdList');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');

    birdList.innerHTML = '';
    errorDiv.classList.add('hidden');
    
    if (!regionCode) {
        showError('Please enter a region code.');
        return;
    }

    loadingDiv.classList.remove('hidden');

    
    const url = `https://api.ebird.org/v2/data/obs/${regionCode}/recent`; 
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-eBirdApiToken': EBIRD_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - Code may be invalid.`);
        }

        const data = await response.json();
        loadingDiv.classList.add('hidden');

        if (data.length === 0) {
            showError('No recent sightings found for this region.');
            return;
        }
cachedBirds = data;
        renderBirds(data);

    } catch (error) {
        loadingDiv.classList.add('hidden');
        showError(error.message || 'Failed to fetch bird data.');
    }
}


function renderBirds(birds) {
    const birdList = document.getElementById('birdList');
    birdList.innerHTML = '';

    const sectionType = document.getElementById('sectionType').value;

    let sections = {};

    // -----------------------------
    // 1. ALPHABETICAL (A–Z)
    // -----------------------------
    if (sectionType === "alphabetical") {
        sections = birds.reduce((acc, bird) => {
            const letter = bird.comName[0].toUpperCase();
            if (!acc[letter]) acc[letter] = [];
            acc[letter].push(bird);
            return acc;
        }, {});
    }

    // -----------------------------
    // 2. COUNT RANGES
    // -----------------------------
    if (sectionType === "count") {
        sections = birds.reduce((acc, bird) => {
            const count = bird.howMany || 1;

            let range = "";
            if (count === 1) range = "Single";
            else if (count <= 5) range = "2–5";
            else if (count <= 20) range = "6–20";
            else range = "21+";

            if (!acc[range]) acc[range] = [];
            acc[range].push(bird);
            return acc;
        }, {});
    }

    // -----------------------------
    // 3. DATE SEEN
    // -----------------------------
    if (sectionType === "date") {
        sections = birds.reduce((acc, bird) => {
            const date = bird.obsDt ? bird.obsDt.split(" ")[0] : "Unknown Date";
            if (!acc[date]) acc[date] = [];
            acc[date].push(bird);
            return acc;
        }, {});
    }

    // -----------------------------
    // 4. RARITY (eBird "obsReviewed" + "obsValid")
    // -----------------------------
    if (sectionType === "rarity") {
        sections = birds.reduce((acc, bird) => {
            let rarity = "Common";

            if (bird.obsReviewed && bird.obsValid === false) rarity = "Needs Review";
            if (bird.obsReviewed && bird.obsValid) rarity = "Verified Rare";

            if (!acc[rarity]) acc[rarity] = [];
            acc[rarity].push(bird);
            return acc;
        }, {});
    }

   
   
    // -----------------------------
    // RENDER SECTIONS
    // -----------------------------
    Object.keys(sections).sort().forEach(sectionName => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'bird-section';

        sectionDiv.innerHTML = `<h2>${sectionName}</h2>`;

        const ul = document.createElement('ul');

        sections[sectionName].forEach(bird => {
            const li = document.createElement('li');
            li.className = 'bird-item';

            const count = bird.howMany ? bird.howMany : 'Seen';

            li.innerHTML = `
                <div>
                    <div class="bird-name">${bird.comName}</div>
                    <div class="bird-scientific">${bird.sciName}</div>
                </div>
                <span class="bird-count">Count: ${count}</span>
            `;
            ul.appendChild(li);
        });

        sectionDiv.appendChild(ul);
        birdList.appendChild(sectionDiv);
    });
}

 
function loadSectionData(sectionType) {
    console.log("Loading:", sectionType);

    if (cachedBirds.length > 0) {
        renderBirds(cachedBirds);
    }
}


document.getElementById('sectionType').addEventListener('change', (e) => {
    loadSectionData(e.target.value);
});

document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('sectionType');
    selector.value = 'date';
    selector.dispatchEvent(new Event('change'));
});


function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}
