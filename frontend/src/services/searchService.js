import axios from 'axios';

export default {
  getSearchQueryResults: searchQuery => {
    return axios.get(`http://localhost:5000/search/${searchQuery}`)
      .then(response => {
        return response.data;
      })
  }
}