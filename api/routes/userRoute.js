const router = require('express').Router();
const userController = require('../controllers/UserController');
const {auth, authTeacher} = require('../controllers/auth');


router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/addMultiStudent', auth, authTeacher, userController.addMultiStudent);
router.delete('/student/:id', auth, authTeacher, userController.deleteStudent);
router.get('/student/:id', auth, authTeacher, userController.getTested);
router.post('/changePass', auth, userController.changePass);
router.get('/', auth, userController.getUser);


module.exports = router;