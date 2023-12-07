import React, { useState, ChangeEvent, useEffect } from 'react';
import TextDescription from './textdescription';
import axios from 'axios';
import { openDB } from 'idb';

interface CardDimensions {
  width: number;
  height: number;
}

const aiApiUrl = 'https://b2skbfxx-8000.euw.devtunnels.ms/process_image/';

const UploadImage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cardDimensions, setCardDimensions] = useState<CardDimensions>({
    width: 400,
    height: 400,
  });

  async function initDB() {
    return openDB('myDatabase', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }

  useEffect(() => {
    const savedImage = localStorage.getItem('selectedImage');
    if (savedImage) {
      setSelectedFile(new File([savedImage], 'selectedImage'));
    }
  }, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const image = new Image();
      image.src = URL.createObjectURL(file);

      image.onload = async () => {
        if (
          image.width >= 512 &&
          image.height >= 512 &&
          image.width / image.height < 2
        ) {
          setSelectedFile(file);

          setCardDimensions({
            width: Math.min(image.width, cardDimensions.width),
            height: Math.min(image.height, cardDimensions.height),
          });

          const formData = new FormData();
          formData.append('file', file);

          try {
            const response = await axios.post(
              aiApiUrl,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob' // Request the response as a Blob
              }
            );
      
            if (response.status === 200) {
              const responseData = response.data;
              const db = await initDB();
      
              // Save the Blob in IndexedDB
              const tx = db.transaction('files', 'readwrite');
              const store = tx.objectStore('files');
              const fileKey = await store.add({ file: responseData });
              console.log('Saved file with key:', fileKey);

              // Read and log the ArrayBuffer from the Blob
              const arrayBuffer = await readBlobAsArrayBuffer(responseData);
              console.log('ArrayBuffer:', arrayBuffer);
            } else {
              console.error('API Error:', response.statusText);
            }
          } catch (error) {
            console.error('API Request Error:', error);
          }
        } else {
          alert(
            'Error: The width and height dimensions of the image should be greater than 512, and the aspect ratio should be less than 2.'
          );
          setSelectedFile(null);
          setCardDimensions({ width: 400, height: 400 });
        }
      };
    }
  };

  function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(blob);
    });
  }
  
  return (
    <div>
      <div className="flex">
        <div className="flex items-center justify-center w-full mt-10 ml-5">
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-[${cardDimensions.width}px] h-[${cardDimensions.height}px] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600`}
          >
            {selectedFile && (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Selected"
                className="w-full h-full rounded-lg"
              />
            )}
            {!selectedFile && (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#7530fe"
                  className="w-6 h-6"
                >
                  {/* Your SVG path here */}
                </svg>
                <p className="mb-2 text-sm text-[#7530fe] text-500 dark:text-[#7530fe]">
                  <span className="font-semibold">Upload Image</span>
                </p>
                <p>Drag and drop file here or upload here</p>
                <p className="text-xs text-gray-300 dark:text-gray-400">
                  Size should not exceed 10MB, aspect ratio should be less than
                  2, and GIF format is not supported
                </p>
              </>
            )}
          </label>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>
      </div>
      <TextDescription />
    </div>
  );
};

export default UploadImage;
