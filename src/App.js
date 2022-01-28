import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './ui-components/Home';
const fileOperations = window.electron.fileOperations;

function render() {
  ReactDOM.render(
    <Home />
/*     <BrowserRouter>
      <Routes>
        <Route path="/main_window" element={<Home></Home>}></Route>
      </Routes>
    </BrowserRouter> */
    , document.querySelector("#root"));
}

render();