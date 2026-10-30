const Movie = require('../models/Movie');
const Show = require('../models/Show');

// @desc    Get all movies with filters & search
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, status, sort, featured } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } },
        { 'cast.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (genre && genre !== 'All') {
      query.genre = { $in: [new RegExp(genre, 'i')] };
    }

    if (language && language !== 'All') {
      query.language = { $in: [new RegExp(language, 'i')] };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    let sortOption = { releaseDate: -1 };
    if (sort === 'rating_desc') {
      sortOption = { rating: -1 };
    } else if (sort === 'rating_asc') {
      sortOption = { rating: 1 };
    } else if (sort === 'title_asc') {
      sortOption = { title: 1 };
    } else if (sort === 'title_desc') {
      sortOption = { title: -1 };
    } else if (sort === 'release_asc') {
      sortOption = { releaseDate: 1 };
    }

    const movies = await Movie.find(query).sort(sortOption);

    res.json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single movie by ID with upcoming shows
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Get today and upcoming shows for this movie
    const today = new Date().toISOString().split('T')[0];
    const shows = await Show.find({
      movie: movie._id,
      showDate: { $gte: today },
      status: { $ne: 'Cancelled' }
    })
      .populate('theatre', 'name city location brand facilities')
      .populate('screen', 'name screenType')
      .sort({ showDate: 1, showTime: 1 });

    res.json({
      success: true,
      movie,
      shows
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get featured spotlight movies
// @route   GET /api/movies/spotlight/featured
// @access  Public
const getFeaturedMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ status: 'Now Showing' })
      .sort({ rating: -1 })
      .limit(5);

    res.json({
      success: true,
      movies
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      movie
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update movie details
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Movie updated successfully',
      movie
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Check if there are active shows scheduled
    const activeShows = await Show.countDocuments({
      movie: movie._id,
      showDate: { $gte: new Date().toISOString().split('T')[0] },
      status: { $ne: 'Cancelled' }
    });

    if (activeShows > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete movie: It has ${activeShows} active scheduled shows.`
      });
    }

    await Movie.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  getFeaturedMovies,
  createMovie,
  updateMovie,
  deleteMovie
};
