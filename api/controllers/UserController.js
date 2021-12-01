const User = require('../models/User');
const Testing = require('../models/Testing');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
    register: async (req, res) => {
        try {
            const { name, username, password } = req.body;
            const user = await User.findOne({ username: username });
            if (user) return res.status(400).json({ 'msg': 'Tài khoản đã tồn tại' });
            if (password.length < 6) return res.status(400).json({ 'msg': 'Your password must be at least 6 characters long' });
            const hash = await bcrypt.hash(password, 10);
            const newUser = User({
                name,
                username,
                password: hash,
                role: 1
            });
            await newUser.save();
            return res.status(200).json({msg: 'Đăng ký thành công'});
        }
        catch (error) {
            return res.status(500).json({ 'msg': 'Lỗi kết nối' })
        }
    },
    login: async (req, res) => {
        const { username, password } = req.body;
        try {
            const user = await User.findOne({ username: username });

            if (!user) return res.status(400).json({ msg: 'Đăng nhập sai' });
            if(user.role === 0){
                if(!user.active){
                    return res.status(400).json({ msg: 'Đăng nhập sai' });
                }
            }
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                const token = setToken({ id: user._id, name: user.name, role: user.role })
                return res.status(200).json({ token: token, name: user.name, role: user.role, classId: user.classId })
            }
            return res.status(400).json({ msg: 'Đăng nhập sai' })
        } catch (error) {
            return res.status(500).json({msg: 'Lỗi kết nối'});
        }
    },
    getUser: async(req, res) => {  
        try {
            if(req.query){
                const user = await User.find(req.query).find({active: true});
                return res.status(200).json(user);
            }else{
                return res.status(200).json(req.user);
            }
        } catch (error) {
            
        }
       
    },
    addMultiStudent: (req, res) => {  
        try {
            const {students, classId} = req.body;
            students.forEach(async student => {
            const {name, password} = student;
            let {username} = student;
            let user = await User.findOne({username});
            while(user){
                username = username + Math.random().toString(36).substr(2, 2);
                let user = await User.findOne({username});
            }
            const hash = await bcrypt.hash(password, 10);
            const newUser = User({name, username, restore: password, password: hash, classId});
            await newUser.save();
        });
        return res.status(200).json({msg: 'Thêm thành công'});
        } catch (error) {
            return res.status(500).json({msg: 'Lỗi kết nối'});
        }
    },
    getTested: async(req, res) => {  
        try {
            const {id} = req.params;
            const testing = await Testing.findOne({userId: id});
            if(testing)
            return res.status(200).json(testing._id);
            return res.status(200).json(null);
        } catch (error) {
            return res.status(500).json({msg: 'Lỗi kết nối'});
        }
    },
    deleteStudent: async(req, res) => {  
        try {
            const {id} = req.params;
            const testing = await Testing.findOne({userId: id});
            if(testing){
                const user = await User.findByIdAndUpdate(id,{active: false});
                return res.status(200).json(user);
            }
            const user = await User.findByIdAndDelete(id);
                return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({msg: 'Lỗi kết nối'});
        }
    },
    changePass: async(req, res) => {  
        try {
            const {user} = req;
            const {newPass} = req.body;
            const hash = await bcrypt.hash(newPass, 10);
            const userUpdate = await User.findById(user.id);
            userUpdate.password = hash;
            if(user.role === 0){
                userUpdate.restore = newPass;
            }
            const result = await userUpdate.save();
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({msg: 'Lỗi kết nối'});
        }
    },


}

const setToken = data => {
    const token = jwt.sign(data, process.env.SECRET_KEY, { expiresIn: '1d' })
    return token;
}

module.exports = userController;