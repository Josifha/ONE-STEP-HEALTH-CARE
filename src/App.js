import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './components/Login/Login';
import Otp from './components/Otp/Otp';
import Student from './components/Student/Student';
import Organization from './components/Organization/Organization';

function App() {
  return (
    <div className="wrapper">
      <Router>
          <Routes>
            <Route exact path="/" element={<Login/>}/>
          </Routes>
          <Routes>
            <Route exact path="/otp" element={<Otp/>}/>
          </Routes>
          <Routes>
            <Route exact path="/student" element={<Student/>}/>
          </Routes>
          <Routes>
            <Route exact path="/organization" element={<Organization/>}/>
          </Routes>
      </Router>
    </div>
  );
}

export default App;