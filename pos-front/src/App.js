// import logo from './logo.svg';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import AddProduct from './components/PageAddProduct/productForm';
import Home from './components/Home/home';
import Sidebar from './components/Sidebar/sidebar';

function App() {
  return (
    <Router>
      <div className='flex bg-slate-200 w-full'>
        <Sidebar/>
        <div className='w-4/5'>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/addProduct' element={<AddProduct/>}/>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
