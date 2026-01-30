const API_KEY = 'a337c4966975cd811dcbed50db511baf';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_PATH = 'https://image.tmdb.org/t/p/original';

let CURRENT_ID = '';
let CURRENT_TYPE = 'movie';

// View Management
function showHome() {
    document.getElementById('playerView').classList.remove('active');
    document.getElementById('homePage').classList.add('active');
    document.getElementById('videoContainer').innerHTML = ''; // Kill player on back
    window.scrollTo(0,0);
}

function showPlayer() {
    document.getElementById('homePage').classList.remove('active');
    document.getElementById('playerView').classList.add('active');
    window.scrollTo(0,0);
}

// Data Initialization
async function init() {
    try {
        const trending = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`).then(r => r.json());
        const action = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=28`).then(r => r.json());
        const comedy = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=35`).then(r => r.json());

        setupHero(trending.results[0]);
        renderRow("Trending Now", trending.results, "trendingRow");
        renderRow("Action Hits", action.results, "actionRow");
        renderRow("Pure Comedy", comedy.results, "comedyRow");
    } catch (e) { console.error("Initial load failed", e); }
}

function setupHero(item) {
    const hero = document.getElementById('hero');
    hero.style.backgroundImage = `linear-gradient(to top, #000 8%, transparent 92%), url(${BACKDROP_PATH + item.backdrop_path})`;
    document.getElementById('heroTitle').innerText = item.title || item.name;
    document.getElementById('heroDesc').innerText = item.overview.slice(0, 160) + "...";
    document.getElementById('heroPlayBtn').onclick = () => loadContent(item.id, item.media_type || 'movie');
}

function renderRow(title, items, rowId) {
    const content = document.getElementById('contentRows');
    const rowWrap = document.createElement('div');
    rowWrap.innerHTML = `<h2 class="row-title">${title}</h2><div class="poster-row" id="${rowId}"></div>`;
    content.appendChild(rowWrap);
    
    const row = document.getElementById(rowId);
    items.forEach(item => {
        if(!item.backdrop_path) return;
        const card = document.createElement('div');
        card.className = 'poster-card';
        card.style.backgroundImage = `url(${IMG_PATH + item.backdrop_path})`;
        card.onclick = () => loadContent(item.id, item.media_type || 'movie');
        row.appendChild(card);
    });
}

// Search & Discovery
function toggleSearch() {
    const input = document.getElementById('epSearch');
    input.classList.toggle('active');
    if(input.classList.contains('active')) input.focus();
}

async function loadDiscovery(type, genreId) {
    const container = document.getElementById('contentRows');
    container.innerHTML = '<h2 class="row-title">Discovering...</h2>';
    showHome();
    
    const data = await fetch(`https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&with_genres=${genreId}`).then(r => r.json());
    container.innerHTML = '';
    renderRow("Results", data.results, "discoveryResults");
}

// Player Loading
async function loadContent(id, type) {
    CURRENT_ID = id;
    CURRENT_TYPE = type;
    showPlayer();
    
    const sSelect = document.getElementById('seasonSelect');
    const eSelect = document.getElementById('episodeSelect');
    sSelect.innerHTML = '<option value="">Season</option>';
    
    if (type === 'tv') {
        sSelect.style.display = "inline-block";
        eSelect.style.display = "inline-block";
        const data = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`).then(r => r.json());
        data.seasons.forEach(s => {
            if (s.season_number > 0) {
                let opt = document.createElement('option');
                opt.value = s.season_number;
                opt.innerText = `Season ${s.season_number}`;
                sSelect.appendChild(opt);
            }
        });
    } else {
        sSelect.style.display = "none";
        eSelect.style.display = "none";
        playVideo();
    }
}

function playVideo(s = 1, e = 1) {
    const url = CURRENT_TYPE === 'tv' ? `https://vidlink.pro/tv/${CURRENT_ID}/${s}/${e}` : `https://vidlink.pro/movie/${CURRENT_ID}`;
    document.getElementById('videoContainer').innerHTML = `<iframe src="${url}" allowfullscreen allow="autoplay"></iframe>`;
}

// Event Listeners
document.getElementById('seasonSelect').onchange = async (e) => {
    const sNum = e.target.value;
    const eSelect = document.getElementById('episodeSelect');
    const data = await fetch(`https://api.themoviedb.org/3/tv/${CURRENT_ID}/season/${sNum}?api_key=${API_KEY}`).then(r => r.json());
    eSelect.innerHTML = '<option value="">Episode</option>';
    eSelect.disabled = false;
    data.episodes.forEach(ep => {
        let opt = document.createElement('option');
        opt.value = ep.episode_number;
        opt.innerText = `${ep.episode_number}. ${ep.name}`;
        eSelect.appendChild(opt);
    });
};

document.getElementById('episodeSelect').onchange = (e) => playVideo(document.getElementById('seasonSelect').value, e.target.value);

init();
