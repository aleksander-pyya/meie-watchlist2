import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAzPRXys5y8IeefUcNoo9KSYYHx2SW616o",
  authDomain: "watchlist-b0d26.firebaseapp.com",
  projectId: "watchlist-b0d26",
  storageBucket: "watchlist-b0d26.firebasestorage.app",
  messagingSenderId: "957805618122",
  appId: "1:957805618122:web:f7316be42ab6d8003f2533",
};

const TMDB_API_KEY = 'ee832f30efb14e179654a4803a61bfcd';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sassdabossMovies = [
  ["Air",2023],["Blue Beetle",2023],["Asteroid City",2023],["Gran Turismo",2023],["Five Nights at Freddy's",2023],
  ["Daisy Jones & the Six",2023],["The Zone of Interest",2023],["The Iron Claw",2023],["Anatomy of a Fall",2023],
  ["Godzilla Minus One",2023],["Past Lives",2023],["Shrek 5",2027],["Alien",1979],["The Wild Robot",2024],
  ["Joker: Folie à Deux",2024],["Piece By Piece",2024],["Anora",2024],["Gladiator II",2024],["Psycho",1960],
  ["GoodFellas",1990],["Come and See",1985],["12 Angry Men",1957],["Good Will Hunting",1997],["The Elephant Man",1980],
  ["The Godfather Part II",1974],["When Harry Met Sally...",1989],["Ferris Bueller's Day Off",1986],
  ["The Devil Wears Prada",2006],["Scott Pilgrim vs. the World",2010],["Amélie",2001],["Juno",2007],
  ["Eighth Grade",2018],["Zoolander",2001],["About Time",2013],["The Big Lebowski",1998],
  ["The Lord of the Rings: The Fellowship of the Ring",2001],["The Darjeeling Limited",2007],
  ["Captain America: Civil War",2016],["Captain America: The Winter Soldier",2014],["Ant-Man",2015],
  ["Avengers: Age of Ultron",2015],["Iron Man 3",2013],["Thor",2011],["Ant-Man and the Wasp: Quantumania",2023],
  ["The Marvels",2023],["Thor: The Dark World",2013],["Ant-Man and the Wasp",2018],["Iron Man 2",2010],
  ["The Incredible Hulk",2008],["Captain Marvel",2019],["Your Name.",2016],["The Matrix",1999],
  ["The Lord of the Rings: The Return of the King",2003],["Moana",2016],["Indiana Jones and the Last Crusade",1989],
  ["Babylon",2022],["Bullet Train",2022],["Life & Love",2024],["Glass Onion",2022],["Venom: The Last Dance",2024],
  ["Civil War",2024],["Furiosa: A Mad Max Saga",2024],["Mad Max: Fury Road",2015],["La Haine",1995],
  ["The Good, the Bad and the Ugly",1966],["Grave of the Fireflies",1988],["Apocalypse Now",1979],
  ["Portrait of a Lady on Fire",2019],["The Handmaiden",2016],["The Lord of the Rings: The Two Towers",2002],
  ["Barry Lyndon",1975],["Princess Mononoke",1997],["One Flew Over the Cuckoo's Nest",1975],
  ["The Worst Person in the World",2021],["The Adventurer",1983],["Fools of Fame",2023],["Smile at Last",1985],
  ["Georg",2007],["In the Crosswind",2014],["The Joys of Midlife",1987],["Lamb in the Down Right Corner",1992],
  ["Living Images",2013],["Love for Three Oranges",1994],["The Master of Kõrboja",1980],["Men Don't Cry",1969],
  ["Naughty Curves",1959],["Spring in the Forest",1974],["The Temptation of St. Tony",2009],
  ["The Weirdest Band in the World",2015],["Where Souls Go",2007],["Lotte and the Lost Dragons",2019],
  ["Those Old Love-letters",1992],["The Polar Boy",2016],["Smoke Sauna Sisterhood",2023],
  ["How to Train Your Dragon: The Hidden World",2019],["A Bug's Life",1998],["Blade Runner 2049",2017],
  ["Pride & Prejudice",2005],["Donnie Darko",2001],["Aftersun",2022],["The Silence of the Lambs",1991],
  ["The Thing",1982],["Shutter Island",2010],["Girl, Interrupted",1999],["Trainspotting",1996],
  ["American Psycho",2000],["A Clockwork Orange",1971],["No Country for Old Men",2007],["Prisoners",2013],
  ["Lost in Translation",2003],["Brokeback Mountain",2005],["Baby Driver",2017],["Beautiful Boy",2018],
  ["The Hunger Games: Catching Fire",2013],["Drive",2011],["The Prestige",2006],["Scarface",1983],
  ["The Lighthouse",2019],["Pearl",2022],["Memento",2000],["Pan's Labyrinth",2006],
  ["The Curious Case of Benjamin Button",2008],["Ray",2004],["Sweeney Todd: The Demon Barber of Fleet Street",2007],
  ["Wicked: For Good",2025],["Fruitvale Station",2013],["Conclave",2024],["A Complete Unknown",2024],
  ["The Brutalist",2024],["Smile 2",2024],["Dune: Part Three",2026],["The Florida Project",2017],
  ["Emilia Pérez",2024],["City of God",2002],["The Black Hole",2024],["The Monkey",2025],
  ["Captain America: Brave New World",2025],["Companion",2025],["I'm Still Here",2024],["Reservoir Dogs",1992],
  ["Boyhood",2014],["Novocaine",2025],["The Wolf of Wall Street",2013],["Infinite Summer",2024],
  ["How to Train Your Dragon",2025],["Superman",2025],["One Battle After Another",2025],
  ["My Family and Other Clowns",2025],["The Teachers' Lounge",2023],["Marty Supreme",2025],["Bugonia",2025],["Weapons",2025]
];

const katherinefierceMovies = [
  ["Fight Club",1999],["Interstellar",2014],["Get Out",2017],["Midsommar",2019],["Knives Out",2019],
  ["Lady Bird",2017],["Spirited Away",2001],["The Menu",2022],["The Godfather",1972],["Fantastic Mr. Fox",2009],
  ["The Matrix",1999],["Nope",2022],["Taxi Driver",1976],["The Substance",2024],["Good Will Hunting",1997],
  ["Guardians of the Galaxy",2014],["Arrival",2016],["Black Panther",2018],["Past Lives",2023],
  ["Howl's Moving Castle",2004],["Don't Look Up",2021],["Little Miss Sunshine",2006],
  ["Guardians of the Galaxy Vol. 3",2023],["The Lighthouse",2019],["Moonlight",2016],
  ["Puss in Boots: The Last Wish",2022],["My Neighbor Totoro",1988],["Killers of the Flower Moon",2023],
  ["The Banshees of Inisherin",2022],["A Clockwork Orange",1971],["Guardians of the Galaxy Vol. 2",2017],
  ["Psycho",1960],["The Witch",2015],["Gladiator",2000],["The Nightmare Before Christmas",1993],
  ["The Lion King",1994],["Spring at Heart",1985],["Dance Around the Steam Boiler",1988],["Debt",1966],
  ["From Three to Twelve",1965],["Watercolors of One Summer",1967],["Võrokese",1983],["A Man and a Woman",1972],
  ["Lepatriinutalv",1989],["Driving Mum",2022],["8 Views of Lake Biwa",2024],["Life & Love",2024],
  ["Stairway to Heaven",2023],["The White Crows",2023],["Revolution of Pigs",2004],["Two of Me",2024],
  ["u.Q.",2021],["Red Mercury",2010],["Anett",2024],["The Graveyard Keeper's Daughter",2011],
  ["Gori the Caricaturist",2023],["The Circle",2019],["Fire Lily",2018],["Kuku: I Will Survive",2011],
  ["Messenger Knocks Three Times",2010],["Hermaküla: Lost Father",2022],["Language Rebel. Mati Hint",2022],
  ["Wallflower",2006],["Babylon",2022],["The Whale",2022],["The French Dispatch",2021],["The Iron Claw",2023],
  ["Fargo",1996],["The Zone of Interest",2023],["Jennifer's Body",2009],["Trainspotting",1996],
  ["The Virgin Suicides",1999],["Beautiful Boy",2018],["We Live in Time",2024],["A Brighter Summer Day",1991],
  ["Autumn Sonata",1978],["The Apartment",1960],["Stalker",1979],["Persona",1966],["In the Mood for Love",2000],
  ["It's a Wonderful Life",1946],["The Pianist",2002],["Rear Window",1954],["Scenes from a Marriage",1974],
  ["Singin' in the Rain",1952],["The Sacrifice",1986],["How to Make Millions Before Grandma Dies",2024],
  ["Chungking Express",1994],["Opening Night",1977],["Some Like It Hot",1959],["20th Century Women",2016],
  ["Little Manhattan",2005],["Eighth Grade",2018],["The Peanut Butter Falcon",2019],["The Darjeeling Limited",2007],
  ["God's Own Country",2017],["Florence Foster Jenkins",2016],["Hide and Seek",2014],["La Chimera",2023],
  ["Things to Come",2016],["Jodorowsky's Dune",2013],["Stand by Me",1986],["Okja",2017],["La Dolce Vita",1960],
  ["The King of Comedy",1982],["The Lobster",2015],["Boogie Nights",1997],["Fences",2016],
  ["The Great Gatsby",1974],["Paprika",2006],["The Rocky Horror Picture Show",1975],["Boyhood",2014],
  ["The Place Beyond the Pines",2012],["American Honey",2016],["Patti Cake$",2017],["12 Years a Slave",2013],
  ["How to Train Your Dragon",2010],["Dune",1984],["Carol",2015],["Brooklyn",2015],["Adventureland",2009],
  ["The Danish Girl",2015],["Christiane F.",1981],["Interview with the Vampire",1994],["Kramer vs. Kramer",1979],
  ["Slumdog Millionaire",2008],["The Graduate",1967],["The Sixth Sense",1999],["The Sting",1973],
  ["Erin Brockovich",2000],["The Blind Side",2009],["The Idiots",1998],["Reminiscences of a Journey to Lithuania",1972],
  ["The Temptation of St. Tony",2009],["Summer Survivors",2018],["Disco and Atomic War",2009],
  ["Autumn Almanac",1984],["Árni",2023],["Love in the Afternoon",1972],["Dogtooth",2009],["Ida",2013],
  ["Jeanne Dielman, 23, quai du Commerce, 1080 Bruxelles",1975],["...And God Created Woman",1956],
  ["Goodbye to Language",2014],["Models",1999],["Attenberg",2010],["La Collectionneuse",1967],["Malena",2000],
  ["Happy as Lazzaro",2018],["Melancholia",2011],["Vicky Cristina Barcelona",2008],["Antiporno",2016],
  ["The Worst Person in the World",2021],["Sound of Metal",2019],["The Favourite",2018],["Minari",2020],
  ["If Beale Street Could Talk",2018],["Roma",2018],["Age Out",2018],["Blue Valentine",2010],["Kids",1995],
  ["Coraline",2009],["The Eyes of Tammy Faye",2021],["Are You There God? It's Me, Margaret.",2023],
  ["Spencer",2021],["Gia",1998],["Shiva Baby",2020],["Girl, Interrupted",1999],["Thirteen",2003],
  ["Carrie",1976],["Roman Holiday",1953],["White Oleander",2002],["My Girl",1991],["No Hard Feelings",2023],
  ["Women on the Verge of a Nervous Breakdown",1988],["The Little Mermaid",2023],["My Salinger Year",2020],
  ["The Florida Project",2017],["Silver Linings Playbook",2012],["My First Summer",2020],["Lola",1961],
  ["Water Lilies",2007],["Shakespeare in Love",1998],["Poetic Justice",1993],["The Nanny Diaries",2007],
  ["First Daughter",2004],["Miss Pettigrew Lives for a Day",2008],["Blockers",2018],["Crazy Rich Asians",2018],
  ["The Handmaiden",2016],["Columbus",2017],["Black Mirror: Joan Is Awful",2023],["Billy Elliot",2000],
  ["The First Wives Club",1996],["Celeste & Jesse Forever",2012],["Fools Rush In",1997],
  ["My Big Fat Greek Wedding 3",2023],["Divine Secrets of the Ya-Ya Sisterhood",2002],["Pleasantville",1998],
  ["Music and Lyrics",2007],["Nick and Norah's Infinite Playlist",2008],["The Sun Is Also a Star",2019],
  ["Our Souls at Night",2017],["Life After Beth",2014],["Swiss Army Man",2016],["mid90s",2018],["Men",2022],
  ["Heretic",2024],["The Entertainment System Is Down",2024],["17 Girls",2011],["5 Centimeters per Second",2007],
  ["A Christmas Story",1983],["A Night in the Life of Jimmy Reardon",1988],["A River Runs Through It",1992],
  ["Adam",2009],["An Education",2009],["August Rush",2007],["Baby It's You",1983],["Because They're Young",1960],
  ["Driving Lessons",2006],["East of Eden",1955],["Everybody Hates Johan",2022],["Sick of Myself",2022],
  ["Men & Chicken",2015],["Still Alice",2014],["The Great White Silence",1924],["The Gold Rush",1925],
  ["Rebecca",1940],["2001: A Space Odyssey",1968],["The Square",2017],["Force Majeure",2014],
  ["Explanation for Everything",2023],["Fairy Garden",2023],["Binding Sentiments",1969],
  ["Bibliothèque Pascal",2010],["Lovefilm",1970],["The Turin Horse",2011],["Family Nest",1979],
  ["The Prefab People",1982],["My Night at Maud's",1969],["Anora",2024],["Little Women",1933],
  ["The Glass Castle",2017],["Next Floor",2008],["The City of Lost Children",1995],
  ["The Master and Margarita",2024],["Heavenly Creatures",1994],["Joyride",2022],["The History of Sound",2025],
  ["A Real Pain",2024],["Dolemite Is My Name",2019],["To Wong Foo, Thanks for Everything! Julie Newmar",1995],
  ["There's Still Tomorrow",2023],["El Conde",2023],["Tully",2018],["Breakfast on Pluto",2005],
  ["Honeyland",2019],["Away We Go",2009],["Russian Ark",2002],["Waiting...",2005],["The Producers",1967],
  ["A Woman Under the Influence",1974],["Hit the Road",2021],["Train Dreams",2025],["The Fall",2006],
  ["The Secret Agent",2025],["The Mastermind",2025],["Megalopolis",2024],["Christmas Eve in Miller's Point",2024],
  ["Nickel Boys",2024],["Pieces of a Woman",2020]
];

async function searchTMDB(title, year) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year}`
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return {
        poster: data.results[0].poster_path,
        tmdbId: data.results[0].id
      };
    }
  } catch (err) {
    console.error(`TMDB error for ${title}:`, err.message);
  }
  return { poster: null, tmdbId: null };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function importMovies() {
  const allMovies = new Map();

  // Add sassdaboss movies
  for (const [title, year] of sassdabossMovies) {
    allMovies.set(title.toLowerCase(), { title, year, owners: ['sassdaboss'] });
  }

  // Add katherinefierce movies (merge if exists)
  for (const [title, year] of katherinefierceMovies) {
    const key = title.toLowerCase();
    if (allMovies.has(key)) {
      allMovies.get(key).owners.push('katherinefierce');
    } else {
      allMovies.set(key, { title, year, owners: ['katherinefierce'] });
    }
  }

  console.log(`Importing ${allMovies.size} movies with posters...`);
  console.log('This will take a few minutes due to TMDB rate limits.\n');

  let count = 0;
  for (const movie of allMovies.values()) {
    // Search TMDB for poster
    const tmdbData = await searchTMDB(movie.title, movie.year);
    
    await addDoc(collection(db, 'movies'), {
      title: movie.title,
      year: movie.year,
      owners: movie.owners,
      poster: tmdbData.poster,
      tmdbId: tmdbData.tmdbId,
      watched: false,
      createdAt: new Date()
    });
    
    count++;
    const posterStatus = tmdbData.poster ? '✓' : '✗';
    console.log(`[${count}/${allMovies.size}] ${posterStatus} ${movie.title} (${movie.year})`);
    
    // Rate limit: TMDB allows ~40 requests per 10 seconds
    await sleep(250);
  }

  console.log(`\nDone! ${count} movies imported.`);
  process.exit(0);
}

importMovies().catch(console.error);
