const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { connectDB } = require('../config/db');

// Sample Movies Data
const sampleMovies = [
  {
    title: 'Dune: Part Two',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    language: ['English', 'Hindi'],
    duration: 166,
    releaseDate: new Date('2024-03-01'),
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
      { name: 'Zendaya', role: 'Chani', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
      { name: 'Rebecca Ferguson', role: 'Lady Jessica', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' }
    ],
    director: 'Denis Villeneuve',
    rating: 8.8,
    voteCount: 28400,
    certification: 'UA',
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    status: 'Now Showing',
    featured: true
  },
  {
    title: 'Oppenheimer',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral complexity and personal anguish of creating humanity’s most destructive weapon.',
    genre: ['Biography', 'Drama', 'History'],
    language: ['English', 'Hindi'],
    duration: 180,
    releaseDate: new Date('2023-07-21'),
    cast: [
      { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
      { name: 'Emily Blunt', role: 'Katherine Oppenheimer', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
      { name: 'Robert Downey Jr.', role: 'Lewis Strauss', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' }
    ],
    director: 'Christopher Nolan',
    rating: 8.9,
    voteCount: 42100,
    certification: 'A',
    trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
    status: 'Now Showing',
    featured: true
  },
  {
    title: 'Deadpool & Wolverine',
    posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    description: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth, unpredictable Deadpool. They team up to defeat a common enemy in a high-octane, hilarious multiverse adventure.',
    genre: ['Action', 'Comedy', 'Sci-Fi'],
    language: ['English', 'Hindi', 'Telugu'],
    duration: 127,
    releaseDate: new Date('2024-07-26'),
    cast: [
      { name: 'Ryan Reynolds', role: 'Wade Wilson / Deadpool', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
      { name: 'Hugh Jackman', role: 'Logan / Wolverine', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80' }
    ],
    director: 'Shawn Levy',
    rating: 8.2,
    voteCount: 19800,
    certification: 'A',
    trailerUrl: 'https://www.youtube.com/embed/73_1biulkYk',
    status: 'Now Showing',
    featured: true
  },
  {
    title: 'Interstellar',
    posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans through a newly discovered wormhole.',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    language: ['English', 'Hindi'],
    duration: 169,
    releaseDate: new Date('2014-11-07'),
    cast: [
      { name: 'Matthew McConaughey', role: 'Cooper', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
      { name: 'Anne Hathaway', role: 'Brand', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' }
    ],
    director: 'Christopher Nolan',
    rating: 8.7,
    voteCount: 65400,
    certification: 'UA',
    trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    status: 'Now Showing',
    featured: true
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    genre: ['Animation', 'Action', 'Adventure'],
    language: ['English', 'Hindi', 'Tamil'],
    duration: 140,
    releaseDate: new Date('2023-06-02'),
    cast: [
      { name: 'Shameik Moore', role: 'Miles Morales (voice)', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80' },
      { name: 'Hailee Steinfeld', role: 'Gwen Stacy (voice)', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80' }
    ],
    director: 'Joaquim Dos Santos',
    rating: 8.7,
    voteCount: 31200,
    certification: 'U',
    trailerUrl: 'https://www.youtube.com/embed/cqGjhVJWtEg',
    status: 'Now Showing',
    featured: false
  },
  {
    title: 'Avatar: The Way of Water',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na’vi race to protect their home.',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    language: ['English', 'Hindi', 'Telugu', 'Tamil'],
    duration: 192,
    releaseDate: new Date('2022-12-16'),
    cast: [
      { name: 'Sam Worthington', role: 'Jake Sully', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
      { name: 'Zoe Saldana', role: 'Neytiri', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' }
    ],
    director: 'James Cameron',
    rating: 8.1,
    voteCount: 38900,
    certification: 'UA',
    trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0',
    status: 'Now Showing',
    featured: false
  },
  {
    title: 'The Dark Knight',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1600&q=80',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    genre: ['Action', 'Crime', 'Drama'],
    language: ['English', 'Hindi'],
    duration: 152,
    releaseDate: new Date('2008-07-18'),
    cast: [
      { name: 'Christian Bale', role: 'Bruce Wayne / Batman', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
      { name: 'Heath Ledger', role: 'Joker', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' }
    ],
    director: 'Christopher Nolan',
    rating: 9.0,
    voteCount: 89000,
    certification: 'UA',
    trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
    status: 'Now Showing',
    featured: false
  },
  {
    title: 'Gladiator II',
    posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80',
    description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by tyrannical emperors who lead Rome with an iron fist.',
    genre: ['Action', 'Adventure', 'Drama'],
    language: ['English', 'Hindi'],
    duration: 148,
    releaseDate: new Date('2024-11-22'),
    cast: [
      { name: 'Paul Mescal', role: 'Lucius', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80' },
      { name: 'Pedro Pascal', role: 'Marcus Acacius', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' }
    ],
    director: 'Ridley Scott',
    rating: 8.3,
    voteCount: 14200,
    certification: 'A',
    trailerUrl: 'https://www.youtube.com/embed/4rgYUipGJNo',
    status: 'Now Showing',
    featured: false
  },
  {
    title: 'Kalki 2898 AD',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    description: 'Set in a post-apocalyptic world in the year 2898 AD, a modern avatar of Vishnu is believed to have descended to earth to protect the world from evil forces.',
    genre: ['Sci-Fi', 'Action', 'Fantasy'],
    language: ['Telugu', 'Hindi', 'Tamil', 'English'],
    duration: 181,
    releaseDate: new Date('2024-06-27'),
    cast: [
      { name: 'Prabhas', role: 'Bhairava', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
      { name: 'Amitabh Bachchan', role: 'Ashwatthama', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' },
      { name: 'Deepika Padukone', role: 'SUM-80', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' }
    ],
    director: 'Nag Ashwin',
    rating: 8.4,
    voteCount: 35600,
    certification: 'UA',
    trailerUrl: 'https://www.youtube.com/embed/kQDd1AhGIHk',
    status: 'Now Showing',
    featured: false
  },
  {
    title: 'Inception',
    posterUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    language: ['English', 'Hindi'],
    duration: 148,
    releaseDate: new Date('2010-07-16'),
    cast: [
      { name: 'Leonardo DiCaprio', role: 'Cobb', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
      { name: 'Joseph Gordon-Levitt', role: 'Arthur', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' }
    ],
    director: 'Christopher Nolan',
    rating: 8.8,
    voteCount: 78500,
    certification: 'UA',
    trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    status: 'Now Showing',
    featured: false
  },
  {
    title: 'Avengers: Secret Wars',
    posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    description: 'The monumental culmination of the Marvel Multiverse Saga as Earth’s mightiest heroes and iconic variants from across timelines unite to prevent the collapse of reality itself.',
    genre: ['Action', 'Sci-Fi', 'Fantasy'],
    language: ['English', 'Hindi', 'Telugu'],
    duration: 175,
    releaseDate: new Date('2027-05-07'),
    cast: [
      { name: 'Robert Downey Jr.', role: 'Doctor Doom', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' },
      { name: 'Benedict Cumberbatch', role: 'Doctor Strange', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' }
    ],
    director: 'Anthony and Joe Russo',
    rating: 9.3,
    voteCount: 9400,
    certification: 'UA',
    trailerUrl: 'https://www.youtube.com/embed/6ZfuNTqbHE8',
    status: 'Coming Soon',
    featured: false
  },
  {
    title: 'Avatar: Fire and Ash',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    description: 'Jake and Neytiri encounter a more aggressive, volcanic tribe of Na’vi known as the "Ash People", unveiling a darker side of Pandora that challenges their ideals of unity.',
    genre: ['Action', 'Adventure', 'Fantasy'],
    language: ['English', 'Hindi'],
    duration: 190,
    releaseDate: new Date('2025-12-19'),
    cast: [
      { name: 'Sam Worthington', role: 'Jake Sully', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
      { name: 'Oona Chaplin', role: 'Varang', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' }
    ],
    director: 'James Cameron',
    rating: 8.9,
    voteCount: 5200,
    certification: 'UA',
    trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0',
    status: 'Coming Soon',
    featured: false
  }
];

// Sample Theatres Data
const sampleTheatres = [
  {
    name: 'PVR ICON: Phoenix Palladium',
    brand: 'PVR Cinemas',
    city: 'Mumbai',
    location: 'Lower Parel',
    address: '462, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
    totalScreens: 4,
    facilities: ['IMAX with Laser', 'Dolby Atmos 7.1', 'Luxury Recliners', 'Gourmet In-Seat Dining', 'Valet Parking'],
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'INOX Megaplex: Inorbit Mall',
    brand: 'INOX',
    city: 'Mumbai',
    location: 'Malad West',
    address: 'Inorbit Mall, Link Road, Malad West, Mumbai, Maharashtra 400064',
    totalScreens: 5,
    facilities: ['ScreenX 270°', '4DX Motion Seats', 'Dolby Atmos', 'Cafe Unwind', 'Wheelchair Access'],
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'PVR Director’s Cut: Ambience Mall',
    brand: 'PVR Cinemas',
    city: 'Delhi-NCR',
    location: 'Vasant Kunj',
    address: 'Ambience Mall, Nelson Mandela Marg, Vasant Kunj, New Delhi 110070',
    totalScreens: 3,
    facilities: ['Ultra Luxury Lounges', 'Private Chef Menu', '4K Laser Projection', 'Bar & Lounge', 'Concierge Service'],
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Cinépolis VIP: Forum Shantiniketan',
    brand: 'Cinepolis',
    city: 'Bengaluru',
    location: 'Whitefield',
    address: 'Forum Shantiniketan Mall, ITPL Main Road, Whitefield, Bengaluru 560067',
    totalScreens: 4,
    facilities: ['VIP Recliner Auditorium', 'Dolby 7.1 Sound', 'Coffee Bar', 'Ample Parking'],
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Prasad’s Multiplex & IMAX',
    brand: 'Prasads',
    city: 'Hyderabad',
    location: 'Necklace Road',
    address: 'NTR Gardens, Necklace Road, Hussain Sagar, Hyderabad, Telangana 500063',
    totalScreens: 5,
    facilities: ['Large Format Giant Screen', 'Dolby Atmos', 'Gaming Zone', 'Food Court', 'Lake View'],
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'
  }
];

// Helper to generate seat matrix
const createSeatMatrix = (prices) => {
  const seats = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsPerRow = 10;

  rows.forEach((rowLetter, index) => {
    let category = 'Gold';
    let price = prices.gold;

    if (index < 2) {
      category = 'Silver';
      price = prices.silver;
    } else if (index === rows.length - 1) {
      category = 'Platinum';
      price = prices.platinum;
    }

    for (let num = 1; num <= seatsPerRow; num++) {
      seats.push({
        seatNumber: `${rowLetter}${num}`,
        row: rowLetter,
        number: num,
        category,
        price,
        status: 'available',
        lockedBy: null,
        lockedAt: null,
        lockExpiresAt: null,
        bookedBy: null,
        bookingId: null
      });
    }
  });

  return seats;
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('[Seeder] Starting fresh database seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Movie.deleteMany();
    await Theatre.deleteMany();
    await Screen.deleteMany();
    await Show.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Notification.deleteMany();

    console.log('[Seeder] Collections cleared.');

    // 1. Create Default Users (Admin & Demo User)
    const admin = await User.create({
      name: 'IMovies Administrator',
      email: 'admin@imovies.com',
      phone: '+91 9876543210',
      password: 'Admin@123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    });

    const demoUser = await User.create({
      name: 'Aditya Singh',
      email: 'user@imovies.com',
      phone: '+91 9811223344',
      password: 'User@123',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    });

    console.log('[Seeder] Admin and Demo users created:');
    console.log('   - Admin: admin@imovies.com | Admin@123');
    console.log('   - User:  user@imovies.com  | User@123');

    // 2. Insert Movies
    const createdMovies = await Movie.insertMany(sampleMovies);
    console.log(`[Seeder] ${createdMovies.length} movies inserted.`);

    // 3. Insert Theatres and Screens
    const createdTheatres = [];
    const createdScreens = [];

    for (const t of sampleTheatres) {
      const theatre = await Theatre.create(t);
      createdTheatres.push(theatre);

      const screenConfigs = [
        { name: 'Audi 1 - IMAX Laser', type: 'IMAX 3D' },
        { name: 'Audi 2 - Dolby Atmos', type: 'Dolby Cinema' },
        { name: 'Audi 3 - 4DX RealMotion', type: '4DX' }
      ];

      for (let i = 0; i < screenConfigs.length; i++) {
        const sc = await Screen.create({
          theatre: theatre._id,
          screenNumber: i + 1,
          name: screenConfigs[i].name,
          screenType: screenConfigs[i].type,
          totalSeats: 60,
          rows: ['A', 'B', 'C', 'D', 'E', 'F'],
          seatsPerRow: 10
        });
        createdScreens.push(sc);
      }
    }
    console.log(`[Seeder] ${createdTheatres.length} theatres and ${createdScreens.length} screens created.`);

    // 4. Generate Shows across today and the next 5 days
    const showTimes = ['10:30 AM', '01:45 PM', '05:30 PM', '08:45 PM', '11:15 PM'];
    const nowShowingMovies = createdMovies.filter((m) => m.status === 'Now Showing');
    const createdShows = [];

    // Dates: Today, Tomorrow, Day after, etc.
    const dates = [];
    for (let d = 0; d < 6; d++) {
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() + d);
      dates.push(dateObj.toISOString().split('T')[0]);
    }

    const prices = { silver: 180, gold: 260, platinum: 360 };

    for (const theatre of createdTheatres) {
      const theatreScreens = createdScreens.filter((s) => s.theatre.toString() === theatre._id.toString());

      for (let dateIdx = 0; dateIdx < dates.length; dateIdx++) {
        const dateStr = dates[dateIdx];

        theatreScreens.forEach((screen, screenIdx) => {
          // Select 2-3 showtimes per screen
          const selectedTimes = [showTimes[screenIdx % showTimes.length], showTimes[(screenIdx + 2) % showTimes.length]];
          const movie = nowShowingMovies[(screenIdx + dateIdx) % nowShowingMovies.length];

          selectedTimes.forEach((time) => {
            const seats = createSeatMatrix(prices);

            // Pre-book 5-10 random seats to make the theatre look active and realistic
            const sampleBookedIndices = [3, 4, 15, 16, 25, 26, 42, 43];
            sampleBookedIndices.forEach((idx) => {
              if (seats[idx]) {
                seats[idx].status = 'booked';
              }
            });

            createdShows.push({
              movie: movie._id,
              theatre: theatre._id,
              screen: screen._id,
              showDate: dateStr,
              showTime: time,
              ticketPrices: prices,
              status: 'Scheduled',
              seats
            });
          });
        });
      }
    }

    const insertedShows = await Show.insertMany(createdShows);
    console.log(`[Seeder] ${insertedShows.length} scheduled shows created.`);

    // 5. Create a sample confirmed booking for Demo User
    const sampleShow = insertedShows[0];
    const sampleMovie = await Movie.findById(sampleShow.movie);
    const sampleTheatre = await Theatre.findById(sampleShow.theatre);

    const bookingRef = 'IMV-839215';
    const sampleSeats = [
      { seatNumber: 'C4', category: 'Gold', price: 260 },
      { seatNumber: 'C5', category: 'Gold', price: 260 }
    ];
    const subtotal = 520;
    const fee = 60;
    const gst = Math.round((subtotal + fee) * 0.18);
    const totalAmount = subtotal + fee + gst;

    const sampleBooking = await Booking.create({
      bookingReference: bookingRef,
      user: demoUser._id,
      movie: sampleMovie._id,
      theatre: sampleTheatre._id,
      show: sampleShow._id,
      screenName: 'Audi 1 - IMAX Laser',
      seats: sampleSeats,
      seatCount: 2,
      subtotal,
      convenienceFee: fee,
      gst,
      totalAmount,
      showDate: sampleShow.showDate,
      showTime: sampleShow.showTime,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      qrCode: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="black"/><text x="10" y="55" fill="white" font-size="12">IMV-839215</text></svg>'
    });

    const samplePayment = await Payment.create({
      transactionId: 'TXN-7362941',
      booking: sampleBooking._id,
      user: demoUser._id,
      amount: totalAmount,
      paymentMethod: 'UPI',
      paymentDetails: { upiId: 'aditya@upi' },
      status: 'success',
      isDemo: true
    });

    sampleBooking.payment = samplePayment._id;
    await sampleBooking.save();

    // Mark seats as booked on the show
    sampleShow.seats.forEach((s) => {
      if (s.seatNumber === 'C4' || s.seatNumber === 'C5') {
        s.status = 'booked';
        s.bookedBy = demoUser._id;
        s.bookingId = sampleBooking._id;
      }
    });
    await sampleShow.save();

    // 6. Create sample notification
    await Notification.create({
      user: demoUser._id,
      title: 'Booking Confirmed! 🎟️',
      message: `Your tickets for ${sampleMovie.title} at ${sampleTheatre.name} (${sampleSeats.map((s) => s.seatNumber).join(', ')}) are confirmed.`,
      type: 'booking',
      referenceId: bookingRef
    });

    console.log('[Seeder] Sample booking and payment created for Demo User.');
    console.log('[Seeder] ✅ Database seeding completed successfully!');
  } catch (err) {
    console.error('[Seeder] Error seeding database:', err);
    throw err;
  }
};

// Check if database is empty on server startup
const autoSeedIfEmpty = async () => {
  try {
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('[Seeder] Database is empty. Running automatic seed...');
      await seedDatabase();
    } else {
      console.log(`[Seeder] Database already populated (${movieCount} movies found).`);
    }
  } catch (err) {
    console.error('[Seeder] Auto-seed check failed:', err.message);
  }
};

// Allow running directly: node seeder.js
if (require.main === module) {
  connectDB()
    .then(async () => {
      await seedDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDatabase, autoSeedIfEmpty };
