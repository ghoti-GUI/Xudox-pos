
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

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
    // 'time_supply':0,
    'product_type':0,
    'cid':1,
  })

  const fetchNextIdUser = async () => {
    try {
      const response = await axios.get(DefaultUrl+'get/product/next_id_user/');
      const nextIdUser = response.data.next_id_user;
      setProductData(prevState => ({
        ...prevState,
        'id_user': nextIdUser,
      }));
    } catch (error) {
      console.error('Error fetching next product id:', error);
    };
  };
  
  const init = useCallback(()=>{
    const initData = Object.keys(productdata).reduce((acc,key)=>{
      acc[key] = typeof productdata[key] === 'number' ? 0 : '';
      return acc;
    }, {});
    setProductData(initData)
    fetchNextIdUser();
  }, []);

  useEffect(() => {
    init();
  },[init]);
  

  const handleChange = (key, value) => {
    setProductData({
      ...productdata,
      [key]: value,
    });
    // console.log(key+':'+value);
    console.log(productdata);
  };

  const DefaultUrl = 'http://localhost:8000/api/posback/'

  const getCsrfToken = () => {
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken'))
      ?.split('=')[1];
    return csrfToken || window.CSRF_TOKEN;
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

    axios.post(DefaultUrl+'post/product/', productdata, {
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
    'cid':'Category'
  }

  const numericFields = ['id_user', 'price', 'price2', 'TVA', 'product_type', 'cid', 'time_supply']
  const requiredFields = ['id_user', 'price', 'price2', 'TVA_country', 'TVA']
  const [categoryData, setCategoryData] = useState({});
  useEffect(()=>{
    const fetchCategory = async () => {
      try {
        const response = await axios.get(DefaultUrl+'get/category/');
        const categoryData = response.data;
        setCategoryData(categoryData); 
      } catch (error){
        console.error('Error fetching category data:', error)
      }
    }
    fetchCategory()
  },[]);

  const selectFields = {
    'product_type':{
      'Product':0,
      'Option':1,
    },
    'cid': categoryData, 
  }

  // const [timeSupply, setTimeSupply] = useState({
  //   'breakfirst': true,
  //   'lunch': true,
  //   'dinner': true,
  // })
  
  // const checkboxFields = {
  //   'time_supply': timeSupply,
  //   'print_to_where':{},
  // }

  // const handleChangeTimeSupply = (event) => {
  //   const { name, checked } = event.target;
  //   setTimeSupply((prevTimeSupply) => ({
  //     ...prevTimeSupply,
  //     [name]:checked,
  //   }));

  //   let TimeSuppleId = '';
  //   if (timeSupply.breakfirst) TimeSuppleId += '1';
  //   if (timeSupply.lunch) TimeSuppleId += '2';
  //   if (timeSupply.dinner) TimeSuppleId += '3';
  //   console.log("TimeSuppleId: ", TimeSuppleId)
  //   handleChange('time_supply', parseInt(TimeSuppleId));

  // }
  


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
          <div className="flex flex-row justify-center mt-1 mx-3">
            <label className="flex bg-white rounded py-2 pl-6 border-r border-borderTable w-1/4 rounded-l-lg">
                {Text_for_data[key]}:
            </label>
            {selectFields.hasOwnProperty(key) ? (
              <select 
                value={productdata[key]} 
                onChange={(e) => handleChange(key, e.target.value)}
                className="flex w-3/4 px-2 rounded-r-lg">
                {Object.entries(selectFields[key]).map(([optionKey, optionValue])=>(
                  <option key={optionKey} value={optionValue}>{optionKey}</option>
                ))}
              </select>
            ):(
              <input 
                type={numericFields.includes(key) ? 'number':'text'} name={key} 
                className="flex px-2 w-3/4 rounded-r-lg" 
                value={productdata[key]} 
                onChange={(e) => handleChange(key, e.target.value)}
                required={requiredFields.includes(key)}/>
            )}
          </div>
          {/* {key === 'time_supply' && (
            <>
              {Object.entries(timeSupply).map(([key,checked]) => (
                <div key={key}>
                  <h2>Checkbox Options:</h2>
                  <label>
                      <input
                          type="checkbox"
                          name={key}
                          checked={checked}
                          onChange={handleChangeTimeSupply}
                      />
                      {key}
                  </label>
                </div>
              ))}
            </>
          )} */}

        </div>
      ))}

      <button type="submit" className="rounded bg-blue-500 text-white px-3 my-3">Submit</button>
    </form>
  );
}

export default ProductForm;
