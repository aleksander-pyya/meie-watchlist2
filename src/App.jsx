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

// Color palette
const COLORS = {
  apricot: '#FCD9BE',
  chartreuse: '#D6F74C',
  vistaBlue: '#8C9EFF',
  tomato: '#F06038',
  dark: '#1a1a2e',
};

const PLATFORMS = [
  { id: 'netflix', name: 'Netflix', icon: 'N' },
{ id: 'disney', name: 'Disney+', icon: 'D+' },
{ id: 'hbo', name: 'HBO', icon: 'HBO' },
{ id: 'go3', name: 'Go3', icon: 'G3' },
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
    { id: 'shared', label: 'ÜHISED', icon: HeartIcon, count: sharedMovies.length },
    { id: 'all', label: 'KÕIK', icon: FilmIcon, count: movies.length },
    { id: 'user1', label: 'SASS', icon: UserIcon, count: user1Movies.length },
    { id: 'user2', label: 'KATH', icon: UserIcon, count: user2Movies.length },
  ];

  // Google Font import
  const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');
  * { font-family: 'Fredoka', sans-serif; }
  `;

  if (loading) {
    return (
      <>
      <style>{fontStyle}</style>
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.vistaBlue }}>
      <div className="text-center">
      <FilmIcon className="w-20 h-20 mx-auto mb-4 animate-bounce" style={{ color: COLORS.chartreuse }} />
      <p className="text-2xl font-bold uppercase tracking-wide" style={{ color: COLORS.dark }}>Laadin filme...</p>
      </div>
      </div>
      </>
    );
  }

  return (
    <>
    <style>{fontStyle}</style>
    <div className="min-h-screen" style={{ background: COLORS.vistaBlue }}>
    <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Header */}
    <header className="text-center mb-10">
    <h1
    className="text-5xl sm:text-6xl md:text-7xl font-bold uppercase tracking-tight mb-2"
    style={{ color: COLORS.tomato }}
    >
    Meie Watchlist
    </h1>
    <p
    className="text-lg uppercase tracking-widest font-medium"
    style={{ color: COLORS.dark }}
    >
    sassdaboss & katherinefierce
    </p>
    </header>

    {/* Shared movies banner */}
    {activeTab === 'shared' && unwatchedShared.length > 0 && (
      <div
      className="mb-8 p-5 rounded-2xl text-center"
      style={{ background: COLORS.apricot }}
      >
      <p className="text-xl font-semibold uppercase" style={{ color: COLORS.tomato }}>
      Teil on <span className="text-3xl font-bold">{unwatchedShared.length}</span> vaatamata ühist filmi!
      </p>
      </div>
    )}

    {/* Navigation tabs */}
    <nav className="flex flex-wrap justify-center gap-2 mb-6">
    {tabs.map(tab => {
      const IconComponent = tab.icon;
      const isActive = activeTab === tab.id;
      return (
        <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className="px-4 sm:px-6 py-3 rounded-xl font-bold transition-all duration-200 text-sm sm:text-base flex items-center gap-2 uppercase tracking-wide"
        style={{
          background: isActive ? COLORS.chartreuse : COLORS.apricot,
          color: COLORS.tomato,
          transform: isActive ? 'scale(1.05)' : 'scale(1)',
        }}
        >
        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>{tab.label}</span>
        <span
        className="px-2 py-0.5 rounded-full text-xs font-bold"
        style={{ background: isActive ? COLORS.tomato : COLORS.vistaBlue, color: isActive ? COLORS.chartreuse : COLORS.dark }}
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
    placeholder="OTSI FILME..."
    className="w-full px-5 py-3 pl-12 rounded-xl font-medium uppercase tracking-wide focus:outline-none"
    style={{
      background: COLORS.apricot,
      color: COLORS.tomato,
    }}
    />
    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: COLORS.tomato }} />
    </div>
    <button
    onClick={() => setShowAddForm(!showAddForm)}
    className="px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-wide hover:scale-105"
    style={{ background: COLORS.chartreuse, color: COLORS.dark }}
    >
    <PlusIcon className="w-5 h-5" />
    <span>Lisa</span>
    </button>
    <button
    onClick={() => setShowRandomizer(true)}
    className="px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-wide hover:scale-105"
    style={{ background: COLORS.tomato, color: COLORS.apricot }}
    >
    <DiceIcon className="w-5 h-5" />
    <span>Random</span>
    </button>
    </div>

    <div className="flex flex-row gap-3">
    <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="flex-1 px-4 py-3 rounded-xl font-medium uppercase tracking-wide focus:outline-none cursor-pointer"
    style={{ background: COLORS.apricot, color: COLORS.tomato }}
    >
    <option value="title">Tähestiku järgi</option>
    <option value="year">Aasta järgi</option>
    </select>
    <select
    value={filterPlatform}
    onChange={(e) => setFilterPlatform(e.target.value)}
    className="flex-1 px-4 py-3 rounded-xl font-medium uppercase tracking-wide focus:outline-none cursor-pointer"
    style={{ background: COLORS.apricot, color: COLORS.tomato }}
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
      className="mb-8 p-5 rounded-2xl max-w-2xl mx-auto"
      style={{ background: COLORS.chartreuse }}
      >
      <h3 className="font-bold mb-4 text-xl uppercase tracking-wide" style={{ color: COLORS.dark }}>Lisa uus film</h3>
      <div className="flex gap-3 mb-4">
      <select
      value={selectedOwner}
      onChange={(e) => setSelectedOwner(e.target.value)}
      className="flex-1 px-4 py-3 rounded-xl font-medium uppercase focus:outline-none cursor-pointer"
      style={{ background: COLORS.apricot, color: COLORS.tomato }}
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
      className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none"
      style={{ background: COLORS.apricot, color: COLORS.tomato }}
      />
      {searching && (
        <RefreshIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin" style={{ color: COLORS.tomato }} />
      )}
      </div>

      {tmdbResults.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
        {tmdbResults.map(movie => (
          <button
          key={movie.id}
          onClick={() => addMovieFromTMDB(movie)}
          className="rounded-xl overflow-hidden transition-all text-left hover:scale-105"
          style={{ background: COLORS.apricot }}
          >
          {movie.poster_path ? (
            <img
            src={`${TMDB_IMG_BASE}${movie.poster_path}`}
            alt={movie.title}
            className="w-full aspect-[2/3] object-cover"
            />
          ) : (
            <div className="w-full aspect-[2/3] flex items-center justify-center" style={{ background: COLORS.vistaBlue }}>
            <FilmIcon className="w-10 h-10" style={{ color: COLORS.dark }} />
            </div>
          )}
          <div className="p-2">
          <p className="text-xs font-semibold line-clamp-2" style={{ color: COLORS.tomato }}>{movie.title}</p>
          <p className="text-xs font-medium" style={{ color: COLORS.vistaBlue }}>{movie.release_date?.split('-')[0]}</p>
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
        className={`cursor-pointer relative rounded-xl overflow-hidden transition-all duration-200 active:scale-95 hover:scale-105 ${movie.watched ? 'opacity-60' : ''}`}
        style={{
          background: COLORS.apricot,
          border: isShared ? `3px solid ${COLORS.tomato}` : 'none'
        }}
        >
        <div className="aspect-[2/3] relative overflow-hidden" style={{ background: COLORS.vistaBlue }}>
        {movie.poster ? (
          <img
          src={`${TMDB_IMG_BASE}${movie.poster}`}
          alt={movie.title}
          className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
          <FilmIcon className="w-12 h-12" style={{ color: COLORS.chartreuse }} />
          </div>
        )}
        </div>

        {/* Owner badges */}
        <div className="absolute top-2 left-2 flex gap-1">
        {movie.owners?.includes('sassdaboss') && (
          <span
          className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase"
          style={{ background: COLORS.vistaBlue, color: COLORS.dark }}
          >
          S
          </span>
        )}
        {movie.owners?.includes('katherinefierce') && (
          <span
          className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase"
          style={{ background: COLORS.tomato, color: COLORS.apricot }}
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
              className="text-[8px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: COLORS.chartreuse, color: COLORS.dark }}
              >
              {platform.icon}
              </span>
            ) : null;
          })}
          </div>
        )}

        {movie.watched && (
          <div className="absolute bottom-12 right-2">
          <CheckIcon className="w-6 h-6" style={{ color: COLORS.chartreuse }} />
          </div>
        )}

        <div className="p-2 sm:p-3">
        <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2" style={{ color: COLORS.tomato }}>{movie.title}</h3>
        {movie.year && <p className="text-xs mt-1 font-medium" style={{ color: COLORS.vistaBlue }}>{movie.year}</p>}
        </div>
        </div>
      );
    })}
    </div>

    {displayMovies.length === 0 && (
      <div className="text-center py-20">
      <FilmIcon className="w-20 h-20 mx-auto mb-4" style={{ color: COLORS.chartreuse }} />
      <p className="text-xl font-bold uppercase" style={{ color: COLORS.dark }}>
      {searchQuery || filterPlatform !== 'all' ? 'Filme ei leitud' : 'Lisa esimene film!'}
      </p>
      </div>
    )}

    {/* Footer */}
    <footer className="mt-12 text-center">
    <p className="text-sm font-medium uppercase tracking-wide" style={{ color: COLORS.dark }}>
    Kokku {movies.length} filmi · {sharedMovies.length} ühist · {movies.filter(m => m.watched).length} nähtud
    </p>
    </footer>
    </div>

    {/* Randomizer Modal */}
    {showRandomizer && (
      <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
      style={{ background: COLORS.vistaBlue }}
      >
      <div className="p-6">
      <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold uppercase" style={{ color: COLORS.tomato }}>Juhuslik film</h2>
      {!isSpinning && (
        <button
        onClick={() => { setShowRandomizer(false); setRandomMovie(null); }}
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: COLORS.apricot }}
        >
        <CloseIcon className="w-5 h-5" style={{ color: COLORS.tomato }} />
        </button>
      )}
      </div>

      {!randomMovie && !isSpinning && (
        <div className="space-y-3">
        <p className="text-center mb-4 font-medium uppercase" style={{ color: COLORS.dark }}>Vali nimekiri:</p>
        {[
          { key: 'shared', label: 'Ühised', count: unwatchedShared.length, bg: COLORS.tomato, color: COLORS.apricot },
          { key: 'sassdaboss', label: 'sassdaboss', count: user1Movies.filter(m => !m.watched).length, bg: COLORS.chartreuse, color: COLORS.dark },
                                       { key: 'katherinefierce', label: 'katherinefierce', count: user2Movies.filter(m => !m.watched).length, bg: COLORS.apricot, color: COLORS.tomato },
                                       { key: 'all', label: 'Kõik', count: movies.filter(m => !m.watched).length, bg: COLORS.dark, color: COLORS.chartreuse },
        ].map(item => (
          <button
          key={item.key}
          onClick={() => pickRandomMovie(item.key)}
          className="w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wide hover:scale-105 transition-all"
          style={{ background: item.bg, color: item.color }}
          >
          {item.label} ({item.count})
          </button>
        ))}
        </div>
      )}

      {(randomMovie || isSpinning) && (
        <div className="text-center">
        <div className={`relative ${isSpinning ? 'animate-pulse' : ''}`}>
        {randomMovie?.poster ? (
          <img
          src={`${TMDB_IMG_BASE}${randomMovie.poster}`}
          alt={randomMovie.title}
          className="w-48 h-72 object-cover rounded-xl mx-auto"
          />
        ) : (
          <div className="w-48 h-72 rounded-xl mx-auto flex items-center justify-center" style={{ background: COLORS.apricot }}>
          <FilmIcon className="w-16 h-16" style={{ color: COLORS.tomato }} />
          </div>
        )}
        {isSpinning && (
          <div className="absolute inset-0 flex items-center justify-center">
          <DiceIcon className="w-16 h-16 animate-spin" style={{ color: COLORS.chartreuse }} />
          </div>
        )}
        </div>

        {randomMovie && !isSpinning && (
          <>
          <div className="mt-4">
          <h3 className="text-xl font-bold" style={{ color: COLORS.tomato }}>{randomMovie.title}</h3>
          {randomMovie.year && <p className="font-medium" style={{ color: COLORS.dark }}>{randomMovie.year}</p>}
          </div>
          <div className="mt-6 space-y-3">
          <button
          onClick={() => { setSelectedMovie(randomMovie); setShowRandomizer(false); setRandomMovie(null); }}
          className="w-full py-3 rounded-xl font-bold uppercase hover:scale-105 transition-all"
          style={{ background: COLORS.chartreuse, color: COLORS.dark }}
          >
          Vaata seda!
          </button>
          <button
          onClick={() => setRandomMovie(null)}
          className="w-full py-3 rounded-xl font-bold uppercase hover:scale-105 transition-all"
          style={{ background: COLORS.apricot, color: COLORS.tomato }}
          >
          Proovi uuesti
          </button>
          </div>
          </>
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(26,26,46,0.9)' }}
      onClick={(e) => { if (e.target === e.currentTarget) setSelectedMovie(null); }}
      >
      <div
      className="w-full sm:max-w-lg sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      style={{ background: COLORS.vistaBlue }}
      >
      {/* Header */}
      <div className="relative">
      {selectedMovie.poster ? (
        <img src={`${TMDB_IMG_BASE}${selectedMovie.poster}`} alt={selectedMovie.title} className="w-full h-48 sm:h-64 object-cover" />
      ) : (
        <div className="w-full h-48 sm:h-64 flex items-center justify-center" style={{ background: COLORS.apricot }}>
        <FilmIcon className="w-16 h-16" style={{ color: COLORS.tomato }} />
        </div>
      )}
      <button
      onClick={() => setSelectedMovie(null)}
      className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
      style={{ background: COLORS.apricot }}
      >
      <CloseIcon className="w-5 h-5" style={{ color: COLORS.tomato }} />
      </button>
      </div>

      <div className="p-5 space-y-4">
      <div>
      <h2 className="text-2xl font-bold" style={{ color: COLORS.tomato }}>{selectedMovie.title}</h2>
      {selectedMovie.year && <p className="font-medium" style={{ color: COLORS.dark }}>{selectedMovie.year}</p>}
      </div>

      {/* Overview */}
      {(movieOverview || loadingOverview) && (
        <div className="rounded-xl p-4" style={{ background: COLORS.apricot }}>
        <div className="flex items-center gap-2 mb-2">
        <BookIcon className="w-4 h-4" style={{ color: COLORS.tomato }} />
        <h3 className="text-sm font-bold uppercase" style={{ color: COLORS.tomato }}>Tutvustus</h3>
        </div>
        {loadingOverview ? (
          <div className="flex items-center gap-2">
          <RefreshIcon className="w-4 h-4 animate-spin" style={{ color: COLORS.tomato }} />
          <span style={{ color: COLORS.tomato }}>Laadin...</span>
          </div>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: COLORS.dark }}>{movieOverview}</p>
        )}
        </div>
      )}

      {/* Watched toggle */}
      <button
      onClick={() => toggleWatched(selectedMovie)}
      className="w-full py-3 rounded-xl font-bold uppercase tracking-wide hover:scale-105 transition-all flex items-center justify-center gap-2"
      style={{ background: selectedMovie.watched ? COLORS.tomato : COLORS.chartreuse, color: selectedMovie.watched ? COLORS.apricot : COLORS.dark }}
      >
      {selectedMovie.watched ? <><UndoIcon className="w-5 h-5" /> Märgi vaatamata</> : <><CheckIcon className="w-5 h-5" /> Märgi nähtuks</>}
      </button>

      {/* Owner selection */}
      <div>
      <p className="text-sm mb-2 font-medium uppercase" style={{ color: COLORS.dark }}>Kelle listis:</p>
      <div className="flex gap-2">
      <button
      onClick={() => toggleOwner(selectedMovie, 'sassdaboss')}
      className="flex-1 py-3 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-2"
      style={{ background: selectedMovie.owners?.includes('sassdaboss') ? COLORS.chartreuse : COLORS.apricot, color: COLORS.dark }}
      >
      <UserIcon className="w-4 h-4" /> Sass
      </button>
      <button
      onClick={() => toggleOwner(selectedMovie, 'katherinefierce')}
      className="flex-1 py-3 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-2"
      style={{ background: selectedMovie.owners?.includes('katherinefierce') ? COLORS.tomato : COLORS.apricot, color: selectedMovie.owners?.includes('katherinefierce') ? COLORS.apricot : COLORS.dark }}
      >
      <UserIcon className="w-4 h-4" /> Kath
      </button>
      </div>
      </div>

      {/* Platforms */}
      <div>
      <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium uppercase" style={{ color: COLORS.dark }}>Saadaval:</p>
      {selectedMovie.tmdbId && (
        <button onClick={() => fetchProviders(selectedMovie)} disabled={loadingProviders} className="text-sm flex items-center gap-1 font-medium" style={{ color: COLORS.tomato }}>
        <RefreshIcon className={`w-4 h-4 ${loadingProviders ? 'animate-spin' : ''}`} />
        {loadingProviders ? 'Otsin...' : 'Otsi'}
        </button>
      )}
      </div>
      <div className="grid grid-cols-2 gap-2">
      {PLATFORMS.map(platform => (
        <button
        key={platform.id}
        onClick={() => togglePlatform(selectedMovie, platform.id)}
        className="py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        style={{
          background: selectedMovie.providers?.includes(platform.id) ? COLORS.chartreuse : COLORS.apricot,
                                  color: COLORS.dark
        }}
        >
        <span>{platform.icon}</span>
        <span>{platform.name}</span>
        </button>
      ))}
      </div>
      </div>

      {/* Delete */}
      <button
      onClick={() => { if (confirm('Kustutada?')) deleteMovie(selectedMovie.id); }}
      className="w-full py-3 rounded-xl font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2"
      style={{ background: COLORS.apricot, color: COLORS.tomato }}
      >
      <TrashIcon className="w-5 h-5" /> Kustuta
      </button>
      </div>
      </div>
      </div>
    )}
    </div>
    </>
  );
};

export default WatchlistApp;
