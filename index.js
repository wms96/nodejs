const express = require('express');
const multer = require('multer');
const expressValidator = require('express-validator')
const fileUpload = require('express-fileupload');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressValidator())
app.use(express.static(__dirname + '/public'));
app.use(fileUpload({
  createParentPath: true
}));
const Storage = multer.diskStorage({
  destination(req, file, callback) {
    cb(null, 'uploads/');
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
  },
})

const upload = multer({ storage: Storage })

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

//Routes
app.use('users', require('./routes/users.js'));

app.post('/api/upload2', (req, res) => {
  console.log('file', req.files)
  console.log('body', req.body)
  // 'profile_pic' is the name of our file input field in the HTML form
  console.log("0")

  let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('profile_pic');
  console.log("1")

  upload(req, res, function(err) {
      // req.file contains information of uploaded file
      // req.body contains information of text fields, if there were any
      console.log("2")

      if (req.fileValidationError) {
          console.log(req.fileValidationError);
      }
      else if (!req.file) {
          console.log('Please select an image to upload');
          return;
      }
      else if (err instanceof multer.MulterError) {
        console.log(err);
        return;
      }
      else if (err) {
        console.log(err);
        return;
      }

      // Display uploaded image for user validation
      console.log(`You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`);
      return;

    });
});

app.post('/api/upload', async (req, res) => {
  console.log(req)
  try {
      if(!req.files) {
          res.send({
              status: false,
              message: 'No file uploaded'
          });
      } else {
          //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
          let avatar = req.files.files;
          
          //Use the mv() method to place the file in upload directory (i.e. "uploads")
          avatar.mv('./uploads/' + avatar.name);

          //send response
          res.send({
              status: true,
              message: 'File is uploaded',
              data: {
                  name: avatar.name,
                  mimetype: avatar.mimetype,
                  size: avatar.size
              }
          });
      }
  } catch (err) {
      res.status(500).send(err);
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
