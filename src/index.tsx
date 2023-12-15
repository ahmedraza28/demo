// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// import * as React from "react";
// import { createRoot } from "react-dom/client";
// import AppContextProvider from "./components/hooks/context";
// import App from "./App";
// const container = document.getElementById("root");
// const root = createRoot(container!);
// root.render(
//   <AppContextProvider>
//     <App/>
//   </AppContextProvider>
// );

import * as React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppContextProvider from "./components/hooks/context";
import App from "./App";
import Edit from "./Edit";


const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <BrowserRouter>
    <AppContextProvider>
    <Routes>
          <Route path="/" element={<App />} />
          <Route path="/Edit" element={<Edit />} />
        </Routes>
    </AppContextProvider>
  </BrowserRouter>
);
