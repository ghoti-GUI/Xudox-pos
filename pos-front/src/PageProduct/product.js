
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { DefaultUrl } from './valueDefault';
import { fetchNextIdUser, getCsrfToken, fetchCategory, fetchPrinter } from './service';
import { sortStringOfNumber } from './utils';

function ProductForm() {
  const [productdata, setProductData] = useState({
    'id_user':0,
    'ename':'',
    'lname':'',
    'fname':'',
    'zname':'',
    'edes':'',
    'ldes':'',
    'fdes':'',
    'price':0,
    'price2':0,
    'TVA_country':'',
    'TVA':0,
    'time_supply':123,
    'product_type':0,
    'cid':1,
    'print_to_where':1,
  })

  const initData = productdata;
  
  const init = useCallback(()=>{
    setProductData(initData)
    setTimeSupply({
      'breakfirst': true,
      'lunch': true,
      'dinner': true,
    })
    fetchNextIdUser(setProductData);
    // eslint-disable-next-line
  }, []);

  const [printerData, setPrinterData] = useState([])
  useEffect(() => {
    init();
    fetchCategory(setCategoryData);
    fetchPrinter(setPrinterData);
  },[init]);
  

  const handleChange = (key, value) => {
    setProductData({
      ...productdata,
      [key]: value,
    });
    // console.log(key+':'+value);
    console.log(productdata);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const csrfToken = getCsrfToken();

    const nameField = ['ename', 'lname', 'fname', 'zname'];
    const desField = ['edes', 'ldes', 'fdes'];
    const AtLeastOneName = nameField.some((key)=>productdata[key].trim() !== '');
    const AtLeastOneDes = desField.some((key)=>productdata[key].trim() !== '');

    if (!AtLeastOneName){
      event.preventDefault();
      alert('Please fill in at least one of the name inputs.');
      return;
    }else if(!AtLeastOneDes){
      event.preventDefault();
      alert('Please fill in at least one of the description inputs.');
      return;
    }

    axios.post(DefaultUrl+'post/product/', 
      productdata, 
      // {
      //   // 'id_user':productdata.id_user,
      //   // 'price':productdata.price,
      //   // 'price2':productdata.price2,
      //   // 'TVA':productdata.TVA,
      //   // 'product_type':productdata.product_type,
      //   // 'time_supply':productdata.time_supply, 
      //   // 'cid':productdata.cid,
      // },
      {
      headers: {
          'X-CSRFToken': csrfToken
      }
    })
    .then(response => {
        console.log(response.data);
        init();
    })
    .catch(error => {
        console.error('There was an error submitting the form!', error);
    });
  };

  const Text_for_data = {
    'id_user':'ID',
    'ename':'English name',
    'lname':'Dutch name',
    'fname':'Franch name',
    'zname':'Chinese name',
    'edes':'English description',
    'ldes':'Dutch description',
    'fdes':'Franch description',
    'price':'Price',
    'price2':'Price for takeaways',
    'TVA_country':'Country',
    'TVA':'TVA',
    'product_type':'Type: product/option',
    'cid':'Category',
    'time_supply':'Supply time',
    'print_to_where':'Printers selected', 
  }

  const numericFields = ['id_user', 'price', 'price2', 'TVA'];
  const stringFields = ['ename','lname','fname','zname','edes','ldes','fdes','TVA_country'];
  const inputField = numericFields.concat(stringFields);

  const requiredFields = ['id_user', 'price', 'price2', 'TVA_country', 'TVA'];

  const [categoryData, setCategoryData] = useState({});
  const selectFields = {
    'product_type':{
      'Product':0,
      'Option':1,
    },
    'cid': categoryData, 
  }

  const [timeSupply, setTimeSupply] = useState({
    'breakfirst': true,
    'lunch': true,
    'dinner': true,
  })

  const handleChangeTimeSupply = (event) => {
    const { name, checked } = event.target;
    let timeSupplyCopy = timeSupply
    timeSupplyCopy[name] = checked;
    let TimeSupplyId = '';
    if (timeSupplyCopy.breakfirst) TimeSupplyId += '1';
    if (timeSupplyCopy.lunch) TimeSupplyId += '2';
    if (timeSupplyCopy.dinner) TimeSupplyId += '3';
    setTimeSupply(timeSupplyCopy);
    console.log("TimeSuppleId: ", TimeSupplyId)
    handleChange('time_supply', parseInt(TimeSupplyId));
  }

  const handleChangePrinter = (e) =>{
    const printerIdChanged = e.target.name;
    let printerId = '0';
    const printerDataCopy = printerData.map((printer)=>{
      if(printer.id===printerIdChanged){
        if(printer.checked===false) printerId += printer.id;
        return {...printer, 'checked':!printer.checked};
      }else if(printer.checked===true){
        printerId += printer.id
      }
      return printer;
    })
    setPrinterData(printerDataCopy);
    handleChange('print_to_where', parseInt(sortStringOfNumber(printerId)));
  }


  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-4/5">
      {Object.keys(productdata).map((key)=>(
        <div key={key}>
          {key === 'ename' && (
            <div className="justify-center mt-2 mx-4">Fill in at least one of the following name inputs</div>
          )}
          {key === 'edes' && (
            <div className="justify-center mt-2 mx-4">Fill in at least one of the following description inputs</div>
          )}
          <div className="flex flex-row justify-center mt-1 mx-3 w-full">
            {key !== 'print_to_where' && (
              <label className="flex bg-white py-2 pl-6 border-r border-borderTable w-1/4 rounded-l-lg">
                  {Text_for_data[key]} :
              </label>
            )}

            {inputField.includes(key) && 
              <input 
              type={numericFields.includes(key) ? 'number':'text'} name={key} 
              className="flex px-2 w-3/4 rounded-r-lg" 
              value={productdata[key]} 
              onChange={(e) => handleChange(key, e.target.value)}
              required={requiredFields.includes(key)}/>
            }
              
            {selectFields.hasOwnProperty(key) && 
              <select 
                value={productdata[key]} 
                onChange={(e) => handleChange(key, e.target.value)}
                className="flex w-3/4 px-2 rounded-r-lg">
                {Object.entries(selectFields[key]).map(([optionKey, optionValue])=>(
                  <option key={optionKey} value={optionValue}>{optionKey}</option>
                ))}
              </select>
            }

            {key === 'time_supply' && (
              <div className='grid grid-cols-3 w-3/4'>
                {Object.entries(timeSupply).map(([name,checked]) => (
                  <div key={name} className={`bg-white py-2 pl-6 border-r border-borderTable ${name==='dinner'?'rounded-r-lg':''}`}>
                    <label className='flex'>
                        <input
                            type="checkbox"
                            name={name}
                            checked={checked}
                            className='mr-2'
                            onChange={(e) => handleChangeTimeSupply(e)}
                        />
                        {name}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {key === 'print_to_where' && (
              <div className='w-full'>
                <label className="flex justify-center bg-white py-2 pl-6 border-r border-borderTable w-full rounded-t-lg">
                  {Text_for_data[key]} :
                </label>
                <div className='grid grid-cols-4 w-full'>
                  {printerData.map((printer)=>(
                    <div key={printer.id} className={`bg-white py-2 pl-6 border border-borderTable`}>
                      <label className='flex'>
                          <input
                              type="checkbox"
                              name={printer.id}
                              checked={printer.checked}
                              className='mr-2'
                              onChange={(e) => handleChangePrinter(e)}
                          />
                          {printer.id+':'+printer.printer}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      ))}

      <button type="submit" className="rounded bg-blue-500 text-white py-1 ml-3 my-5 w-full">Submit</button>
    </form>
  );
}

export default ProductForm;
