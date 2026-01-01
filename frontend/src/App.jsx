import { useState } from 'react'
import "./globals.css";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './components/home/Home';
import { Services } from './components/service/Services';
import { About } from './components/about/About';
import { Feedback } from './components/feedback/Feedback';
import { Professionals } from './components/professionals/Professionals';
import { Profile } from './components/profile/Profile';
import RegisterProfessional from './components/professionalRegister/RegisterProfessional';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() { 

  return (
    <BrowserRouter>
       <Routes>
              <Route path='/' element={<ProtectedRoute><Layout /></ProtectedRoute>} >
                <Route index element={<Home />} />  
                <Route path='services' element={<Services />} />
                <Route path='about' element={<About />} />
                <Route path='feedback' element={<Feedback />} />
                <Route path='professionals' element={<Professionals />} />
                <Route path='become-pro' element={<RegisterProfessional />} />
            </Route> 
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
 