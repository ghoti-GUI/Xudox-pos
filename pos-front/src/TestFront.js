// src/BookForm.js
import React, { useState } from 'react';
import axios from 'axios';

function TestForm() {
//   const [name, setName] = useState('');
//   const [des, setDes] = useState('');
  const [testdata, setTestData] = useState({
    'name':'',
    'des':'',
  })

  const getCsrfToken = () => {
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken'))
      ?.split('=')[1];
    return csrfToken || window.CSRF_TOKEN;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setTestData(prevState => ({
        ...prevState,
        [name]: value,
    }));
  }


  const handleSubmit = (event) => {
    event.preventDefault();
    const csrfToken = getCsrfToken();

    axios.post('http://localhost:8000/api/TestModel/', { 'name': testdata.name, 'des': testdata.des },{
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => {
        console.log(response.data);
        // setName('');
        // setDes('');
        setTestData({
            'name':'',
            'des':'',
        })
    })
    .catch(error => {
        console.error('There was an error submitting the form!', error);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        test name:
        <input
          type="text" name='name'
          value={testdata.name}
          onChange={handleChange}
        />
      </label>
      <label>
        test description:
        <input
          type="text" name='des'
          value={testdata.des}
          onChange={handleChange}
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}

export default TestForm;
