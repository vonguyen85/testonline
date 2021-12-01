const Testing = require('../models/Testing');
const Test = require('../models/Test');
const Question = require('../models/Question');
const User = require('../models/User');

const testingController = {
    create: async (req, res) => {
        try {
            const user = req.user;
            //Teacher show student's test
            if(user.role === 1){
                const {studentId, testId} = req.body;
                const testing = await Testing.findOne({ userId: studentId, testId: testId });
                
                const questions = await getContentTesting(testing)
                const exact = await getAnswerExact(testing.questions);
                return res.status(200).json({id: testing._id, questions: questions, answer: testing.answers, exact: exact,timeStart: testing.timeStart});
            }

            //Student test
            const userId = req.user.id;
            const { testId } = req.body;
            const test = await Test.findById(testId);
            const testing = await Testing.findOne({ userId: userId, testId: testId });
            
            if (testing){
                
                const questions = await getContentTesting(testing)
                //If tested and finished
                if(testing.mark != -1){
                    const exact = await getAnswerExact(testing.questions);
                    return res.status(200).json({id: testing._id, questions: questions, answer: testing.answers, exact: exact,timeStart: testing.timeStart, time: test.time, mark: testing.mark});
                }else{
                //Tested but don't finish
                    return res.status(200).json({id: testing._id, questions: questions, answer: testing.answers, timeStart: testing.timeStart, time: test.time, mark: -1});
                }
            }
           
            const questions = shuffleArray(test.questions);
            const timeStart = new Date();
            const newtesting = new Testing({ userId, testId, timeStart, questions });
            const result = await newtesting.save();
 
            const questions_content = await getContentTesting(newtesting)
            return res.status(200).json({id: result._id, questions: questions_content, timeStart: result.timeStart, time: test.time, mark: -1});
        }
        catch (error) {
            return res.status(500).json(error);
        }
    },
    finish: async (req, res) => {
        try {
            const { testingId} = req.body;
            const testing = await Testing.findById(testingId);
            if(!testing) return res.status(400).json({msg: 'Không tìm thấy bài thi tương ứng'});
            if(testing.mark === -1){
                finishAndCalcmark(res, testing);
        }else{
            return res.status(400).json({msg: 'Bạn đã thi rồi'});
        }
        }
        catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    },
    get: async (req, res) => {
        try {
            const { testId } = req.query;
            const testing = await Testing.find({ testId: testId });
            if(testing){
                const users = await getUsers(testing);
                return res.status(200).json(users);
            }
            
            return res.status(200).json(testing);
        }
        catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    },

    // Get test which student doing
    getStudent: async (req, res) => {
        try {
            const { user } = req;
            const testing = await Testing.findOne({ userId: user.id, mark: -1 });
            if(testing){
                const test = await Test.findById(testing.testId);
                const timeStart = testing.timeStart.getTime();
                const time = test.time*60*1000;
                const now = new Date();
                if(timeStart + time <= now.getTime()){
                    //Time out
                    finishAndCalcmark(res, testing, true);
                    
                }else{
                    return res.status(200).json(testing);
                }
            }
            return res.status(200).json(null);
        }
        catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    },
    updateAnswer: async (req, res) => {
        try {
            const {id} = req.query;
            const answer = req.body;
            const testing = await Testing.findById(id);
                testing.answers = answer;
                await testing.save();   
        }
        catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    },
    
}

//Shuffle list questions
const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  // Get content question to add testing
  const getContentTesting = async testing =>{
    const result = await Question.find({ _id : {$in: testing.questions}});
    const questions = testing.questions.map(element => result.find(question => question._id.toString() === element));
    
    return questions.map(element => {
        return {id: element._id, content: element.content, answer: element.answer}
    });
  }

  //Get info user's test
  const getUsers = async testings =>{
    const arr =  testings.map(element => {
        return element.userId
    });
    const users = await User.find({_id: {$in: arr}});
    const student = [];
    users.forEach(user => {
        const result = testings.find(testing => testing.userId === user._id.toString());
        student.push({id: user._id + '&' + testings[0].testId, name: user.name, timeStart: result.timeStart, time: result.timeEnd? Math.floor((result.timeEnd - result.timeStart)/1000) : null, mark: result.mark});
    });
    return student;
  }
  
  const getAnswerExact = async arr =>{
    const questions = await getQuestions(arr);
    const exacts = [];
    arr.forEach(item => {
        const index = questions.find(question => question._id.toString() === item);
        exacts.push(index.exact);
    })
    return exacts;
  }

  const getQuestions = async arr =>{
    const questions = await Question.find({_id: {$in: arr }});
    return questions;
  }

  //Finish test and calc mark
  const finishAndCalcmark = async(res, testing, timeout=false) =>{
      console.log('finish time out')
    const numQuestion = testing.questions.length;
    if(!testing.answers){
        testing.mark = 0;
        testing.timeEnd = new Date();
        await testing.save();
        return res.status(200).json({id: testing._id,'true': 0, 'questions': numQuestion});
    } 
    //Get content Question
    const question = Object.keys(testing.answers);
    const answer = Object.values(testing.answers);
    const questions = await Question.find({_id: {$in: question }})
    let correct = 0;
    questions.forEach(element => {
        if(answer.includes(element.exact)){
            correct +=1;
        }
    });
    const mark = (correct/numQuestion)*10;
    testing.mark = Math.round(mark*100)/100;
    testing.answers = answer;
    testing.timeEnd = new Date();
    await testing.save();
    if(timeout) return res.status(200).json(null);
    return res.status(200).json({id: testing._id,'true': correct, 'questions': testing.questions.length});
  }

module.exports = testingController;