const Test = require('../models/Test');
const Subject = require('../models/Subject');
const User = require('../models/User');
const Testing = require('../models/Testing');

const testController = {
    create: async (req, res) => {
        try {
            const userid = req.user.id;
            const { name, subjectId, timeTest, timeStart, status, questions } = req.body;

            const test = await Test.findOne({ name: name, subjectId: subjectId });
            if (test) return res.status(400).json({ msg: `${name} đã tồn tại` });

            const subject = await Subject.findById(subjectId);

            const newTest = new Test({
                name,
                questions,
                time: timeTest,
                time_start: timeStart,
                status,
                owner: userid,
                classId: subject.classId,
                subjectId
            });
            const result = await newTest.save();
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    },
    get: async (req, res) => {
        try {
            const tests = await Test.find({ owner: req.user.id }).sort({ createdAt: -1 });

            const testIds = tests.map(test => test._id.toString());
            const testing = await Testing.distinct('testId', { testId: { $in: testIds } });
            const testfilter = tests.map(test => {
                if (testing.includes(test._id.toString())){
                    return { test, tested: true };
                }
                return { test, tested: false }
            })
            return res.status(200).json(testfilter);

        } catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    },
    getStudent: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            const tests = await Test.find({ classId: user.classId, status: 1 }).sort({ createdAt: -1 });
            const testings = await Testing.find({ userId: user._id });
            const subjects = await Subject.find({ classId: user.classId });

            //Get mark test Student 
            const filterTesting = testings.map(testing => {
                return { testId: testing.testId, mark: testing.mark }
            })

            const filterTest = tests.map(test => {
                const subject = subjects.find(elm => elm._id.toString() === test.subjectId);
                const testing = filterTesting.find(testing => testing.testId === test._id.toString())
                if (testing) {
                    if (testing.mark !== -1) {
                        return { test, statusTest: 2, mark: testing.mark, subject: subject.name }
                    }
                    else {
                        return { test, statusTest: 1, subject: subject.name }
                    }
                }

                return { test, statusTest: 0, subject: subject.name }
            })

            return res.status(200).json(filterTest);
        } catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    },
    update: async (req, res) => {
        try {
            const { id, name, timeTest, timeStart, status } = req.query;
            //If student tested
            const testing = await Testing.findOne({ testId: id });
            if (testing) return res.status(400).json({ 'msg': 'Bài thi không thể thay đổi vì đã có học sinh thi' })
            const test = await Test.findById(id);
            test.name = name;
            test.time = timeTest;
            test.time_start = timeStart;
            test.status = status;
            const result = await test.save();
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }


    },
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const testing = await Testing.findOne({testId: id});
            if(testing) return res.status(400).json({ 'msg': 'Không thể xóa bài thi vì đã có học sinh làm bài' })
            const result = await Test.findByIdAndDelete(id);
            return res.status(200).json(result)
        } catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    },

}

module.exports = testController;