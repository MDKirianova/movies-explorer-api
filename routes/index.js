const router = require('express').Router();

const userRouter = require('./users');
const movieRouter = require('./movies');
const auth = require('../middlewares/auth');
const { createUser, loginUser } = require('../controllers/users');

const NotFoundError = require('../errors/NotFound');
const { validateCreateUser, validateLoginUser } = require('../middlewares/validation');

router.post('/signup', validateCreateUser, createUser);
router.post('/signin', validateLoginUser, loginUser);

router.use(auth);

router.use(userRouter);
router.use(movieRouter);

router.use((req, res, next) => next(new NotFoundError('Страницы по такому URL не найдено')));

module.exports = router;
