const router = require('express').Router();
const testController = require('../controllers/TestController');
const {auth, authTeacher} = require('../controllers/auth');

router.post('/', auth, authTeacher, testController.create);
router.get('/', auth, authTeacher, testController.get);
router.get('/student', auth, testController.getStudent);
router.put('/', auth, testController.update);
router.delete('/:id', auth, authTeacher, testController.delete);


module.exports = router;