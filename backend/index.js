const express = require('express');
const multer = require('multer');
const axios = require('axios'); // Import Axios for making HTTP requests
const cors = require('cors');
const fs = require('fs'); // Import fs module for file operations
const app = express();
const port = 5000;

app.use(cors());

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../src/assets/data'); // Destination folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // File name after saving
  },
});

const upload = multer({ storage: storage });

// Route for file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = `../src/assets/data/${req.file.originalname}`;
    const aiApiUrl = 'https://b2skbfxx-8000.euw.devtunnels.ms/process_image/';

    // Make a POST request to the AI API
    const aiApiResponse = await axios.post(aiApiUrl, {
      image: fs.createReadStream(filePath), // Send the image file to the AI API
    });

    // Save the AI API response (embedding file) in the same folder as the uploaded image
    const embeddingFilePath = `../src/assets/data/embedding_${req.file.originalname}`;
    fs.writeFileSync(embeddingFilePath, aiApiResponse.data);

    res.send(
      `File uploaded and saved at ${filePath}, embeddings saved at ${embeddingFilePath}`
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
