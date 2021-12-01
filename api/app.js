require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload({
    useTempFiles : true,
}));

//Connect mongodb
mongoose.connect(process.env.URI_MONGO,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("connect db success")
}
).catch(err =>{
    console.log("connect db fail")
    console.log(err)
});


app.use('/api/user', require('./routes/userRoute'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/class', require('./routes/classRoute'));
app.use('/api/subject', require('./routes/subjectRoute'));
app.use('/api/question', require('./routes/questionRoute'));
app.use('/api/test', require('./routes/testRoute'));
app.use('/api/testing', require('./routes/testingRoute'));

const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`Server is listening port ${PORT}`);
});