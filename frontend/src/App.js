import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import Layout from './components/Layout/Layout';

import WebsiteDown from './pages/WebsiteDown';

import AboutUs from './pages/AboutUs';


function App() {
  return (
    <Layout>
        <Routes>
            <Route path='*' element={<WebsiteDown />} />
            {/* <Route path='/' element={<Home />} />
            <Route path='/aboutus' element={<AboutUs />} /> */}
        </Routes>
    </Layout>

  );
}

export default App;
