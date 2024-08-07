import React, { useContext, useState } from 'react';
import { FaHome, FaInfoCircle, FaPlusSquare , FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText.js';
import { Language, UserContext } from '../../userInfo';
import { fetchAllProduct } from '../../service/product';
import { fetchAllCategory } from '../../service/category';
import ExportButton from '../ExportButton/exportButton';
import ChangeExportRuleButton from '../ChangeExportRuleButton/changeExportRuleButton';
import ImportButton from '../ImportButton/importButton';
import ChangeLanguageButton from '../ChangeLanguageButton/changeLanguageButton.js';
import LogoutButton from '../LogoutButton/logoutButton.js';

const Sidebar = () => {
  const { Language } = useContext(UserContext);
  const Text = {...multiLanguageText}[Language].sidebar;
  const [sidebarChoosed, setSidebarChoosed] = useState('')

  return (
    <div className="h-screen w-64 bg-gray-800 text-white">
      <div className="p-4">
        <h1 className="text-2xl font-bold">{Text.title}</h1>
        <div className='flex flex-row mt-4 text-black'>
          <ChangeLanguageButton/>
        </div>
      </div>
      <nav className="mt-6">
        <Link 
          to="" 
          className={`flex items-center px-4 py-2 hover:bg-gray-700 w-full ${sidebarChoosed==='home'?'bg-gray-600':''}`} 
          onClick={()=>{setSidebarChoosed('home')}}>
          <FaHome className='mr-2'/>
          {Text.home}
        </Link>
        <Link 
          to="addCategory" 
          className={`flex items-center px-4 py-2 hover:bg-gray-700 w-full ${sidebarChoosed==='addCategory'?'bg-gray-600':''}`} 
          onClick={()=>{setSidebarChoosed('addCategory')}}>
          <FaPlusSquare className='mr-2'/>
          {Text.addCategory}
        </Link>
        <Link 
          to="add/Product" 
          className={`flex items-center px-4 py-2 hover:bg-gray-700 w-full ${sidebarChoosed==='addProduct'?'bg-gray-600':''}`} 
          onClick={()=>{setSidebarChoosed('addProduct')}}>
          <FaPlusSquare className='mr-2'/>
          {Text.addProduct}
        </Link>
        <div className='flex flex-col items-center justify-center w-full mt-10'>
          <ExportButton/>
          <ImportButton/>
          <ChangeExportRuleButton/>
        </div>
      </nav>
      <div className='flex justify-center mt-28'>
        <LogoutButton/>
      </div>
    </div>
  );
}

export default Sidebar;