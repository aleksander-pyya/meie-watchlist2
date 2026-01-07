import React, { useState, useMemo, useEffect } from 'react';

const SHEET_ID = '1AGcvaJ3vWVN8OmzJ2PqQdA06A7lgQKqdkMOFd3khuFA';

const WatchlistApp = () => {
  const [activeTab, setActiveTab] = useState('shared');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [user1Movies, setUser1Movies] = useState([]);
  const [user2Movies, setUser2Movies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSheetData = async (sheetName) => {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substring(47, text.length - 2));

    const rows = json.table.rows;
    return rows.slice(1).map((row, i) => ({
      id: i,
      title: row.c[0]?.v || '',
      year: row.c[1]?.v || null
    })).filter(m => m.title);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data1, data2] = await Promise.all([
        fetchSheetData('sassdaboss'),
                                               fetchSheetData('katherinefierce')
      ]);
      setUser1Movies(data1);
      setUser2Movies(data2);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Viga andmete laadimisel. Kontrolli, kas Sheet on avalik.');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const normalize = (t) => t.toLowerCase().trim();

  const sharedMovies = useMemo(() => {
    const titles1 = new Set(user1Movies.map(m => normalize(m.title)));
    return user2Movies.filter(m => titles1.has(normalize(m.title)));
  }, [user1Movies, user2Movies]);

  const combinedMovies = useMemo(() => {
    const all = [...user1Movies];
    const titles1 = new Set(user1Movies.map(m => normalize(m.title)));
    user2Movies.forEach((m, i) => {
      if (!titles1.has(normalize(m.title))) all.push({ ...m, id: 1000 + i });
    });
    return all;
  }, [user1Movies, user2Movies]);

  const getOwner = (movie) => {
    const t = normalize(movie.title);
    const o = [];
    if (user1Movies.some(m => normalize(m.title) === t)) o.push(1);
    if (user2Movies.some(m => normalize(m.title) === t)) o.push(2);
    return o;
  };

  const filterSort = (movies) => {
    let f = movies;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      f = movies.filter(m => m.title.toLowerCase().includes(q) || (m.year && m.year.toString().includes(q)));
    }
    return f.sort((a, b) => sortBy === 'year' ? (b.year || 0) - (a.year || 0) : a.title.localeCompare(b.title));
  };

  const movies = filterSort(
    activeTab === 'shared' ? sharedMovies :
    activeTab === 'combined' ? combinedMovies :
    activeTab === 'user1' ? user1Movies : user2Movies
  );

  const tabs = [
    { id: 'shared', label: '💕 Ühised', count: sharedMovies.length },
    { id: 'combined', label: '🎬 Kõik', count: combinedMovies.length },
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center p-8 bg-slate-800/50 rounded-2xl max-w-md">
      <div className="text-6xl mb-4">😕</div>
      <p className="text-red-400 text-lg mb-4">{error}</p>
      <button
      onClick={loadData}
      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all"
      >
      Proovi uuesti
      </button>
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
    <h1 className="text-5xl md:text-6xl font-black mb-3">
    <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
    Meie Watchlist
    </span>
    <span className="ml-3">💕</span>
    </h1>
    <p className="text-amber-200/60 text-lg">sassdaboss & katherinefierce</p>
    <button
    onClick={loadData}
    className="mt-4 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 text-amber-200/80 rounded-lg text-sm transition-all inline-flex items-center gap-2"
    >
    🔄 Värskenda
    {lastUpdated && (
      <span className="text-amber-200/40">
      ({lastUpdated.toLocaleTimeString('et-EE')})
      </span>
    )}
    </button>
    </header>

    {activeTab === 'shared' && sharedMovies.length > 0 && (
      <div className="mb-8 p-6 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-orange-500/10 rounded-2xl border border-rose-500/20 text-center">
      <p className="text-xl text-rose-100">
      🎉 Teil on <span className="font-bold text-rose-300 text-2xl">{sharedMovies.length}</span> ühist filmi! 🎉
      </p>
      <p className="text-rose-200/60 mt-2">Need sobivad ideaalselt ühiseks filmiõhtuks</p>
      </div>
    )}

    <nav className="flex flex-wrap justify-center gap-2 mb-6">
    {tabs.map(tab => (
      <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
        activeTab === tab.id
        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-lg shadow-amber-500/30 scale-105'
        : 'bg-slate-800/60 text-amber-200/80 hover:bg-slate-700/60'
      }`}
      >
      {tab.label}
      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-slate-900/30' : 'bg-slate-700/60'}`}>
      {tab.count}
      </span>
      </button>
    ))}
    </nav>

    <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-2xl mx-auto">
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
    <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-amber-200 focus:outline-none cursor-pointer"
    >
    <option value="title">Tähestiku järgi</option>
    <option value="year">Aasta järgi</option>
    </select>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {movies.map((movie, i) => {
      const owners = getOwner(movie);
      const isShared = owners.length === 2;
      return (
        <div
        key={`${movie.id}-${i}`}
        className={`group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isShared ? 'ring-2 ring-rose-500/30' : ''}`}
        >
        <div className="aspect-[2/3] bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center">
        <div className="text-center p-3">
        <div className="text-4xl mb-2">🎬</div>
        <p className="text-amber-100/60 text-xs leading-tight line-clamp-3">{movie.title}</p>
        </div>
        </div>
        {activeTab === 'combined' && (
          <div className="absolute top-2 left-2 flex gap-1">
          {owners.includes(1) && <span className="px-1.5 py-0.5 bg-cyan-500/90 text-white text-[10px] font-bold rounded-full">S</span>}
          {owners.includes(2) && <span className="px-1.5 py-0.5 bg-rose-500/90 text-white text-[10px] font-bold rounded-full">K</span>}
          </div>
        )}
        {isShared && activeTab !== 'combined' && (
          <div className="absolute top-2 right-2"><span className="text-rose-400 text-lg">💕</span></div>
        )}
        <div className="p-3">
        <h3 className="font-semibold text-amber-50 text-sm leading-tight line-clamp-2 group-hover:text-amber-300 transition-colors">{movie.title}</h3>
        {movie.year && <p className="text-amber-200/50 text-xs mt-1">{movie.year}</p>}
        </div>
        </div>
      );
    })}
    </div>

    {movies.length === 0 && (
      <div className="text-center py-20">
      <div className="text-6xl mb-4">🎞️</div>
      <p className="text-amber-200/60 text-lg">{searchQuery ? 'Filme ei leitud' : 'Tühi nimekiri'}</p>
      </div>
    )}

    <footer className="mt-12 text-center">
    <p className="text-amber-200/40 text-sm mb-2">
    Kokku {combinedMovies.length} unikaalset filmi • {sharedMovies.length} ühist filmi
    </p>
    <a
    href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-amber-400/60 hover:text-amber-300 text-sm underline"
    >
    📝 Muuda Google Sheetis
    </a>
    </footer>
    </div>
    </div>
  );
};

export default WatchlistApp;
