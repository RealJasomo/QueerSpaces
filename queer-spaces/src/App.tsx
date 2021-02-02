import React, { Component } from 'react';
import {AppBar, Toolbar, IconButton, Typography, Button} from '@material-ui/core'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'
import MenuIcon from '@material-ui/icons/Menu'
import {Login, SignUp, firebase, PostBox, PostContext} from './components'
import styles from './css/app.module.css'

interface ApplicationState {
  loggedIn: boolean,
  user: firebase.User | null
}

class App extends Component<any, ApplicationState> {
  constructor(props: any){
    super(props);
    this.state = {
      loggedIn: false,
      user: null
    }
    firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      if(user){
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
      {!this.state.loggedIn ? <Button color="inherit" className={styles.link} component={Link} to="/login">Login</Button> : <Button color="inherit" onClick={this.handleSignout}>Sign out</Button>}
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
