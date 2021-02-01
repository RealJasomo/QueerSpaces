import React, { Component } from 'react';
import {AppBar, Toolbar, IconButton, Typography, Button, makeStyles} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import {PostBox} from './components'
import styles from './css/app.module.css'

class App extends Component {
 
  render () {
    return (
    <>
    <AppBar position="static" style={{backgroundColor: '#A42197'}}>
    <Toolbar>
      <IconButton edge="start" className={styles.menuButton} color="inherit" aria-label="menu">
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" className={styles.title}>
        Queer Spaces
      </Typography>
      <Button color="inherit">Login</Button>
    </Toolbar>
    </AppBar>
    <PostBox />
    </>
  );
}
}
export default App;
