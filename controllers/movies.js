const movieModel = require('../models/movie');
const BadRequestError = require('../errors/BadRequest');
const NotFoundError = require('../errors/NotFound');
const ForbiddenError = require('../errors/Forbidden');

function getAllMovies(req, res, next) {
  movieModel
    .find({ owner: req.user._id })
    .then((movies) => res.status(200).send(movies))
    .catch((err) => next(err));
}

function createMovie(req, res, next) {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const userId = req.user._id;

  movieModel
    .create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      thumbnail,
      movieId,
      nameRU,
      nameEN,
      owner: userId,
    })
    .then((movie) => res.status(201).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные при создании видео'));
      }
      return next(err);
    });
}

function deleteMovie(req, res, next) {
  movieModel
    .findById(req.params._id)
    .then((movie) => {
      if (!movie) {
        return next(new NotFoundError('Видео по указанному _id не найдено'));
      }
      if (movie.owner.toString() !== req.user._id) {
        return next(new ForbiddenError('Нет прав на удаление'));
      }
      return movieModel.findByIdAndDelete(req.params._id).then(() => res.send({ message: 'Видео удалено' })).catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Передан некорректный _id карточки'));
      }
      return next(err);
    });
}

module.exports = {
  getAllMovies,
  createMovie,
  deleteMovie,
};
