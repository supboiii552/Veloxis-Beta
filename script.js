// New Endpoints Logic
async function initHome() {
    try {
        const fetchJSON = async (url) => (await fetch(url)).json();

        // Endpoints
        const [trending, action, horror, comedy] = await Promise.all([
            fetchJSON(`https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`),
            fetchJSON(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=28`),
            fetchJSON(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=27`),
            fetchJSON(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=35`)
        ]);

        setupHero(trending.results[0]);
        fillRow('trendingRow', trending.results);
        fillRow('actionRow', action.results);
        fillRow('horrorRow', horror.results);
        fillRow('comedyRow', comedy.results);
        
    } catch (err) { console.error("Load Error:", err); }
}

// Search Bar Toggle
function toggleSearch() {
    const searchBar = document.getElementById('epSearch');
    searchBar.classList.toggle('active');
    if(searchBar.classList.contains('active')) searchBar.focus();
}
