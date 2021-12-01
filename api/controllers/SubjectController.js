const Subject = require('../models/Subject');
const Test = require('../models/Test');
const Question = require('../models/Question');

const subjectController = {
    create: async (req, res) => {
        try {
           const userid = req.user.id;
           const {name, classId} = req.body;
           const subject = await Subject.findOne({ name: name, owner: userid, classId: classId });
           if (subject) return res.status(400).json({ msg: `${name} đã tồn tại` });
           const newSubject = new Subject({name, classId, owner: userid});
           const result = await newSubject.save();
           res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    },
    update: async (req, res) => {
        try {
            const {id} = req.params;
            const {name, classId} = req.body;
            const subject = await Subject.findOne({name: name, classId: classId, owner: req.user.id})
            if(subject) res.status(400).json({msg: 'Môn học đã tồn tại'});
            const result = await Subject.findByIdAndUpdate(id, {name: name}, {new: true});
            return res.status(200).json(result)
        } catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    },
    delete: async (req, res) => {
        try {
            const {id} = req.params;
            await Question.deleteMany({subjectId: id});
            const result = await Subject.findByIdAndDelete(id);
            return res.status(200).json(result)
        } catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    },
    getByOwnerIdandClassId: async(req, res) => {
        try {
            const SubjectList = await Subject.find({owner: req.user.id, classId: req.query.classId});
            return res.status(200).json(SubjectList)
        } catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    },
    getByOwnerId: async(req, res) => {
        try {
            const subjects = await Subject.find({owner: req.user.id});
            const subjectIds = subjects.map(subject => subject._id)
            const tests = await Test.distinct('subjectId',{subjectId: {$in: subjectIds}});
            
            const filterSubject = subjects.map(subject =>{
                if(tests.includes(subject._id.toString())){
                    return {_id: subject._id, name: subject.name, classId: subject.classId, used: true}
                }else{
                    return {_id: subject._id, name: subject.name, classId: subject.classId, used: false}
                }
            });
            return res.json(filterSubject)
        } catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    }
}



module.exports = subjectController;