const router = require('express').Router();
const subjectController = require('../controllers/SubjectController');
const {auth, authTeacher} = require('../controllers/auth');

router.post('/', auth, authTeacher, subjectController.create);
router.put('/:id', auth, authTeacher, subjectController.update);
router.delete('/:id', auth, authTeacher, subjectController.delete);
router.get('/getbyownerid', auth, authTeacher, subjectController.getByOwnerId);
router.get('/getbyowneridandClassId', auth, authTeacher, subjectController.getByOwnerIdandClassId);

module.exports = router;