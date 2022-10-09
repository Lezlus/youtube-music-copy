import axios from 'axios';

const axiosCookieConfig = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:5000"
});

export default {
  login: user => {
    return axiosCookieConfig.post("/user/login", user)
      .then(response => response.data)
      .catch(err => {
        console.log(err);
      })
  },
  register: user => {
    return axios.post("/user/register", user)
    .then(response => response.data)
    .catch(err => {
      console.log(err);
    });
  },
  logout: () => {
    return axiosCookieConfig.get('/user/logout')
      .then(response => response.data)
      .catch(err => {
        console.log(err);
      })
  },
  isAuthenticated: () => {
    return axiosCookieConfig.get("/user/authenticated/")
      .then(response => {
        console.log(response.status)
        if (response.status !== 401) {
          return response.data;
        } else {
          return {isAuthenticated: false, user: {username: ""}};
        }
      })
      .catch(err => {
        console.log(err);
        return {isAuthenticated: false, user: {username: ""}};
      });
  }
}