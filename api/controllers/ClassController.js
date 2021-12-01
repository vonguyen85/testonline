const Class = require('../models/Class');
const Test = require('../models/Test');

const classController = {
    create: async (req, res) => {
        try {
            const userid = req.user.id;
            const { name } = req.body;
            const testClass = await Class.findOne({ name: name, owner: userid });
            if (testClass) return res.status(400).json({ msg: `${name} đã tồn tại` });
            const newClass = new Class({ name, owner: userid });
            const result = await newClass.save();
            res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({ msg: 'Lỗi kết nối' })
        }
    },
    getByOwnerId: async (req, res) => {
        try {
            const classList = await Class.find({ owner: req.user.id }).sort({createdAt: -1});
            const classIds = classList.map(item => item._id)
            const tests = await Test.distinct('classId',{classId: {$in: classIds}});
            const filterClass = classList.map(item => {
                if(tests.includes(item._id.toString())){
                    return {_id: item._id, name: item.name, used: true};
                }else{
                    return {_id: item._id, name: item.name, used: false};
                }
            })
            return res.json(filterClass)
        } catch (error) {
            return res.status(500).json({ 'msg': 'Lỗi kết nối' })
        }
    },
    updateById: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const testClass = await Class.findOne({ name: name, owner: req.user.id });
            if (testClass) return res.status(400).json({ msg: `${name} đã tồn tại` });

            const classItem = await Class.findByIdAndUpdate(id, { name: name }, { new: true });
          
            return res.status(200).json(classItem)
        } catch (error) {
            return res.status(500).json({ 'msg': 'Lỗi kết nối' })
        }
    },
    deleteById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await Class.findByIdAndDelete(id);
            return res.status(200).json(result)
        } catch (error) {
            return res.status(500).json({ 'msg': 'Lỗi kết nối' })

        }
    },

}



module.exports = classController;