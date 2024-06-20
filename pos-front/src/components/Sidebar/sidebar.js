import React from 'react';
import { FaHome, FaInfoCircle, FaServicestack, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-gray-800 text-white">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Sidebar</h1>
      </div>
      <nav className="mt-10">
        <ul>
          <li className="flex items-center px-4 py-2 hover:bg-gray-700">
            <FaHome />
            <Link to="/" className="ml-2">Home</Link>
          </li>
          <li className="flex items-center px-4 py-2 hover:bg-gray-700">
            <FaInfoCircle />
            <Link to="/addProduct" className="ml-2">AddProduct</Link>
          </li>
          {/* <li className="flex items-center px-4 py-2 hover:bg-gray-700">
            <FaServicestack />
            <Link to="/services" className="ml-2">Services</Link>
          </li>
          <li className="flex items-center px-4 py-2 hover:bg-gray-700">
            <FaEnvelope />
            <Link to="/contact" className="ml-2">Contact</Link>
          </li> */}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;