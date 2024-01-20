const router = require('express').Router();
const movieController = require('../controllers/movies');
const { validateMovie, validateMovieId } = require('../middlewares/validation');

router.get('/movies', validateMovie, movieController.getAllMovies);
router.post('/movies', movieController.createMovie);
router.delete('/movies/:_id', validateMovieId, movieController.deleteMovie);

module.exports = router;
