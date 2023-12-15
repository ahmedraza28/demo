
import { InferenceSession, Tensor } from "onnxruntime-web";
import React, { useContext, useEffect, useState } from "react";
import { Modal, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import "./assets/scss/App.scss";
import { handleImageScale } from "./components/helpers/scaleHelper";
import { modelScaleProps } from "./components/helpers/Interfaces";
import { onnxMaskToImage } from "./components/helpers/maskUtils";
import { modelData } from "./components/helpers/onnxModelAPI";
import Stage from "./components/Stage";
import AppContext from "./components/hooks/createContext";
const ort = require("onnxruntime-web");
/* @ts-ignore */
import npyjs from "npyjs";
import axios from "axios";

const IMAGE_PATH = "assets/data/upload.jpeg";
const IMAGE_EMBEDDING = "/assets/data/output.npy";


const MODEL_DIR = "/model/sam_onnx_quantized_example.onnx";

const Edit = () => {
  const {
    clicks: [clicks],
    image: [, setImage],
    maskImg: [, setMaskImg],
  } = useContext(AppContext)!;
  const [model, setModel] = useState<InferenceSession | null>(null);
  const [tensor, setTensor] = useState<Tensor | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(IMAGE_PATH);
  const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);

  useEffect(() => {
    const initModel = async () => {
      try {
        if (MODEL_DIR === undefined) return;
        const URL: string = MODEL_DIR;
        const model = await InferenceSession.create(URL);
        setModel(model);
      } catch (e) {
        console.error("Error initializing the model:", e);
      }
    };
    initModel();

    Promise.resolve(loadNpyTensor(IMAGE_EMBEDDING, "float32")).then(
      (embedding) => setTensor(embedding)
    );
  }, []);

  useEffect(() => {
    if (imagePath === null) return;
    const url = new URL(imagePath, location.origin);
    loadImage(url);
  }, [imagePath]);

  const loadImage = async (url: URL) => {
    try {
      const img = new Image();
      img.src = url.href;
      img.onload = () => {
        const { height, width, samScale } = handleImageScale(img);
        setModelScale({
          height: height,
          width: width,
          samScale: samScale,
        });
        img.width = width;
        img.height = height;
        setImage(img);
      };
      img.onerror = (error) => {
        console.error("Error loading image:", error);
      };
    } catch (error) {
      console.error("Error creating image object:", error);
    }
  };

  const loadNpyTensor = async (tensorFile: string, dType: string) => {
    try {
      let npLoader = new npyjs();
      const npArray = await npLoader.load(tensorFile);
      const tensor = new ort.Tensor(dType, npArray.data, npArray.shape);
      return tensor;
    } catch (error) {
      console.error("Error loading Numpy tensor:", error);
      throw error;
    }
  };

  useEffect(() => {
    runONNX();
  }, [clicks]);

  const runONNX = async () => {
    try {
      if (
        model === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null
      ) {
        return;
      } else {
        const feeds = modelData({
          clicks,
          tensor,
          modelScale,
        });
        if (feeds === undefined) return;

        const results = await model.run(feeds);
        const output = results[model.outputNames[0]];

        setMaskImg(onnxMaskToImage(output.data, output.dims[2], output.dims[3]));
      }
    } catch (error) {
      console.error("Error running ONNX model:", error);
    }
  };

  return (
    <>
      <Modal
        title="Uploaded Image"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
      >
        {uploadedImage && <img src={uploadedImage} alt="Uploaded" />}
    
      </Modal>
      <Stage />
      
    </>
  );
};

export default Edit;