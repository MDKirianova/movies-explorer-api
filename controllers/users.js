const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const { NODE_ENV, JWT_SECRET } = require('../utils/config');
const NotFoundError = require('../errors/NotFound');
const BadRequestError = require('../errors/BadRequest');
const ConflictError = require('../errors/Conflict');
const UnauthorizedError = require('../errors/Unauthorized');

const SALT_ROUNDS = 10;

function createUser(req, res, next) {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return next(new BadRequestError('Email и пароль обязательные для регистрации'));
  }

  return bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => userModel.create({ email, password: hash, name }))
    .then((user) => res.status(201).send({
      email: user.email,
      name: user.name,
      _id: user._id,
    }))
    .catch((err) => {
      if (err.name === 'MongoServerError' && err.code === 11000) {
        return next(new ConflictError('При регистрации указан email, который уже существует на сервере'));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при регистрации пользователя'));
      }
      return next(err);
    });
}

function loginUser(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new BadRequestError('Email и пароль обязательные для авторизации'));
  }
  return userModel.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Неправильный email или пароль'));
      }
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '10d' });
      return res.status(200).send({ token });
    })
    .catch((err) => next(err));
}

function getUserInfo(req, res, next) {
  return userModel
    .findById(req.user._id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
      return res.status(200).send({ email: user.email, name: user.name });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Передан некорректный _id пользователя'));
      }
      return next(err);
    });
}

function updateUserInfo(req, res, next) {
  const { name, email } = req.body;
  const userId = req.user._id;
  return userModel
    .findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true },
    )
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'MongoServerError' && err.code === 11000) {
        return next(new ConflictError('Пользователь с такой почтой уже существует на сервере'));
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return next(new BadRequestError('Передан некорректный _id пользователя'));
      }
      return next(err);
    });
}

module.exports = {
  createUser,
  loginUser,
  getUserInfo,
  updateUserInfo,
};
