import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import axios from 'axios'
import MyProvider from './provider/myProvider';

axios.defaults.baseURL = "http://localhost:5000";

ReactDOM.render(
  <MyProvider><App /></MyProvider>,
  document.getElementById('root')
);
