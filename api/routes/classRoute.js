const router = require('express').Router();
const classController = require('../controllers/ClassController');
const {auth, authTeacher} = require('../controllers/auth');

router.post('/', auth, authTeacher, classController.create);
router.put('/:id', auth, authTeacher, classController.updateById);
router.delete('/:id', auth, authTeacher, classController.deleteById);

router.get('/getbyownerid', auth, authTeacher, classController.getByOwnerId);


module.exports = router;