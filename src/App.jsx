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
  { id: 'netflix', name: 'Netflix', icon: 'N', color: 'bg-red-600' },
{ id: 'disney', name: 'Disney+', icon: 'D+', color: 'bg-blue-600' },
{ id: 'hbo', name: 'HBO Max', icon: 'HBO', color: 'bg-purple-600' },
{ id: 'go3', name: 'Go3', icon: 'G3', color: 'bg-green-600' },
];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Custom Icons as SVG components
const HeartIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const FilmIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
  <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const DiceIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z"/>
  </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const RefreshIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
  </svg>
);

const UndoIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
  <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
  </svg>
);

const StarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

const BookIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
  </svg>
);

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
      const resEt = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=et-EE`
      );
      const dataEt = await resEt.json();

      if (dataEt.overview && dataEt.overview.trim()) {
        setMovieOverview(dataEt.overview);
      } else {
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
    { id: 'shared', label: 'Ühised', icon: HeartIcon, count: sharedMovies.length },
    { id: 'all', label: 'Kõik', icon: FilmIcon, count: movies.length },
    { id: 'user1', label: 'sassdaboss', icon: UserIcon, count: user1Movies.length },
    { id: 'user2', label: 'katherinefierce', icon: UserIcon, count: user2Movies.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)' }}>
      <div className="text-center">
      <div className="mb-4">
      <FilmIcon className="w-16 h-16 mx-auto animate-bounce" style={{ color: '#D6F74C' }} />
      </div>
      <p className="text-xl" style={{ color: '#FCD9BE' }}>Laadin filme...</p>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)' }}>
    {/* Decorative elements */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: '#D6F74C' }} />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: '#F06038' }} />
    <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: '#8C9EFF' }} />
    </div>

    <div className="relative max-w-7xl mx-auto px-4 py-8">
    {/* Header */}
    <header className="text-center mb-10">
    <div className="flex items-center justify-center gap-3 mb-3">
    <StarIcon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#D6F74C' }} />
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight" style={{ color: '#FCD9BE' }}>
    Meie Watchlist
    </h1>
    <StarIcon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#D6F74C' }} />
    </div>
    <p className="text-lg opacity-70" style={{ color: '#8C9EFF' }}>sassdaboss & katherinefierce</p>
    </header>

    {/* Shared movies banner */}
    {activeTab === 'shared' && unwatchedShared.length > 0 && (
      <div
      className="mb-8 p-4 sm:p-6 rounded-2xl text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(240,96,56,0.15) 0%, rgba(214,247,76,0.15) 100%)',
                                                              border: '1px solid rgba(240,96,56,0.3)'
      }}
      >
      <p className="text-lg sm:text-xl" style={{ color: '#FCD9BE' }}>
      Teil on <span className="font-bold text-xl sm:text-2xl" style={{ color: '#D6F74C' }}>{unwatchedShared.length}</span> vaatamata ühist filmi!
      </p>
      </div>
    )}

    {/* Navigation tabs */}
    <nav className="flex flex-wrap justify-center gap-2 mb-6">
    {tabs.map(tab => {
      const IconComponent = tab.icon;
      return (
        <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`px-3 sm:px-5 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center gap-2 ${
          activeTab === tab.id ? 'scale-105 shadow-lg' : 'opacity-70 hover:opacity-100'
        }`}
        style={{
          background: activeTab === tab.id
          ? 'linear-gradient(135deg, #F06038 0%, #D6F74C 100%)'
          : 'rgba(140,158,255,0.2)',
              color: activeTab === tab.id ? '#1a1a2e' : '#FCD9BE',
              boxShadow: activeTab === tab.id ? '0 4px 20px rgba(240,96,56,0.3)' : 'none'
        }}
        >
        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">{tab.label}</span>
        <span
        className="px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold"
        style={{
          background: activeTab === tab.id ? 'rgba(26,26,46,0.3)' : 'rgba(140,158,255,0.3)'
        }}
        >
        {tab.count}
        </span>
        </button>
      );
    })}
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
    className="w-full px-5 py-3 pl-12 rounded-xl focus:outline-none transition-all"
    style={{
      background: 'rgba(140,158,255,0.15)',
          border: '1px solid rgba(140,158,255,0.3)',
          color: '#FCD9BE'
    }}
    />
    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8C9EFF' }} />
    </div>
    <button
    onClick={() => setShowAddForm(!showAddForm)}
    className="px-5 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:scale-105"
    style={{
      background: 'linear-gradient(135deg, #D6F74C 0%, #8C9EFF 100%)',
          color: '#1a1a2e'
    }}
    >
    <PlusIcon className="w-5 h-5" />
    <span>Lisa</span>
    </button>
    <button
    onClick={() => setShowRandomizer(true)}
    className="px-5 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:scale-105"
    style={{
      background: 'linear-gradient(135deg, #F06038 0%, #FCD9BE 100%)',
          color: '#1a1a2e'
    }}
    >
    <DiceIcon className="w-5 h-5" />
    <span>Random</span>
    </button>
    </div>

    <div className="flex flex-row gap-3">
    <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="flex-1 px-4 py-3 rounded-xl focus:outline-none cursor-pointer"
    style={{
      background: 'rgba(140,158,255,0.15)',
          border: '1px solid rgba(140,158,255,0.3)',
          color: '#FCD9BE'
    }}
    >
    <option value="title">Tähestiku järgi</option>
    <option value="year">Aasta järgi</option>
    </select>
    <select
    value={filterPlatform}
    onChange={(e) => setFilterPlatform(e.target.value)}
    className="flex-1 px-4 py-3 rounded-xl focus:outline-none cursor-pointer"
    style={{
      background: 'rgba(140,158,255,0.15)',
          border: '1px solid rgba(140,158,255,0.3)',
          color: '#FCD9BE'
    }}
    >
    <option value="all">Kõik platvormid</option>
    <option value="netflix">Netflix</option>
    <option value="disney">Disney+</option>
    <option value="hbo">HBO Max</option>
    <option value="go3">Go3</option>
    </select>
    </div>
    </div>

    {/* Add form */}
    {showAddForm && (
      <div
      className="mb-8 p-4 sm:p-6 rounded-2xl max-w-2xl mx-auto"
      style={{
        background: 'rgba(140,158,255,0.1)',
                     border: '1px solid rgba(140,158,255,0.2)'
      }}
      >
      <h3 className="font-bold mb-4 text-lg" style={{ color: '#FCD9BE' }}>Lisa uus film</h3>
      <div className="flex gap-3 mb-4">
      <select
      value={selectedOwner}
      onChange={(e) => setSelectedOwner(e.target.value)}
      className="flex-1 px-4 py-3 rounded-xl focus:outline-none cursor-pointer"
      style={{
        background: 'rgba(26,26,46,0.5)',
                     border: '1px solid rgba(140,158,255,0.3)',
                     color: '#FCD9BE'
      }}
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
      className="w-full px-4 py-3 rounded-xl focus:outline-none"
      style={{
        background: 'rgba(26,26,46,0.5)',
                     border: '1px solid rgba(140,158,255,0.3)',
                     color: '#FCD9BE'
      }}
      />
      {searching && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <RefreshIcon className="w-5 h-5 animate-spin" style={{ color: '#D6F74C' }} />
        </div>
      )}
      </div>

      {tmdbResults.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
        {tmdbResults.map(movie => (
          <button
          key={movie.id}
          onClick={() => addMovieFromTMDB(movie)}
          className="rounded-lg overflow-hidden transition-all text-left hover:scale-105"
          style={{
            background: 'rgba(26,26,46,0.5)',
                                   border: '2px solid transparent'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#D6F74C'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
          {movie.poster_path ? (
            <img
            src={`${TMDB_IMG_BASE}${movie.poster_path}`}
            alt={movie.title}
            className="w-full aspect-[2/3] object-cover"
            />
          ) : (
            <div className="w-full aspect-[2/3] flex items-center justify-center" style={{ background: 'rgba(140,158,255,0.2)' }}>
            <FilmIcon className="w-10 h-10" style={{ color: '#8C9EFF' }} />
            </div>
          )}
          <div className="p-2">
          <p className="text-xs font-medium line-clamp-2" style={{ color: '#FCD9BE' }}>{movie.title}</p>
          <p className="text-xs opacity-50" style={{ color: '#8C9EFF' }}>{movie.release_date?.split('-')[0]}</p>
          </div>
          </button>
        ))}
        </div>
      )}
      </div>
    )}

    {/* Movie grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
    {displayMovies.map((movie) => {
      const isShared = movie.owners?.length === 2;
      return (
        <div
        key={movie.id}
        onClick={() => setSelectedMovie(movie)}
        className={`cursor-pointer relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 active:scale-95 hover:scale-105 ${movie.watched ? 'opacity-60' : ''}`}
        style={{
          background: 'linear-gradient(135deg, rgba(26,26,46,0.9) 0%, rgba(22,33,62,0.9) 100%)',
              border: isShared ? '2px solid rgba(240,96,56,0.5)' : '1px solid rgba(140,158,255,0.2)'
        }}
        >
        <div className="aspect-[2/3] relative overflow-hidden" style={{ background: 'rgba(140,158,255,0.1)' }}>
        {movie.poster ? (
          <img
          src={`${TMDB_IMG_BASE}${movie.poster}`}
          alt={movie.title}
          className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
          <div className="text-center p-3">
          <FilmIcon className="w-10 h-10 mx-auto mb-2" style={{ color: '#8C9EFF' }} />
          <p className="text-xs leading-tight line-clamp-3 opacity-60" style={{ color: '#FCD9BE' }}>{movie.title}</p>
          </div>
          </div>
        )}
        </div>

        {/* Owner badges */}
        <div className="absolute top-2 left-2 flex gap-1">
        {movie.owners?.includes('sassdaboss') && (
          <span
          className="px-1.5 py-0.5 text-[10px] font-bold rounded-full shadow"
          style={{ background: '#8C9EFF', color: '#1a1a2e' }}
          >
          S
          </span>
        )}
        {movie.owners?.includes('katherinefierce') && (
          <span
          className="px-1.5 py-0.5 text-[10px] font-bold rounded-full shadow"
          style={{ background: '#F06038', color: '#1a1a2e' }}
          >
          K
          </span>
        )}
        </div>

        {/* Platform badges */}
        {movie.providers?.length > 0 && (
          <div className="absolute top-2 right-2 flex gap-0.5">
          {movie.providers.slice(0, 3).map(p => {
            const platform = PLATFORMS.find(pl => pl.id === p);
            return platform ? (
              <span
              key={p}
              className="text-[9px] font-bold px-1 rounded"
              style={{ background: 'rgba(26,26,46,0.8)', color: '#D6F74C' }}
              title={platform.name}
              >
              {platform.icon}
              </span>
            ) : null;
          })}
          </div>
        )}

        {movie.watched && (
          <div className="absolute bottom-12 right-2">
          <CheckIcon className="w-5 h-5" style={{ color: '#D6F74C' }} />
          </div>
        )}

        <div className="p-2 sm:p-3">
        <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2" style={{ color: '#FCD9BE' }}>{movie.title}</h3>
        {movie.year && <p className="text-xs mt-1 opacity-50" style={{ color: '#8C9EFF' }}>{movie.year}</p>}
        </div>
        </div>
      );
    })}
    </div>

    {displayMovies.length === 0 && (
      <div className="text-center py-20">
      <FilmIcon className="w-16 h-16 mx-auto mb-4" style={{ color: '#8C9EFF', opacity: 0.5 }} />
      <p className="text-lg opacity-60" style={{ color: '#FCD9BE' }}>
      {searchQuery || filterPlatform !== 'all' ? 'Filme ei leitud' : 'Lisa esimene film!'}
      </p>
      </div>
    )}

    {/* Footer */}
    <footer className="mt-12 text-center">
    <p className="text-sm opacity-40" style={{ color: '#8C9EFF' }}>
    Kokku {movies.length} filmi · {sharedMovies.length} ühist · {movies.filter(m => m.watched).length} nähtud
    </p>
    </footer>
    </div>

    {/* Randomizer Modal */}
    {showRandomizer && (
      <div
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,46,0.9)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSpinning) {
          setShowRandomizer(false);
          setRandomMovie(null);
        }
      }}
      >
      <div
      className="w-full max-w-md rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        border: '1px solid rgba(140,158,255,0.3)'
      }}
      >
      <div className="p-6">
      <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
      <DiceIcon className="w-6 h-6" style={{ color: '#D6F74C' }} />
      <h2 className="text-2xl font-bold" style={{ color: '#FCD9BE' }}>Juhuslik film</h2>
      </div>
      {!isSpinning && (
        <button
        onClick={() => {
          setShowRandomizer(false);
          setRandomMovie(null);
        }}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(140,158,255,0.2)' }}
        >
        <CloseIcon className="w-5 h-5" style={{ color: '#FCD9BE' }} />
        </button>
      )}
      </div>

      {!randomMovie && !isSpinning && (
        <div className="space-y-3">
        <p className="text-center mb-4 opacity-60" style={{ color: '#8C9EFF' }}>Vali, millisest nimekirjast:</p>
        <button
        onClick={() => pickRandomMovie('shared')}
        className="w-full py-4 rounded-xl font-bold transition-all text-lg hover:scale-105 flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #F06038 0%, #FCD9BE 100%)',
                                       color: '#1a1a2e'
        }}
        >
        <HeartIcon className="w-5 h-5" />
        Ühised ({unwatchedShared.length} vaatamata)
        </button>
        <button
        onClick={() => pickRandomMovie('sassdaboss')}
        className="w-full py-4 rounded-xl font-bold transition-all text-lg hover:scale-105 flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #8C9EFF 0%, #D6F74C 100%)',
                                       color: '#1a1a2e'
        }}
        >
        <UserIcon className="w-5 h-5" />
        sassdaboss ({user1Movies.filter(m => !m.watched).length} vaatamata)
        </button>
        <button
        onClick={() => pickRandomMovie('katherinefierce')}
        className="w-full py-4 rounded-xl font-bold transition-all text-lg hover:scale-105 flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #F06038 0%, #8C9EFF 100%)',
                                       color: '#1a1a2e'
        }}
        >
        <UserIcon className="w-5 h-5" />
        katherinefierce ({user2Movies.filter(m => !m.watched).length} vaatamata)
        </button>
        <button
        onClick={() => pickRandomMovie('all')}
        className="w-full py-4 rounded-xl font-bold transition-all text-lg hover:scale-105 flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #D6F74C 0%, #FCD9BE 100%)',
                                       color: '#1a1a2e'
        }}
        >
        <FilmIcon className="w-5 h-5" />
        Kõik ({movies.filter(m => !m.watched).length} vaatamata)
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
          style={{ boxShadow: '0 8px 32px rgba(240,96,56,0.3)' }}
          />
        ) : (
          <div
          className="w-48 h-72 rounded-xl mx-auto flex items-center justify-center"
          style={{ background: 'rgba(140,158,255,0.2)' }}
          >
          <FilmIcon className="w-16 h-16" style={{ color: '#8C9EFF' }} />
          </div>
        )}
        {isSpinning && (
          <div className="absolute inset-0 flex items-center justify-center">
          <DiceIcon className="w-16 h-16 animate-spin" style={{ color: '#D6F74C' }} />
          </div>
        )}
        </div>

        {randomMovie && (
          <div className="mt-4">
          <h3 className="text-xl font-bold" style={{ color: '#FCD9BE' }}>{randomMovie.title}</h3>
          {randomMovie.year && <p className="opacity-60" style={{ color: '#8C9EFF' }}>{randomMovie.year}</p>}

          {randomMovie.providers?.length > 0 && (
            <div className="flex justify-center gap-2 mt-2">
            {randomMovie.providers.map(p => {
              const platform = PLATFORMS.find(pl => pl.id === p);
              return platform ? (
                <span
                key={p}
                className="text-sm font-bold px-2 py-1 rounded"
                style={{ background: 'rgba(214,247,76,0.2)', color: '#D6F74C' }}
                title={platform.name}
                >
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
          className="w-full py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #D6F74C 0%, #8C9EFF 100%)',
                                        color: '#1a1a2e'
          }}
          >
          <CheckIcon className="w-5 h-5" />
          Vaata seda!
          </button>
          <button
          onClick={() => setRandomMovie(null)}
          className="w-full py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
          style={{
            background: 'rgba(140,158,255,0.2)',
                                        color: '#FCD9BE'
          }}
          >
          <DiceIcon className="w-5 h-5" />
          Proovi uuesti
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
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(26,26,46,0.9)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedMovie(null);
      }}
      >
      <div
      className="w-full sm:max-w-lg sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                       border: '1px solid rgba(140,158,255,0.3)'
      }}
      >
      {/* Header with poster */}
      <div className="relative">
      {selectedMovie.poster ? (
        <img
        src={`${TMDB_IMG_BASE}${selectedMovie.poster}`}
        alt={selectedMovie.title}
        className="w-full h-48 sm:h-64 object-cover"
        />
      ) : (
        <div
        className="w-full h-48 sm:h-64 flex items-center justify-center"
        style={{ background: 'rgba(140,158,255,0.2)' }}
        >
        <FilmIcon className="w-16 h-16" style={{ color: '#8C9EFF' }} />
        </div>
      )}
      <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(to top, #1a1a2e 0%, transparent 100%)' }}
      />
      <button
      onClick={() => setSelectedMovie(null)}
      className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
      style={{ background: 'rgba(26,26,46,0.8)' }}
      >
      <CloseIcon className="w-5 h-5" style={{ color: '#FCD9BE' }} />
      </button>
      <div className="absolute bottom-4 left-4 right-4">
      <h2 className="text-2xl font-bold mb-1" style={{ color: '#FCD9BE' }}>{selectedMovie.title}</h2>
      {selectedMovie.year && <p style={{ color: '#8C9EFF' }}>{selectedMovie.year}</p>}
      </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
      {/* Overview */}
      {(movieOverview || loadingOverview) && (
        <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(140,158,255,0.1)' }}
        >
        <div className="flex items-center gap-2 mb-2">
        <BookIcon className="w-4 h-4" style={{ color: '#D6F74C' }} />
        <h3 className="text-sm font-semibold" style={{ color: '#8C9EFF' }}>Tutvustus</h3>
        </div>
        {loadingOverview ? (
          <div className="flex items-center gap-2" style={{ color: '#8C9EFF' }}>
          <RefreshIcon className="w-4 h-4 animate-spin" />
          <span>Laadin...</span>
          </div>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: '#FCD9BE' }}>{movieOverview}</p>
        )}
        </div>
      )}

      {/* Watched toggle */}
      <button
      onClick={() => toggleWatched(selectedMovie)}
      className="w-full py-3 rounded-xl text-lg font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
      style={{
        background: selectedMovie.watched
        ? 'linear-gradient(135deg, #F06038 0%, #FCD9BE 100%)'
        : 'linear-gradient(135deg, #D6F74C 0%, #8C9EFF 100%)',
                       color: '#1a1a2e'
      }}
      >
      {selectedMovie.watched ? (
        <>
        <UndoIcon className="w-5 h-5" />
        Märgi vaatamata
        </>
      ) : (
        <>
        <CheckIcon className="w-5 h-5" />
        Märgi nähtuks
        </>
      )}
      </button>

      {/* Owner selection */}
      <div>
      <p className="text-sm mb-2 opacity-60" style={{ color: '#8C9EFF' }}>Kelle listis:</p>
      <div className="flex gap-2">
      <button
      onClick={() => toggleOwner(selectedMovie, 'sassdaboss')}
      className="flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
      style={{
        background: selectedMovie.owners?.includes('sassdaboss')
        ? '#8C9EFF'
        : 'rgba(140,158,255,0.2)',
                       color: selectedMovie.owners?.includes('sassdaboss') ? '#1a1a2e' : '#FCD9BE'
      }}
      >
      <UserIcon className="w-4 h-4" />
      sassdaboss
      </button>
      <button
      onClick={() => toggleOwner(selectedMovie, 'katherinefierce')}
      className="flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
      style={{
        background: selectedMovie.owners?.includes('katherinefierce')
        ? '#F06038'
        : 'rgba(240,96,56,0.2)',
                       color: selectedMovie.owners?.includes('katherinefierce') ? '#1a1a2e' : '#FCD9BE'
      }}
      >
      <UserIcon className="w-4 h-4" />
      katherinefierce
      </button>
      </div>
      </div>

      {/* Platforms */}
      <div>
      <div className="flex items-center justify-between mb-2">
      <p className="text-sm opacity-60" style={{ color: '#8C9EFF' }}>Saadaval:</p>
      {selectedMovie.tmdbId && (
        <button
        onClick={() => fetchProviders(selectedMovie)}
        disabled={loadingProviders}
        className="text-sm flex items-center gap-1 transition-all hover:opacity-80 disabled:opacity-50"
        style={{ color: '#D6F74C' }}
        >
        <RefreshIcon className={`w-4 h-4 ${loadingProviders ? 'animate-spin' : ''}`} />
        {loadingProviders ? 'Otsin...' : 'Otsi automaatselt'}
        </button>
      )}
      </div>
      <div className="grid grid-cols-2 gap-2">
      {PLATFORMS.map(platform => (
        <button
        key={platform.id}
        onClick={() => togglePlatform(selectedMovie, platform.id)}
        className="py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
        style={{
          background: selectedMovie.providers?.includes(platform.id)
          ? platform.id === 'netflix' ? '#E50914'
          : platform.id === 'disney' ? '#113CCF'
          : platform.id === 'hbo' ? '#7B2481'
          : '#00A651'
          : 'rgba(140,158,255,0.2)',
                                  color: selectedMovie.providers?.includes(platform.id) ? 'white' : '#FCD9BE'
        }}
        >
        <span className="font-bold">{platform.icon}</span>
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
      className="w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:opacity-80"
      style={{
        background: 'rgba(240,96,56,0.2)',
                       color: '#F06038'
      }}
      >
      <TrashIcon className="w-5 h-5" />
      Kustuta film
      </button>
      </div>
      </div>
      </div>
    )}
    </div>
  );
};

export default WatchlistApp;
