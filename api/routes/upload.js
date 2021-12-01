const router = require('express').Router();
const { auth, authTeacher } = require('../controllers/auth');
const word2html = require('word-to-html');
const readXlsxFile = require('read-excel-file/node');
const fs = require('fs');
const Class = require('../models/Class');
const path = require('path')

//Upload question Content
router.post('/docx', auth, authTeacher, (req, res) => {

    const file = req.files.file;
    fs.rename(file.tempFilePath, file.tempFilePath + '.docx', err => {
        if (err) return res.json({ msg: 'Error file' });

        //Convert docx to html
        word2html(file.tempFilePath + '.docx', { tdVerticalAlign: 'top' }, 'browser');
    });
    return res.json({ filename: `${file.tempFilePath}browser.html` })
})

router.post('/destroy', auth, authTeacher, (req, res) => {
    let file = req.body.filename;
    const index = file.lastIndexOf('\\')
    const tempPath = file.substr(0,index);
    console.log('temp', tempPath);
    fs.readdir(tempPath, (err, files) => {
        if (err) throw err;     
        for (const file of files) {
          fs.unlink(path.join(tempPath, file), err => {
          });
        }
      });
});


//parse docx
router.get('/parse_docx', (req, res) => {

    fs.readFile(req.query.file, 'utf8', (err, data) => {
        if (err) {
            return res.status(400).json({msg: 'Không thể đọc tập tin'})
        }
        const questions = [];
        let question = null;
        let answer = [];
        let exactly = null;
        //Get all question
        const content_file = data.split('w:document')[1].split('[&lt;br&gt;]')
        for (let c = 0; c < content_file.length; c++) {
            question = null;
            answer = [];
            exactly = null;
            const paragraph = content_file[c].split('w:p');

            for (let i = 0; i < paragraph.length; i++) {

                if (paragraph[i].includes('<w:t>') && paragraph[i].includes('</w:t>')) {
                    //la cau hoi
                    if (!paragraph[i].includes('<w:t>A.</w:t>') &&
                        !paragraph[i].includes('<w:t>B.</w:t>') &&
                        !paragraph[i].includes('<w:t>C.</w:t>') &&
                        !paragraph[i].includes('<w:t>D.</w:t>')
                    ) {
                        question = getContent(paragraph[i], 'question');
                    } else {
                        if (paragraph[i].includes('<w:u')) {
                            answer.push(getContent(paragraph[i], 'answer'));
                            exactly = getContent(paragraph[i], 'answer');

                        } else {
                            answer.push(getContent(paragraph[i], 'answer'));
                        }
                    }

                }
            }
            questions.push({ question, answer, exactly });
        }
        return res.json(questions);
    })
})

router.post('/excel', auth, authTeacher, (req, res) => {
    const file = req.files.file;
    console.log(file)
    fs.rename(file.tempFilePath, file.tempFilePath + '.xlsx', err => {
        if (err) return res.json({ msg: 'Error file' });

        //Convert docx to html
        console.log('object', file.tempFilePath + '.xlsx')
    });
    return res.json({ filename: `${file.tempFilePath}.xlsx` })
});

//parse excel
router.get('/parse_excel', auth, authTeacher, async (req, res) => {
    try {
        const students = [];
        const rows = await readXlsxFile(req.query.file);
        const className = await Class.findById(req.query.classId).select('name -_id');
        rows.splice(0, 1);
        rows.map(row => {
            let username = removeAccents(`${row[1]}_${className.name}`).replace(/\s+/g, '').toLowerCase();
            
            while(students.findIndex(student => student.username === username) !== -1){
                username = username + '_' + Math.random().toString(36).substr(2, 3);
            }

            const password = Math.random().toString(36).substr(2, 6);
            students.push({name: row[1], username, password});
            
        })
        return res.status(200).json(students)
    } catch (error) {
        console.log(error)
    }

})

//Remove format xml
const getContent = (data, type) => {
    if (type === 'question') {
        const content = data.split('<w:t>')[1].split('</w:t>');
        return content[0].trim();
    }
    else {
        const content = data.split('<w:t>');
        const count = content.length;
        if (count === 3) {
            const c = content[2].split('</w:t>');
            return c[0].trim();
        }
        else {
            const c = content[1].split('</w:t>');
            return c[1].split('>').pop().trim();
        }
    }

}

//remove Accents String
function removeAccents(str) {
    var AccentsMap = [
        "aàảãáạăằẳẵắặâầẩẫấậ",
        "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
        "dđ", "DĐ",
        "eèẻẽéẹêềểễếệ",
        "EÈẺẼÉẸÊỀỂỄẾỆ",
        "iìỉĩíị",
        "IÌỈĨÍỊ",
        "oòỏõóọôồổỗốộơờởỡớợ",
        "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
        "uùủũúụưừửữứự",
        "UÙỦŨÚỤƯỪỬỮỨỰ",
        "yỳỷỹýỵ",
        "YỲỶỸÝỴ"
    ];
    for (var i = 0; i < AccentsMap.length; i++) {
        var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
        var char = AccentsMap[i][0];
        str = str.replace(re, char);
    }
    return str;
}


module.exports = router;