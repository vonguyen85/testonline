const router = require('express').Router();
const testingController = require('../controllers/TestingController');
const {auth, authTeacher} = require('../controllers/auth');

router.post('/finish', auth, testingController.finish);
router.post('/updateAnswer', auth, testingController.updateAnswer);
router.post('/', auth, testingController.create);
router.get('/student', auth, testingController.getStudent);
router.get('/', auth, testingController.get);


module.exports = router;