import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Login from './Pages/Login';
import LandingPage from './Pages/LandingPage';
import Register from './Pages/Register';
import './App.css';
import MovieDetail from './Pages/MovieDetail';
import TvShow from './Pages/TvShow';
import SeriesDetail from './Pages/SeriesDetail';
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/moviedetail" element={<MovieDetail />} />
        <Route path="/tvshow" element={<TvShow />} />
        <Route path="/seriesdetail" element={<SeriesDetail />} />


      </Routes>
    </BrowserRouter>



  );
}

export default App;
