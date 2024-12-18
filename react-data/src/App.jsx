import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes para las páginas
import Bank from './components/Bank/Bank';
import Tickets from './components/Tickets/Tickets';
import Propiedades from './components/Propiedades/Propiedades';
import Home from './components/Home/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bank" element={<Bank />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/propiedades" element={<Propiedades />} />
      </Routes>
    </Router>
  );
}

export default App;