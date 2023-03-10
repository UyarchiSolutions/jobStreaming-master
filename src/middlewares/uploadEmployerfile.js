const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req,res, cb){
      cb(null, path.join(__dirname, '../../public/resumes/uploadfiles'));
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});


const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    if (file.mimetype === 'application/pdf' || file.mimetype ==='application/vnd.ms-powerpoint' || file.mimetype ==='application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      callback(null, true);
    } else {
      console.log('Only pdf, ppt, pptx  file supported!');
      callback(null, false);
    }
  },
  limits: {
    fileSize: 6024 * 6024 * 6,
  },
});




module.exports = upload;