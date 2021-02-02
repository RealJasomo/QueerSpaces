import React, { Component } from 'react';
import {AppBar, Toolbar, IconButton, Typography, Button, Menu, MenuItem} from '@material-ui/core'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'
import MenuIcon from '@material-ui/icons/Menu'
import {Login, SignUp, firebase, usersRef, PostBox, PostContext} from './components'
import styles from './css/app.module.css'
import BlankProfile from './res/bp.png'

interface ApplicationState {
  loggedIn: boolean,
  profileMenuOpen: HTMLImageElement | null,
  user: firebase.User | null
}

class App extends Component<any, ApplicationState> {
  constructor(props: any){
    super(props);
    this.state = {
      loggedIn: false,
      profileMenuOpen: null,
      user: null
    }
    firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      if(user){
        const {uid, photoURL, phoneNumber, displayName, email, isAnonymous} = user;
        if(!isAnonymous)
        usersRef.doc(uid).set({
          photo: photoURL,
          phone: phoneNumber,
          name: displayName,
          email: email
        });
        this.setState({loggedIn: true, user: user});
      }else{
        this.setState({loggedIn: false, user: null});
      }
    })
  }
  handleSignout = () => {
    firebase.auth().signOut();
  }
  render () {
    return (
    <>
    <div id="page-content" className={styles.content}>
    <Router>
    <AppBar position="static" style={{backgroundColor: '#A42197'}}>
    <Toolbar>
      <IconButton edge="start" className={styles.menuButton} color="inherit" aria-label="menu">
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" className={`${styles.title} ${styles.link}`} component={Link} to="/">
        Queer Spaces
      </Typography>
      {!this.state.loggedIn ? 
        <Button color="inherit" className={styles.link} component={Link} to="/login">Login</Button> : 
        <>
          <img src={this.state.user?.photoURL|| BlankProfile} className = {styles.profileImage} alt="profile" onClick={(event) => this.setState({profileMenuOpen: event.currentTarget})}/> 
          <Menu
            id="profile-menu"
            style={{top: '40px'}}
            anchorEl={this.state.profileMenuOpen}
            keepMounted
            open={!!this.state.profileMenuOpen}
            onClose={() => this.setState({profileMenuOpen: null})}>
            <MenuItem>Profile</MenuItem>
            <MenuItem>My account</MenuItem>
            <MenuItem onClick={this.handleSignout}>Sign out</MenuItem>
          </Menu>
        </>}
    </Toolbar>
    </AppBar>
      <Switch>
          <Route exact path="/">
            <div>
              {this.state.user ? <><PostBox /><PostContext/></>: <p>Please login</p>}
            </div>
          </Route>
      </Switch>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
      </Switch>
      <Switch>
        <Route path="/signup">
          <SignUp />
        </Route>
      </Switch>
    </Router>
    </div>
    </>
  );
}
}
export default App;