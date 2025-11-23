import React, { useState } from 'react';
import { Settings, FileText, Activity, Users, Truck, Wrench, ChevronDown,PlusCircle, AlertOctagon } from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = ({ onNewEmergency }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  return (
    <nav className="navbar">
      <ul className="nav-list">
        
        {/* 1. Menú Configuración (Con Dropdown) */}
        <li 
          className="nav-item dropdown-wrapper"
          onMouseEnter={() => setActiveDropdown('config')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <button className={`nav-link ${activeDropdown === 'config' ? 'active' : ''}`}>
            <Settings size={18} />
            <span>Configuración</span>
            <ChevronDown size={14} className={`chevron ${activeDropdown === 'config' ? 'rotate' : ''}`} />
          </button>
          
          {/* Submenú Flotante */}
          <div className={`dropdown-menu ${activeDropdown === 'config' ? 'show' : ''}`}>
            <a href="#" className="dropdown-item">
              <Truck size={16} /> EPR (Unidades)
            </a>
             <a href="#" className="dropdown-item">
              <Truck size={16} /> Ambulancia (Unidades)
            </a>
            <a href="#" className="dropdown-item">
              <Users size={16} /> Usuarios
            </a>
            <a href="#" className="dropdown-item">
              <Wrench size={16} /> Herramientas
            </a>
          </div>
        </li>

        {/* 2. Menú Reportes */}
        <li className="nav-item">
          <a href="#" className="nav-link">
            <FileText size={18} />
            <span>Reportes</span>
          </a>
        </li>

        {/* 3. Menú Situación Actual */}
        <li className="nav-item">
          <a href="#" className="nav-link active-link"> {/* Clase active-link para simular estar en esta vista */}
            <Activity size={18} />
            <span>Situación Actual</span>
          </a>
        </li>


        {/* SEPARADOR VERTICAL */}
        <div className="nav-separator"></div>

        {/* 4. BOTÓN NUEVA EMERGENCIA (DESTACADO) */}
        <li className="nav-item">
          <button className="nav-btn-emergency" onClick={onNewEmergency}>
            <AlertOctagon size={20} strokeWidth={2.5} />
            <span>NUEVA EMERGENCIA</span>
          </button>
        </li>


      </ul>
    </nav>
  );
};

export default Navbar;