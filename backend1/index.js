const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const AdmZip = require('adm-zip'); // Import the adm-zip library

// // MongoDB connection
// mongoose.connect('mongodb://localhost:27017/Weshopfiles', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB...'))
//   .catch(err => console.error('Could not connect to MongoDB...', err));
// MongoDB connection
mongoose.connect('mongodb+srv://admin:admin@cluster0.y8ueoox.mongodb.net/Weshopfiles', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB Atlas...'))
  .catch(err => console.error('Could not connect to MongoDB Atlas...', err));


  const fileSchema = new mongoose.Schema({
    imageName: String,
    imagePath: String,
    npyName: String,
    npyPath: String
  });
  const File = mongoose.model('File', fileSchema);

  
// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// C:\Users\ahmed\Documents\GitHub\demo\src\assets\data
// Multer setup for file uploads (saving files on disk)
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, '../src/assets/data/')  // 'uploads/' is the folder where files will be saved
//     },
//     filename: function (req, file, cb) {
//       cb(null, 'upload' + path.extname(file.originalname))
//     }
//   });

//   const upload = multer({ storage: storage });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../src/assets/data/uploads/'); // Use a directory with write permissions
  },
  filename: function (req, file, cb) {
      // Use a temporary file name
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const tempImagePath = req.file.path;

    // Always save the uploaded image as a JPG
    const imageType = 'jpg';

    const finalImagePath = path.join('../src/assets/data/', `upload.${imageType}`);

    // Convert the uploaded image to JPG format and save it to the final path
    await sharp(tempImagePath).toFormat(imageType).toFile(finalImagePath);
// attemp delete
  // Attempt to delete the temporary file with a delay
  setTimeout(() => {
    try {
      fs.unlinkSync(tempImagePath);
    } catch (unlinkError) {
      console.error('Error deleting temporary file:', unlinkError);
    }
  }, 2000); 

    // Create form-data for the external request
    const formData = new FormData();
    formData.append('file', fs.createReadStream(finalImagePath));

    // Send the request to the external API
    const externalApiResponse = await axios.post('https://b2skbfxx-8000.euw.devtunnels.ms/process_image/', formData, {
      headers: formData.getHeaders(),
      responseType: 'arraybuffer',
    });

    // Check if the API response contains valid data
    if (externalApiResponse.status === 200 && externalApiResponse.data) {
      // Save the received data as a .npy file
      const npyName = 'output.npy';
      const npyPath = path.join('../src/assets/data/', npyName);
      fs.writeFileSync(npyPath, externalApiResponse.data);

      // Send a success response
      res.send('Successful upload and processing.');
    } else {
      res.status(400).send('Invalid response from the external API');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while processing the file');
  }
});
  
  
// Endpoint to fetch a specific image file
app.get('/files/image/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'uploads', filename));
});

// Endpoint to fetch a specific .npy file
app.get('/files/npy/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'uploads', filename));
});

// Server setup
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
