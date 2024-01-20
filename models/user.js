const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');
const UnauthorizedError = require('../errors/Unauthorized');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 2,
    maxLength: 30,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [isEmail],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this
    .findOne({ email })
    .select('+password')
    .then((user) => {
      if (user) {
        return bcrypt.compare(password, user.password)
          .then((matched) => {
            if (matched) return user;

            return Promise.reject(new UnauthorizedError('Неправильный email или пароль'));
          });
      }

      return Promise.reject(new UnauthorizedError('Неправильный email или пароль'));
    });
};

module.exports = mongoose.model('user', userSchema);

// celebrate
