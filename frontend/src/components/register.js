import React, {useState, useContext, Component} from "react";
import AuthService from '../services/authService';
import MyContext from "../context/authContext";

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {username: "", password: ""},
    }
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(e) {
    this.setState({
      user: {...this.state.user, [e.target.name] : e.target.value}
    });
    console.log(this.state.user);
  }

  onSubmit(e) {
    console.log("Clicked register")
    e.preventDefault();
    AuthService.register(this.state.user)
      .then(data => {
        this.props.history.push('/login');
      });
  }
  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <h3>Please register</h3>
          <label htmlFor="username" className="sr-only">Username: </label>
          <input type="text" name="username" onChange={this.onChange} 
                className="form-control" placeholder="Enter Username"/>
          <label htmlFor="password" className="sr-only">Password: </label>
          <input type="password" name="password" onChange={this.onChange} 
                className="form-control" placeholder="Enter Password"/>
          <button className="btn btn-lg btn-primary btn-block" type="submit">Register</button> 
        </form> 
      </div>
    )
  }
}

export default Register;