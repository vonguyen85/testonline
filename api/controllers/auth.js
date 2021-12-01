const jwt = require('jsonwebtoken');

const auth = (req, res, next) =>{
    try {
        const token = req.headers.token;
        const user = jwt.verify(token, process.env.SECRET_KEY);
        req.user = user;
        next();
    } catch (error) {
        res.status(400).json({msg: 'Đăng nhập sai'})
    }
}

const authTeacher = (req, res, next) =>{
    if(req.user.role === 1) next();
    else{
        return res.status(400).json({msg: 'Denied'});
    }
}

module.exports = {auth, authTeacher};