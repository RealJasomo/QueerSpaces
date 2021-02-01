import React, { Component } from 'react';
import {AppBar, Toolbar, IconButton, Typography, Button} from '@material-ui/core'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'
import MenuIcon from '@material-ui/icons/Menu'
import {Login} from './components'
import styles from './css/app.module.css'

class App extends Component {
 
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
      <Button color="inherit" className={styles.link} component={Link} to="/login">Login</Button>
    </Toolbar>
    </AppBar>
      <Switch>
          <Route exact path="/">
            <div>
              <h1>Homepage</h1>
            </div>
          </Route>
      </Switch>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
      </Switch>
    </Router>
    </div>
    </>
  );
}
}
export default App;
