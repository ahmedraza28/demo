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
      cb(null, '../src/assets/data/temp/')  // Temp folder for initial upload
  },
  filename: function (req, file, cb) {
      // Use a temporary file name
      cb(null, 'upload');
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
      const tempImagePath = req.file.path;
      const finalImagePath = path.join('../src/assets/data/', 'upload' + '.jpg');

      // Convert the uploaded image to JPG format and save it to the final path
      await sharp(tempImagePath).jpeg().toFile(finalImagePath);

      // Attempt to delete the temporary file
      try {
          fs.unlinkSync(tempImagePath);
      } catch (unlinkError) {
          console.error('Error deleting temporary file:', unlinkError);
      }

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

          // const imgPath = 'https://weshop-backend.onrender.com/files/image/' + path.basename(imagePath);
          // const nyPath = 'https://weshop-backend.onrender.com/files/npy/' + path.basename(npyPath);

          // res.send(`${imgPath} image path, ${nyPath} npy path`);
          res.send("successful")
      } else {
          res.status(400).send('Invalid response from the external API');
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Error occurred while processing the file');
  }
});

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
      const imagePath = req.file.path;
      const imageName = req.file.originalname;
  
      // Create form-data for the external request
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));
  
      // Send the request to the external API
      const externalApiResponse = await axios.post('https://b2skbfxx-8000.euw.devtunnels.ms/process_image/', formData, {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer', // Set the response type to 'arraybuffer'
      });
  
      // Check if the API response contains valid data
      if (externalApiResponse.status === 200 && externalApiResponse.data) {
        // Save the received data as a .npy file
        const npyName = 'output'+'.npy';
        const npyPath = path.join('../src/assets/data/', npyName);
        console.log(npyPath);
        fs.writeFileSync(npyPath, externalApiResponse.data);
  
        // Store file paths in the database
        const newFile = new File({
          imageName: imageName,
          imagePath: imagePath,
          npyName: npyName,
          npyPath: npyPath,
        });
        await newFile.save();

        const imgPath = 'https://weshop-backend.onrender.com/files/image/' + path.basename(req.file.path);
        const nyPath = 'https://weshop-backend.onrender.com/files/npy/' + path.basename(npyPath);


  
        res.send(`${imgPath} image path, ${nyPath} npy path`);
      } else {
        res.status(400).send('Invalid response from the external API');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error occurred while processing the file');
    }
  });

app.get('/files', async (req, res) => {
    try {
      const files = await File.find();
      const filePaths = files.map(file => {
        return {
          imageName: file.imageName,
          imagePath: file.imagePath ? file.imagePath.replace(/\\/g, '/') : null, // Check if imagePath exists
          npyName: file.npyName,
          npyPath: file.npyPath ? file.npyPath.replace(/\\/g, '/') : null // Check if npyPath exists
        };
      });
      res.json(filePaths);
    } catch (error) {
      console.error('Error fetching file list:', error);
      res.status(500).send('Error occurred while fetching file list');
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
