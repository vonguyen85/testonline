const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Test = require('../models/Test');
const Testing = require('../models/Testing');

const questionController = {
    //Create multi question
    multiCreate: async (req, res) => {
        try {
            const { questions, subjectId, classId } = req.body;
            const userId = req.user.id;

            questions.forEach(async (element) => {
                if (element.question && element.answer?.length > 2 && element.exactly) {
                    const answers = [];
                    element.answer.forEach(elm => {
                        newAnswer = new Answer({ name: elm });
                        answers.push(newAnswer);
                        // test with exact answer
                        if (elm === element.exactly)
                            element.exactly = newAnswer._id;
                    })
                    const newQuestion = new Question({
                        content: element.question,
                        owner: userId,
                        classId,
                        subjectId,
                        answer: answers,
                        exact: element.exactly
                    })
                    await newQuestion.save();
                }
            });
            return res.status(200).json({ msg: 'Thêm câu hỏi thành công' })
        }
        catch (error) {
            return res.status(500).json({ 'msg': 'Lỗi kết nối đến CSDL' })
        }
    },

    //get Questions by subjectId 
    getBySubjectId: async (req, res) => {
        try {
            const { subjectId } = req.query;

            const questions = await Question.find({ subjectId: subjectId });

            if (questions) {
                const tests = await Test.find({ subjectId: subjectId });
                const result = questions.map(question => {
                    if (tests?.find(test => test.questions.includes(question._id))) {
                        return { ...question._doc, used: true }
                    } else {
                        return { ...question._doc, used: false }
                    }
                })
                return res.status(200).json(result);
            }
            return null;
        }
        catch (error) {
            return res.status(500).json({ 'msg': 'Lỗi kết nối đến CSDL' })
        }
    },
    //get Questions by array QuestionId
    getByarrQuestionId: async (req, res) => {
        try {
            const questions = await Question.find({ _id: { $in: req.query.data } });
            if (questions) return res.status(200).json(questions);
            return null;
        }
        catch (error) {
            return res.status(500).json({ 'msg': 'Lỗi kết nối đến CSDL' })
        }
    },
    getRandom: async (req, res) => {
        try {
            const { subjectId, numQuestion } = req.query;
            const questions = await Question.find({ subjectId });
            if (numQuestion < 1) return res.status(400).json({ msg: 'Số câu hỏi phải lớn hơn 0' });
            if (numQuestion > questions.length) return res.status(400).json({ msg: 'Số lượng câu hỏi trong thư viện không đủ' });

            const arrQuestion = getQuestions(questions, numQuestion);

            res.status(200).json(arrQuestion);
        }
        catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    },
    delete: async (req, res) => {
        try {
            const { questionId } = req.query;
            const question = await Question.findByIdAndDelete(questionId);
            return res.status(200).json(question);
        } catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }

    },
    update: async (req, res) => {
        try {
            const { question } = req.body;
            const questionUpdate = await Question.findById(question._id);
            if (question.used && questionUpdate.exact !== question.exact) {
                const testing = await Testing.find({ questions: question._id })

                if (testing.length > 0) {
                    //Cannot update because student join into test
                    return res.status(400).json({ msg: 'Không thể thay đổi đáp án câu hỏi vì đã có thí sinh làm bài' })
                } else {
                    updateQuestion(question, questionUpdate, res);
                }
            } else {
                updateQuestion(question, questionUpdate, res);
            }

        } catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }

    }

}

const updateQuestion = async (question, questionUpdate, res) => {
    questionUpdate.content = question.content;
    questionUpdate.answer = question.answer;
    questionUpdate.exact = question.exact;
    await questionUpdate.save({ new: true });
    return res.status(200).json(questionUpdate);
}

const findQuestionInTest = async (questionId, classId, subjectId) => {
    const tests = await Test.find({ classId: classId, subjectId: subjectId });
    if (tests) return true;
}

const getQuestions = (array, length) => {
    const arrQuestion = [];
    shuffleArray(array);
    for (let i = 0; i < length; i++) {
        arrQuestion.push(array[i]);
    }
    return arrQuestion;
}

const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}






module.exports = questionController;