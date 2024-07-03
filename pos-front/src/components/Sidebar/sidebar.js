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
        
        <Link to="/" className="flex items-center px-4 py-2 hover:bg-gray-700 w-full" >
          <FaHome className='mr-2'/>
          Home
        </Link>
        <Link to="/addCategory" className="flex items-center px-4 py-2 hover:bg-gray-700 w-full" >
          <FaInfoCircle className='mr-2'/>
          AddCategory
        </Link>
        <Link to="/addProduct" className="flex items-center px-4 py-2 hover:bg-gray-700 w-full" >
          <FaInfoCircle className='mr-2'/>
          AddProduct
        </Link>
        {/* <Link to="/TestDrag" className="flex items-center px-4 py-2 hover:bg-gray-700 w-full" >
          <FaInfoCircle className='mr-2'/>
          TestDrag
        </Link> */}

      </nav>
    </div>
  );
}

export default Sidebar;