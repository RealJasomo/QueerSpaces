import React, { Component } from 'react';
import {AppBar, Toolbar, IconButton, Typography, Button, Menu, MenuItem, Drawer, List, ListItem, ListItemIcon, ListItemText} from '@material-ui/core'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'
import MenuIcon from '@material-ui/icons/Menu'
import {Login, SignUp, Profile, Account, firebase, usersRef, PostBox, PostContext, ProtectedRoute, FirebaseAuthContext, Profiles, Comments} from './components'

import styles from './css/app.module.css'
import BlankProfile from './res/bp.png'
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'

interface ApplicationState {
  loggedIn: boolean,
  profileMenuOpen: HTMLImageElement | null,
  user: firebase.User | null,
  photoURL: string | null,
  openDrawer: boolean
}

class App extends Component<any, ApplicationState> {
  constructor(props: any){
    super(props);
    this.state = {
      loggedIn: false,
      profileMenuOpen: null,
      user: null,
      photoURL: null,
      openDrawer: false
    }
    firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      if(user){
        const {uid, photoURL, phoneNumber, displayName, email, isAnonymous} = user;
        if(!isAnonymous){
        var ref = usersRef.doc(uid);
        ref.get().then((snapshot) =>{
          if(snapshot.exists){
            ref.set({
              photo: photoURL || snapshot.get('photo')
            },{merge: true}).then(()=>this.setState({photoURL: snapshot.get('photo')}));
          }else{
            ref.set({
              photo: photoURL,
              phone: phoneNumber,
              name: displayName,
              email: email
            });
          }
        })
      }
        // .set({
        //   photo: photoURL,
        //   phone: phoneNumber,
        //   name: displayName,
        //   email: email
        // }, {merge: true});
        this.setState({loggedIn: true, user: user});
      }else{
        this.setState({loggedIn: false, user: null});
      }
    })
  }
  handleSignout = () => {
    firebase.auth().signOut();
  }

  toggleDrawer = (toggle: boolean) => () => {
    this.setState({openDrawer: toggle});
  }
  render () {
    return (
    <>
    <FirebaseAuthContext>
    <div id="page-content" className={styles.content}>
    <Router>
    <AppBar position="static" style={{backgroundColor: '#A42197'}}>
    <Toolbar>
      <IconButton edge="start" className={styles.menuButton} color="inherit" aria-label="menu" onClick={this.toggleDrawer(true)}>
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" className={`${styles.title} ${styles.link}`} component={Link} to="/">
        Queer Spaces
      </Typography>
      {!this.state.loggedIn ? 
        <Button color="inherit" className={styles.link} component={Link} to="/login">Login</Button> : 
        <>
          <img src={this.state.photoURL || BlankProfile} className = {styles.profileImage} alt="profile" onClick={(event) => this.setState({profileMenuOpen: event.currentTarget})}/> 
          <Menu
            id="profile-menu"
            style={{top: '40px'}}
            anchorEl={this.state.profileMenuOpen}
            keepMounted
            open={!!this.state.profileMenuOpen}
            onClose={() => this.setState({profileMenuOpen: null})}>
            <MenuItem component={Link} to={`/profile/${this.state.user?.uid||''}`} onClick={()=>this.setState({profileMenuOpen: null})}>Profile</MenuItem>
            <MenuItem component={Link} to="/account" className={styles.link} onClick={()=>this.setState({profileMenuOpen: null})}>My account</MenuItem>
            <MenuItem onClick={this.handleSignout}>Sign out</MenuItem>
          </Menu>
        </>}
    </Toolbar>
    </AppBar>
    <Drawer open={this.state.openDrawer} onClose={this.toggleDrawer(false)}>
                    <div
                      tabIndex={0}
                      role="button"
                      onClick={this.toggleDrawer(false)}
                      onKeyDown={this.toggleDrawer(false)}
                    >
                       <List>
                          <Link to="/profiles" className={styles.link}>
                              <ListItem>     
                                <ListItemIcon>
                                <SupervisorAccountIcon/>
                            </ListItemIcon>
                              <ListItemText primary="&nbsp;&nbsp;&nbsp;Profiles"/>
                            </ListItem>
                          </Link>
                      </List>
                    </div>
                    </Drawer>
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
      <Switch>
          <ProtectedRoute path="/account" to="/" children={<Account/>} />
      </Switch>
      <Switch>
        <Route path="/profile/:id" component={Profile}/>
      </Switch>
      <Switch>
        <Route path="/profiles" component={Profiles} />
      </Switch>
      <Switch>
        <Route path="/comments/:id" component={Comments} />
      </Switch>
    </Router>
    </div>
    </FirebaseAuthContext>
    </>
  );
}
}
export default App;
