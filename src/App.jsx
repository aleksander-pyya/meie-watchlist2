import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAzPRXys5y8IeefUcNoo9KSYYHx2SW616o",
  authDomain: "watchlist-b0d26.firebaseapp.com",
  projectId: "watchlist-b0d26",
  storageBucket: "watchlist-b0d26.firebasestorage.app",
  messagingSenderId: "957805618122",
  appId: "1:957805618122:web:f7316be42ab6d8003f2533",
};

const TMDB_API_KEY = 'ee832f30efb14e179654a4803a61bfcd';
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w300';

const PROVIDER_IDS = {
  netflix: 8,
  disney: 337,
  hbo: 384,
};

const PLATFORMS = [
  { id: 'netflix', name: 'Netflix', icon: '🔴', color: 'bg-red-600' },
{ id: 'disney', name: 'Disney+', icon: '🏰', color: 'bg-blue-600' },
{ id: 'hbo', name: 'HBO Max', icon: '💜', color: 'bg-purple-600' },
{ id: 'go3', name: 'Go3', icon: '🟢', color: 'bg-green-600' },
];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const WatchlistApp = () => {
  const [activeTab, setActiveTab] = useState('shared');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [tmdbSearch, setTmdbSearch] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState('sassdaboss');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [showRandomizer, setShowRandomizer] = useState(false);
  const [randomMovie, setRandomMovie] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [movieOverview, setMovieOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'movies'), orderBy('title'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const movieList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMovies(movieList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedMovie) {
      const updated = movies.find(m => m.id === selectedMovie.id);
      if (updated) setSelectedMovie(updated);
    }
    if (randomMovie) {
      const updated = movies.find(m => m.id === randomMovie.id);
      if (updated) setRandomMovie(updated);
    }
  }, [movies]);

  // Fetch overview when movie is selected
  useEffect(() => {
    if (selectedMovie?.tmdbId) {
      fetchOverview(selectedMovie.tmdbId);
    } else {
      setMovieOverview(null);
    }
  }, [selectedMovie?.id]);

  const fetchOverview = async (tmdbId) => {
    setLoadingOverview(true);
    setMovieOverview(null);

    try {
      // First try Estonian
      const resEt = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=et-EE`
      );
      const dataEt = await resEt.json();

      if (dataEt.overview && dataEt.overview.trim()) {
        setMovieOverview(dataEt.overview);
      } else {
        // Fallback to English
        const resEn = await fetch(
          `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const dataEn = await resEn.json();
        setMovieOverview(dataEn.overview || null);
      }
    } catch (err) {
      console.error('Overview fetch error:', err);
      setMovieOverview(null);
    }

    setLoadingOverview(false);
  };

  const user1Movies = movies.filter(m => m.owners?.includes('sassdaboss'));
  const user2Movies = movies.filter(m => m.owners?.includes('katherinefierce'));
  const sharedMovies = movies.filter(m => m.owners?.includes('sassdaboss') && m.owners?.includes('katherinefierce'));
  const unwatchedShared = sharedMovies.filter(m => !m.watched);

  const pickRandomMovie = (source) => {
    let sourceMovies;
    switch (source) {
      case 'shared':
        sourceMovies = sharedMovies.filter(m => !m.watched);
        break;
      case 'sassdaboss':
        sourceMovies = user1Movies.filter(m => !m.watched);
        break;
      case 'katherinefierce':
        sourceMovies = user2Movies.filter(m => !m.watched);
        break;
      default:
        sourceMovies = movies.filter(m => !m.watched);
    }

    if (sourceMovies.length === 0) {
      alert('Selles nimekirjas pole vaatamata filme!');
      return;
    }

    setIsSpinning(true);
    setRandomMovie(null);

    let count = 0;
    const maxCount = 15;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * sourceMovies.length);
      setRandomMovie(sourceMovies[randomIndex]);
      count++;

      if (count >= maxCount) {
        clearInterval(interval);
        setIsSpinning(false);
        const finalIndex = Math.floor(Math.random() * sourceMovies.length);
        setRandomMovie(sourceMovies[finalIndex]);
      }
    }, 100);
  };

  const fetchProviders = async (movie) => {
    if (!movie.tmdbId) return;

    setLoadingProviders(true);

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`
      );
      const data = await res.json();

      const regionData = data.results?.EE || data.results?.US || {};
      const flatrate = regionData.flatrate || [];

      const providers = [];
      if (flatrate.some(p => p.provider_id === PROVIDER_IDS.netflix)) providers.push('netflix');
      if (flatrate.some(p => p.provider_id === PROVIDER_IDS.disney)) providers.push('disney');
      if (flatrate.some(p => p.provider_id === PROVIDER_IDS.hbo)) providers.push('hbo');

      if (movie.providers?.includes('go3')) providers.push('go3');

      await updateDoc(doc(db, 'movies', movie.id), { providers });
    } catch (err) {
      console.error('Provider fetch error:', err);
    }

    setLoadingProviders(false);
  };

  const togglePlatform = async (movie, platform) => {
    const currentProviders = movie.providers || [];
    const newProviders = currentProviders.includes(platform)
    ? currentProviders.filter(p => p !== platform)
    : [...currentProviders, platform];

    await updateDoc(doc(db, 'movies', movie.id), { providers: newProviders });
  };

  const searchTMDB = async (query) => {
    if (!query.trim()) {
      setTmdbResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=et-EE`
      );
      const data = await res.json();
      setTmdbResults(data.results?.slice(0, 8) || []);
    } catch (err) {
      console.error('TMDB search error:', err);
    }
    setSearching(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (tmdbSearch) searchTMDB(tmdbSearch);
    }, 300);
      return () => clearTimeout(timer);
  }, [tmdbSearch]);

  const addMovieFromTMDB = async (tmdbMovie) => {
    const exists = movies.find(m => m.tmdbId === tmdbMovie.id);
    if (exists) {
      if (!exists.owners.includes(selectedOwner)) {
        await updateDoc(doc(db, 'movies', exists.id), {
          owners: [...exists.owners, selectedOwner]
        });
      }
    } else {
      await addDoc(collection(db, 'movies'), {
        title: tmdbMovie.title,
        year: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.split('-')[0]) : null,
                   poster: tmdbMovie.poster_path,
                   tmdbId: tmdbMovie.id,
                   owners: [selectedOwner],
                   watched: false,
                   providers: [],
                   createdAt: new Date()
      });
    }
    setTmdbSearch('');
    setTmdbResults([]);
    setShowAddForm(false);
  };

  const toggleOwner = async (movie, owner) => {
    const newOwners = movie.owners.includes(owner)
    ? movie.owners.filter(o => o !== owner)
    : [...movie.owners, owner];

    if (newOwners.length === 0) {
      await deleteDoc(doc(db, 'movies', movie.id));
      setSelectedMovie(null);
      setRandomMovie(null);
    } else {
      await updateDoc(doc(db, 'movies', movie.id), { owners: newOwners });
    }
  };

  const toggleWatched = async (movie) => {
    await updateDoc(doc(db, 'movies', movie.id), { watched: !movie.watched });
  };

  const deleteMovie = async (movieId) => {
    await deleteDoc(doc(db, 'movies', movieId));
    setSelectedMovie(null);
    setRandomMovie(null);
  };

  const filterSort = (movieList) => {
    let f = movieList;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      f = f.filter(m => m.title.toLowerCase().includes(q) || (m.year && m.year.toString().includes(q)));
    }

    if (filterPlatform !== 'all') {
      f = f.filter(m => m.providers?.includes(filterPlatform));
    }

    return f.sort((a, b) => {
      if (sortBy === 'year') return (b.year || 0) - (a.year || 0);
      return a.title.localeCompare(b.title);
    });
  };

  const displayMovies = filterSort(
    activeTab === 'shared' ? sharedMovies :
    activeTab === 'all' ? movies :
    activeTab === 'user1' ? user1Movies : user2Movies
  );

  const tabs = [
    { id: 'shared', label: '💕 Ühised', count: sharedMovies.length },
    { id: 'all', label: '🎬 Kõik', count: movies.length },
    { id: 'user1', label: '👤 sassdaboss', count: user1Movies.length },
    { id: 'user2', label: '👤 katherinefierce', count: user2Movies.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
      <div className="text-6xl mb-4 animate-bounce">🎬</div>
      <p className="text-amber-200 text-xl">Laadin filme...</p>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
    </div>

    <div className="relative max-w-7xl mx-auto px-4 py-8">
    <header className="text-center mb-10">
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3">
    <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
    Meie Watchlist
    </span>
    <span className="ml-2">💕</span>
    </h1>
    <p className="text-amber-200/60 text-lg">sassdaboss & katherinefierce</p>
    </header>

    {activeTab === 'shared' && unwatchedShared.length > 0 && (
      <div className="mb-8 p-4 sm:p-6 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-orange-500/10 rounded-2xl border border-rose-500/20 text-center">
      <p className="text-lg sm:text-xl text-rose-100">
      🎉 Teil on <span className="font-bold text-rose-300 text-xl sm:text-2xl">{unwatchedShared.length}</span> vaatamata ühist filmi! 🎉
      </p>
      </div>
    )}

    <nav className="flex flex-wrap justify-center gap-2 mb-6">
    {tabs.map(tab => (
      <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`px-3 sm:px-5 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
        activeTab === tab.id
        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-lg shadow-amber-500/30 scale-105'
        : 'bg-slate-800/60 text-amber-200/80 hover:bg-slate-700/60'
      }`}
      >
      {tab.label}
      <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-slate-900/30' : 'bg-slate-700/60'}`}>
      {tab.count}
      </span>
      </button>
    ))}
    </nav>

    {/* Filters */}
    <div className="flex flex-col gap-3 mb-6 max-w-4xl mx-auto">
    <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1">
    <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Otsi filme..."
    className="w-full px-5 py-3 pl-12 bg-slate-800/60 border border-slate-700/50 rounded-xl text-amber-50 placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
    />
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
    </div>
    <button
    onClick={() => setShowAddForm(!showAddForm)}
    className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-xl transition-all"
    >
    ➕ Lisa
    </button>
    <button
    onClick={() => setShowRandomizer(true)}
    className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all"
    >
    🎲 Random
    </button>
    </div>

    <div className="flex flex-row gap-3">
    <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="flex-1 px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-amber-200 focus:outline-none cursor-pointer"
    >
    <option value="title">Tähestiku järgi</option>
    <option value="year">Aasta järgi</option>
    </select>
    <select
    value={filterPlatform}
    onChange={(e) => setFilterPlatform(e.target.value)}
    className="flex-1 px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-amber-200 focus:outline-none cursor-pointer"
    >
    <option value="all">🎬 Kõik</option>
    <option value="netflix">🔴 Netflix</option>
    <option value="disney">🏰 Disney+</option>
    <option value="hbo">💜 HBO Max</option>
    <option value="go3">🟢 Go3</option>
    </select>
    </div>
    </div>

    {showAddForm && (
      <div className="mb-8 p-4 sm:p-6 bg-slate-800/60 rounded-2xl max-w-2xl mx-auto">
      <h3 className="text-amber-100 font-bold mb-4 text-lg">Lisa uus film</h3>
      <div className="flex gap-3 mb-4">
      <select
      value={selectedOwner}
      onChange={(e) => setSelectedOwner(e.target.value)}
      className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-amber-200 focus:outline-none cursor-pointer"
      >
      <option value="sassdaboss">sassdaboss</option>
      <option value="katherinefierce">katherinefierce</option>
      </select>
      </div>
      <div className="relative">
      <input
      type="text"
      value={tmdbSearch}
      onChange={(e) => setTmdbSearch(e.target.value)}
      placeholder="Otsi filmi nime järgi..."
      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-amber-50 placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
      />
      {searching && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      </div>

      {tmdbResults.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
        {tmdbResults.map(movie => (
          <button
          key={movie.id}
          onClick={() => addMovieFromTMDB(movie)}
          className="bg-slate-700/50 rounded-lg overflow-hidden hover:ring-2 hover:ring-amber-500 transition-all text-left"
          >
          {movie.poster_path ? (
            <img
            src={`${TMDB_IMG_BASE}${movie.poster_path}`}
            alt={movie.title}
            className="w-full aspect-[2/3] object-cover"
            />
          ) : (
            <div className="w-full aspect-[2/3] bg-slate-600 flex items-center justify-center">
            <span className="text-4xl">🎬</span>
            </div>
          )}
          <div className="p-2">
          <p className="text-amber-50 text-xs font-medium line-clamp-2">{movie.title}</p>
          <p className="text-amber-200/50 text-xs">{movie.release_date?.split('-')[0]}</p>
          </div>
          </button>
        ))}
        </div>
      )}
      </div>
    )}

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
    {displayMovies.map((movie) => {
      const isShared = movie.owners?.length === 2;
      return (
        <div
        key={movie.id}
        onClick={() => setSelectedMovie(movie)}
        className={`cursor-pointer relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl overflow-hidden shadow-lg transition-all duration-300 active:scale-95 ${
          isShared ? 'ring-2 ring-rose-500/30' : ''
        } ${movie.watched ? 'opacity-60' : ''}`}
        >
        <div className="aspect-[2/3] bg-gradient-to-br from-slate-700/50 to-slate-800/50 relative overflow-hidden">
        {movie.poster ? (
          <img
          src={`${TMDB_IMG_BASE}${movie.poster}`}
          alt={movie.title}
          className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
          <div className="text-center p-3">
          <div className="text-4xl mb-2">🎬</div>
          <p className="text-amber-100/60 text-xs leading-tight line-clamp-3">{movie.title}</p>
          </div>
          </div>
        )}
        </div>

        {/* Owner badges */}
        <div className="absolute top-2 left-2 flex gap-1">
        {movie.owners?.includes('sassdaboss') && (
          <span className="px-1.5 py-0.5 bg-cyan-500/90 text-white text-[10px] font-bold rounded-full shadow">S</span>
        )}
        {movie.owners?.includes('katherinefierce') && (
          <span className="px-1.5 py-0.5 bg-rose-500/90 text-white text-[10px] font-bold rounded-full shadow">K</span>
        )}
        </div>

        {/* Platform badges */}
        {movie.providers?.length > 0 && (
          <div className="absolute top-2 right-2 flex gap-0.5">
          {movie.providers.slice(0, 3).map(p => {
            const platform = PLATFORMS.find(pl => pl.id === p);
            return platform ? (
              <span key={p} className="text-sm drop-shadow" title={platform.name}>
              {platform.icon}
              </span>
            ) : null;
          })}
          </div>
        )}

        {movie.watched && (
          <div className="absolute bottom-12 right-2">
          <span className="text-green-400 text-lg drop-shadow">✅</span>
          </div>
        )}

        <div className="p-2 sm:p-3">
        <h3 className="font-semibold text-amber-50 text-xs sm:text-sm leading-tight line-clamp-2">{movie.title}</h3>
        {movie.year && <p className="text-amber-200/50 text-xs mt-1">{movie.year}</p>}
        </div>
        </div>
      );
    })}
    </div>

    {displayMovies.length === 0 && (
      <div className="text-center py-20">
      <div className="text-6xl mb-4">🎞️</div>
      <p className="text-amber-200/60 text-lg">
      {searchQuery || filterPlatform !== 'all' ? 'Filme ei leitud' : 'Lisa esimene film! ➕'}
      </p>
      </div>
    )}

    <footer className="mt-12 text-center">
    <p className="text-amber-200/40 text-sm">
    Kokku {movies.length} filmi • {sharedMovies.length} ühist • {movies.filter(m => m.watched).length} nähtud
    </p>
    </footer>
    </div>

    {/* Randomizer Modal */}
    {showRandomizer && (
      <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSpinning) {
          setShowRandomizer(false);
          setRandomMovie(null);
        }
      }}
      >
      <div className="bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden">
      <div className="p-6">
      <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-amber-100">🎲 Juhuslik film</h2>
      {!isSpinning && (
        <button
        onClick={() => {
          setShowRandomizer(false);
          setRandomMovie(null);
        }}
        className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white text-xl"
        >
        ✕
        </button>
      )}
      </div>

      {!randomMovie && !isSpinning && (
        <div className="space-y-3">
        <p className="text-amber-200/60 text-center mb-4">Vali, millisest nimekirjast:</p>
        <button
        onClick={() => pickRandomMovie('shared')}
        className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all text-lg"
        >
        💕 Ühised ({unwatchedShared.length} vaatamata)
        </button>
        <button
        onClick={() => pickRandomMovie('sassdaboss')}
        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-xl transition-all text-lg"
        >
        👤 sassdaboss ({user1Movies.filter(m => !m.watched).length} vaatamata)
        </button>
        <button
        onClick={() => pickRandomMovie('katherinefierce')}
        className="w-full py-4 bg-gradient-to-r from-rose-400 to-red-500 hover:from-rose-300 hover:to-red-400 text-white font-bold rounded-xl transition-all text-lg"
        >
        👤 katherinefierce ({user2Movies.filter(m => !m.watched).length} vaatamata)
        </button>
        <button
        onClick={() => pickRandomMovie('all')}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl transition-all text-lg"
        >
        🎬 Kõik ({movies.filter(m => !m.watched).length} vaatamata)
        </button>
        </div>
      )}

      {(randomMovie || isSpinning) && (
        <div className="text-center">
        <div className={`relative ${isSpinning ? 'animate-pulse' : ''}`}>
        {randomMovie?.poster ? (
          <img
          src={`${TMDB_IMG_BASE}${randomMovie.poster}`}
          alt={randomMovie.title}
          className="w-48 h-72 object-cover rounded-xl mx-auto shadow-2xl"
          />
        ) : (
          <div className="w-48 h-72 bg-slate-800 rounded-xl mx-auto flex items-center justify-center">
          <span className="text-6xl">🎬</span>
          </div>
        )}
        {isSpinning && (
          <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl animate-spin">🎲</div>
          </div>
        )}
        </div>

        {randomMovie && (
          <div className="mt-4">
          <h3 className="text-xl font-bold text-amber-100">{randomMovie.title}</h3>
          {randomMovie.year && <p className="text-amber-200/60">{randomMovie.year}</p>}

          {randomMovie.providers?.length > 0 && (
            <div className="flex justify-center gap-2 mt-2">
            {randomMovie.providers.map(p => {
              const platform = PLATFORMS.find(pl => pl.id === p);
              return platform ? (
                <span key={p} className="text-2xl" title={platform.name}>
                {platform.icon}
                </span>
              ) : null;
            })}
            </div>
          )}
          </div>
        )}

        {!isSpinning && randomMovie && (
          <div className="mt-6 space-y-3">
          <button
          onClick={() => {
            setSelectedMovie(randomMovie);
            setShowRandomizer(false);
            setRandomMovie(null);
          }}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-xl transition-all"
          >
          ✅ Vaata seda!
          </button>
          <button
          onClick={() => setRandomMovie(null)}
          className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
          >
          🎲 Proovi uuesti
          </button>
          </div>
        )}
        </div>
      )}
      </div>
      </div>
      </div>
    )}

    {/* Movie Detail Modal */}
    {selectedMovie && (
      <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedMovie(null);
      }}
      >
      <div className="bg-slate-900 w-full sm:max-w-lg sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
      {/* Header with poster */}
      <div className="relative">
      {selectedMovie.poster ? (
        <img
        src={`${TMDB_IMG_BASE}${selectedMovie.poster}`}
        alt={selectedMovie.title}
        className="w-full h-48 sm:h-64 object-cover"
        />
      ) : (
        <div className="w-full h-48 sm:h-64 bg-slate-800 flex items-center justify-center">
        <span className="text-6xl">🎬</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      <button
      onClick={() => setSelectedMovie(null)}
      className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-xl"
      >
      ✕
      </button>
      <div className="absolute bottom-4 left-4 right-4">
      <h2 className="text-2xl font-bold text-white mb-1">{selectedMovie.title}</h2>
      {selectedMovie.year && <p className="text-amber-200/80">{selectedMovie.year}</p>}
      </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
      {/* Overview / Tutvustus */}
      {(movieOverview || loadingOverview) && (
        <div className="bg-slate-800/50 rounded-xl p-4">
        <h3 className="text-amber-200/80 text-sm font-semibold mb-2">📖 Tutvustus</h3>
        {loadingOverview ? (
          <div className="flex items-center gap-2 text-amber-200/60">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Laadin...</span>
          </div>
        ) : (
          <p className="text-amber-100/90 text-sm leading-relaxed">{movieOverview}</p>
        )}
        </div>
      )}

      {/* Watched toggle */}
      <button
      onClick={() => toggleWatched(selectedMovie)}
      className={`w-full py-3 rounded-xl text-lg font-semibold transition-all ${
        selectedMovie.watched
        ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
        : 'bg-green-500 hover:bg-green-400 text-white'
      }`}
      >
      {selectedMovie.watched ? '↩️ Märgi vaatamata' : '✅ Märgi nähtuks'}
      </button>

      {/* Owner selection */}
      <div>
      <p className="text-amber-200/60 text-sm mb-2">Kelle listis:</p>
      <div className="flex gap-2">
      <button
      onClick={() => toggleOwner(selectedMovie, 'sassdaboss')}
      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
        selectedMovie.owners?.includes('sassdaboss')
        ? 'bg-cyan-500 text-white'
        : 'bg-slate-700 text-slate-300'
      }`}
      >
      👤 sassdaboss
      </button>
      <button
      onClick={() => toggleOwner(selectedMovie, 'katherinefierce')}
      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
        selectedMovie.owners?.includes('katherinefierce')
        ? 'bg-rose-500 text-white'
        : 'bg-slate-700 text-slate-300'
      }`}
      >
      👤 katherinefierce
      </button>
      </div>
      </div>

      {/* Platforms */}
      <div>
      <div className="flex items-center justify-between mb-2">
      <p className="text-amber-200/60 text-sm">Saadaval:</p>
      {selectedMovie.tmdbId && (
        <button
        onClick={() => fetchProviders(selectedMovie)}
        disabled={loadingProviders}
        className="text-sm text-amber-400 hover:text-amber-300 disabled:opacity-50"
        >
        {loadingProviders ? '⏳ Otsin...' : '🔄 Otsi automaatselt'}
        </button>
      )}
      </div>
      <div className="grid grid-cols-2 gap-2">
      {PLATFORMS.map(platform => (
        <button
        key={platform.id}
        onClick={() => togglePlatform(selectedMovie, platform.id)}
        className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
          selectedMovie.providers?.includes(platform.id)
          ? `${platform.color} text-white`
          : 'bg-slate-700 text-slate-300'
        }`}
        >
        <span className="text-xl">{platform.icon}</span>
        <span>{platform.name}</span>
        </button>
      ))}
      </div>
      </div>

      {/* Delete */}
      <button
      onClick={() => {
        if (confirm('Kas oled kindel, et tahad selle filmi kustutada?')) {
          deleteMovie(selectedMovie.id);
        }
      }}
      className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-semibold transition-all"
      >
      🗑️ Kustuta film
      </button>
      </div>
      </div>
      </div>
    )}
    </div>
  );
};

export default WatchlistApp;
