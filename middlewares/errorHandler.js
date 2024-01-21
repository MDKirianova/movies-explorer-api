const errorHandler = (err, req, res, next) => {
  if (err.statusCode) {
    return res.status(err.statusCode).send({ message: err.message });
  }
  res.status(500).send({ message: 'Ошибка по умолчанию. Server error!' });
  return next();
};

module.exports = errorHandler;
