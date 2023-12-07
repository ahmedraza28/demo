import React, { useState } from 'react';
import { Card, Button, Typography } from "@material-tailwind/react";

interface Image {
  url: string;
  taskNumber: number;
}

const Sidebar: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<Image[]>([]);

  const handleAddImage = () => {
    const newImage: Image = {
      url: 'https://example.com/placeholder-image.jpg', // Replace this with the actual URL or use the uploaded image URL
      taskNumber: selectedImages.length + 1,
    };

    setSelectedImages((prevImages) => [...prevImages, newImage]);
  };

  const handleDeleteImage = (taskNumber: number) => {
    setSelectedImages((prevImages) =>
      prevImages.filter((image) => image.taskNumber !== taskNumber)
    );
  };

  return (
    <>
      <Card className="h-[100vs] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5">
        <div className="mb-2 p-4">
          <Typography className='mb-4'>
            <p className="text-xl">Mannequin Photos</p>
            <p>Showcase clothing with a variety of models that aligns with your brand’s aesthetic.</p>
          </Typography>
          <Button
            variant="outlined"
            className="px-20 py-2 rounded-xl border-2 border-[#7530fe] text-[#7530fe]"
            onClick={handleAddImage}
          >
            + New
          </Button>
          {selectedImages.map((image) => (
            <Card
              key={image.taskNumber}
              className="mt-4 p-2 border border-gray-300 rounded-md relative"
            >
              <div className="flex items-center justify-between mb-2">
                <img
                  src={image.url}
                  alt={`Task ${image.taskNumber}`}
                  className="w-full h-auto"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => handleDeleteImage(image.taskNumber)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </>
  );
};

export default Sidebar;
