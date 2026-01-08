import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAzPRXys5y8IeefUcNoo9KSYYHx2SW616o",
  authDomain: "watchlist-b0d26.firebaseapp.com",
  projectId: "watchlist-b0d26",
  storageBucket: "watchlist-b0d26.firebasestorage.app",
  messagingSenderId: "957805618122",
  appId: "1:957805618122:web:f7316be42ab6d8003f2533",
};

const TMDB_API_KEY = 'ee832f30efb14e179654a4803a61bfcd';

const PROVIDER_IDS = {
  netflix: 8,
  disney: 337,
  hbo: 384,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchProviders(tmdbId) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`
    );
    const data = await res.json();
    
    // Check Estonian (EE) providers, fallback to US
    const regionData = data.results?.EE || data.results?.US || {};
    const flatrate = regionData.flatrate || [];
    
    const providers = [];
    if (flatrate.some(p => p.provider_id === PROVIDER_IDS.netflix)) providers.push('netflix');
    if (flatrate.some(p => p.provider_id === PROVIDER_IDS.disney)) providers.push('disney');
    if (flatrate.some(p => p.provider_id === PROVIDER_IDS.hbo)) providers.push('hbo');
    
    return providers;
  } catch (err) {
    console.error('Provider fetch error:', err.message);
    return [];
  }
}

async function updateAllProviders() {
  console.log('Fetching all movies from Firebase...\n');
  
  const snapshot = await getDocs(collection(db, 'movies'));
  const movies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  console.log(`Found ${movies.length} movies. Fetching providers...\n`);
  
  let count = 0;
  let updated = 0;
  
  for (const movie of movies) {
    count++;
    
    if (!movie.tmdbId) {
      console.log(`[${count}/${movies.length}] ⚠️ ${movie.title} - No TMDB ID, skipping`);
      continue;
    }
    
    const providers = await fetchProviders(movie.tmdbId);
    
    if (providers.length > 0) {
      await updateDoc(doc(db, 'movies', movie.id), { providers });
      updated++;
      console.log(`[${count}/${movies.length}] ✓ ${movie.title} - ${providers.join(', ')}`);
    } else {
      await updateDoc(doc(db, 'movies', movie.id), { providers: [] });
      console.log(`[${count}/${movies.length}] ✗ ${movie.title} - No providers found`);
    }
    
    // Rate limit
    await sleep(250);
  }
  
  console.log(`\nDone! Updated ${updated} movies with providers.`);
  process.exit(0);
}

updateAllProviders().catch(console.error);
