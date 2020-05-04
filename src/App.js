import React, { Component } from 'react';
import LogIn from './components/LogIn/LogIn.js'
import Register from './components/Register/Register.js'
import CreateUrl from './components/CreateUrl/CreateUrl.js'
import ExistingUrlContainer from './components/ExistingUrl/ExistingUrlContainer/ExistingUrlContainer.js'
import Footer from './components/Footer/Footer.js'
import axios from 'axios'
import md5 from 'md5'
import './App.css';

class App extends Component {
  constructor() {
    super()
    this.state = {
      loggedIn: false,
      username: 'anon',
      userid: '1',
      registered: true,
      createdAnon: false,
      anonUrlSubmit: '',
      anonUrlReturn: [],
      urls: []
    }
    this.setLogIn = this.setLogIn.bind(this)
    this.setRegistered = this.setRegistered.bind(this)
    this.setUser = this.setUser.bind(this)
    this.getAllUrls = this.getAllUrls.bind(this)
    this.submitAnon = this.submitAnon.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.hashUrl = this.hashUrl.bind(this)
    this.getRedirect = this.getRedirect.bind(this)
  }

  setLogIn() {
    this.setState({loggedIn: !this.state.loggedIn})
  }

  setRegistered() {
    this.setState({registered: !this.state.registered})
  }

  setUser(username, userid) {
    this.setState({username: username, userid: userid})
  }

  getRedirect() {
    console.log(window.location.hash)
    const noHash = window.location.hash.substring(1)
    console.log(noHash)
    axios.get(`/${noHash}`)
      .then((results) => {
        window.location.assign("//" + results.data[0].originalurl)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  getAllUrls() {
    axios.get(`/getallurls/${this.state.userid}`)
      .then((response) => {
        this.setState({urls: response.data.reverse()})
      })
      .catch((err) => {
        console.error(err)
      })
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value})
  }

  hashUrl(url) {
    var hashed = md5(url)
    return hashed
  }

  async submitAnon() {
    var hashed = await this.hashUrl(this.state.anonUrlSubmit)
    axios.post('/', {
      owner: this.state.userid,
      originalurl: this.state.anonUrlSubmit,
      shorturl: hashed
    })
      .then((response) => {
        this.setState({anonUrlReturn: response.data[0]})
        console.log(this.state.anonUrlReturn)
      })
  }

  componentDidMount() {
    if (window.location.hash !== '') {
      this.getRedirect()
    } else {
      this.getAllUrls()
    }
  }

  render() {
    let content;
    if (this.state.loggedIn === true) {
      content =
        <div className="logged-in-content">
          <div className="header">
            <LogIn setLogIn={this.setLogIn} loggedIn={this.state.loggedIn} setUser={this.setUser} getAllUrls={this.getAllUrls} activeUserName={this.state.username}/>
          </div>
          <CreateUrl getAllUrls={this.getAllUrls} username={this.state.username} userid={this.state.userid}/>
          <h1>{this.state.username}'s urls:</h1>
          <ExistingUrlContainer urls={this.state.urls}/>
        </div>
    } else if (this.state.loggedIn === false) {
      let anonUrl
      if (this.state.anonUrlReturn.length !== 0) {
        anonUrl = 
        <div>
          <p>you wont have access to this URL if you make another or navigate away. Make sure to copy it now!</p>
          <p>original url: {this.state.anonUrlReturn.originalurl}</p>
          <p>your short url: <strong>localhost:3000/#{this.state.anonUrlReturn.id}</strong></p>
          <button onClick={() => navigator.clipboard.writeText(`localhost:3000/#${this.state.anonUrlReturn.id}`)}>copy to clipboard</button>
        </div>
      }
      content =
        <div className="logged-out-content">
          <div className="header">
            <div className="header-logo">
              <p>OOG.LA</p>
            </div>
            <div className="header-login-register">
              <Register setRegistered={this.setRegistered} registered={this.state.registered} setLogIn={this.setLogIn} setUser={this.setUser}/>
              <LogIn setLogIn={this.setLogIn} loggedIn={this.state.loggedIn} setUser={this.setUser} getAllUrls={this.getAllUrls} activeUserName={this.state.username}/>
            </div>
          </div>
          <p>a no frills URL shortener. Takes any URL and creates a reusable, much shorter redirect</p>
          <p>try it out!</p>
          <input name="anonUrlSubmit" className="long-input" type="text" placeholder="paste your url here" value={this.state.anonUrlSubmit} onChange={this.handleChange}/>
          <button onClick={this.submitAnon}>shorten</button>
          {anonUrl}
        </div>
    }

    return (
      <div className="App">
        {content}
        <Footer />
      </div>
    );
  }
}

export default App;
