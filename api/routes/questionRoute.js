const router = require('express').Router();
const questionController = require('../controllers/QuestionController');
const {auth, authTeacher} = require('../controllers/auth');

router.post('/multi_create', auth, authTeacher, questionController.multiCreate);
router.get('/random', auth, authTeacher, questionController.getRandom);
router.get('/arrayQuestion', auth, authTeacher, questionController.getByarrQuestionId);
router.delete('/', auth, authTeacher, questionController.delete);
router.put('/', auth, authTeacher, questionController.update);
router.get('/', auth, authTeacher, questionController.getBySubjectId);


module.exports = router;