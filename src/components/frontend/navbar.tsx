import React from 'react';
// import { cpucharger, usericon, weshoplogo } from '../../assets/Images';
// import { images } from '../../assets/Images'; 

const  cpucharger = "../../assets/Images/cpucharger.png"
const  usericon = "../../assets/Images/usericon.png"
const  weshoplogo = "../../assets/Images/weshoplogo.png"
const Navbar: React.FC = () => {
    
  return (
    <div className="border ">
      <nav className="flex justify-between items-center container mx-auto px-4  py-2">
        <div className="w-[200px]">
          <img src={weshoplogo}  alt="Logo" />
        </div>

        <div className="max-w-[350px] w-full flex justify-between items-center">
          <ul className="flex gap-3 items-center justify-around w-full">
            <li>Workspace</li>
            <li>Blog</li>
            <li>FAQs</li>
          </ul>
        </div>
        <div className="max-w-[350px] w-full flex justify-start gap-3 items-center">
          <div className="w-[250px] bg-[#faf9f9] flex justify-around items-center gap-1 py-2 rounded-3xl border-2 px-2">
            <div className="flex border-r-2 pr-3">
              <img src={cpucharger}  alt="cpucharger" className="w-5" />
              <p>400</p>
              <p>Points</p>
            </div>
            <div className="">Purchase</div>
          </div>

          <img src={usericon}  alt="usericon" />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
