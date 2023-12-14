import React, { useContext, useState } from "react";
import * as _ from "underscore";
import Tool from "./Tool";
import { modelInputProps } from "./helpers/Interfaces";
import AppContext from "./hooks/createContext";

const Stage = () => {
  const {
    clicks: [, setClicks],
    image: [image],
  } = useContext(AppContext)!;

  
  const [coordinates, setCoordinates] = useState<Array<[number, number]>>([]);

  const getClick = (x: number, y: number): modelInputProps => {
    const clickType = 1;
    return { x, y, clickType };
  };

  const handleMouseClick = (e: any) => {
    let el = e.nativeEvent.target;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = image ? image.width / el.offsetWidth : 1;
    x *= imageScale;
    y *= imageScale;
    const click = getClick(x, y);
    if (click) {
      setCoordinates((prevCoordinates: [number, number][]) => {
        const newCoordinates = [...prevCoordinates, [x, y]] as [number, number][];
        setClicks([click]);
        console.log(`Masking Coordinates: x=${x}, y=${y}`);
        console.log("Current Coordinates Array:", newCoordinates);
        return newCoordinates;
      });
    }
  };
  
  
  

  const handleMouseMove = _.throttle((e: any) => {
    // Handle mouse move logic here...
  }, 15);

  const flexCenterClasses = "flex items-center justify-center";
  return (
    <div className={`${flexCenterClasses} w-full h-full`} onClick={handleMouseClick}>
      <div className={`${flexCenterClasses} relative w-[90%] h-[90%]`}>
        <Tool handleMouseMove={handleMouseMove} />
      </div>
    </div>
  );
};

export default Stage;
