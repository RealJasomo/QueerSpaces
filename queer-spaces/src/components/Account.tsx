import React, { Component } from 'react'
import { Modal, Button, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton } from '@material-ui/core'
import { firebase, usersRef, usernameRef } from './'

import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import styles from '../css/account.module.css'
import { isFunctionDeclaration } from 'typescript'

interface IState{
    openPassword: boolean,
    newPassword: string,
    oldPassword: string,
    confirmPassword: string,
    showNewPassword: boolean,
    showConfirmPassword: boolean,
    showOldPassword: boolean,
    error: string,
    user: firebase.User | null,
    username: string | null,
    newUsername: string,
    openUsername: boolean
}
type AccountState<T> = {
    [K in keyof T]: T[K]
}
export default class Account extends Component<{}, AccountState<IState>> {
    constructor(props: {}){
        super(props);
        this.state = {
            openPassword: false,
            newPassword: '',
            oldPassword: '',
            confirmPassword: '',
            showNewPassword: false,
            showConfirmPassword: false,
            showOldPassword: false,
            error: '',
            user: firebase.auth().currentUser,
            username: null,
            newUsername: '',
            openUsername: false
        }
        this.grabUserName();
    }
    grabUserName = () => {
        usernameRef.where('uid','==', this.state.user?.uid).get()
        .then((snap) => {
            if(snap.size > 0)
                snap.forEach((doc) => {
                    this.setState({username: `@${doc.id}`})
                });
        })
    }
    handlePasswordModalClose = () => this.setState({openPassword: false});
    
    handleUsernameModalClose = () => this.setState({openUsername: false});
    
    handleUpdatePassword = () => {
        var credential: firebase.auth.AuthCredential = firebase.auth.EmailAuthProvider.credential(this.state.user?.email||"",this.state.oldPassword);
        this.state.user?.reauthenticateWithCredential(credential).then(_ => {
            this.state.user?.updatePassword(this.state.newPassword)
            .then(_ => this.setState({newPassword: "", confirmPassword: "", oldPassword:""}))
            .catch(err => {
                this.setState({error: "Unable to update password"});
                console.log(err);
            });
        }).catch(err => this.setState({error: "Invalid original password"}))
        .finally(this.handlePasswordModalClose);
    }

    handleUpdateUsername = () => {
        if(this.state.newUsername.length < 3){
            this.setState({error: "Username must be atleast 3 characters long"});
            return;
        }
        var ref: firebase.firestore.DocumentReference<firebase.firestore.DocumentData> = usernameRef.doc(this.state.newUsername);
        var batch = firebase.firestore().batch();
        batch.set(ref, {
            uid: this.state.user?.uid
        })
        if(this.state.username)
        batch.delete(usernameRef.doc(this.state.username.substr(1)))

        batch.commit()
        .then(()=>{
            this.grabUserName();
            this.handleUsernameModalClose();
        })
        .catch(err => {
            console.log(err);
            this.setState({error: "Error in updating username"});
        });
        
    };
    
    handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>)  => event.preventDefault();
    
    handleClickShowPassword = <K extends keyof IState>(prop: K) => {this.setState({...this.state, [prop]: !this.state[prop]} as AccountState<IState>)}
   
    handleChange = <K extends keyof IState>(prop: K) => 
        async (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
            await this.setState({...this.state,[prop]: event.target.value} as AccountState<IState>);
            if(this.state.newPassword !== this.state.confirmPassword)
                this.setState({error: "The passwords don't match"});
            else
                this.setState({error: ""});
    }

    render() {
        return (
            <>
                <Modal aria-labelledby="modal-title"
                    open={this.state.openUsername}
                    onClose={this.handleUsernameModalClose}>
                    <div className={styles.paper}>
                        <h1 id="modal-title">Are you sure you want to change your username?</h1>
                        <p>Warning: this action can not be undone</p>
                        <div className={styles.modalButtons}>
                            <Button variant="contained" color="secondary" className={styles.marginRight} onClick={this.handleUsernameModalClose}>close</Button>
                            <Button variant="contained" color="primary" onClick={this.handleUpdateUsername}>confirm</Button>
                        </div>
                    </div>
                </Modal>
                <Modal aria-labelledby="modal-title"
                    open={this.state.openPassword}
                    onClose={this.handlePasswordModalClose}>
                    <div className={styles.paper}>
                        <h1 id="modal-title">Are you sure you want to change your password?</h1>
                        <p>Warning: this action can not be undone</p>
                        <div className={styles.modalButtons}>
                            <Button variant="contained" color="secondary" className={styles.marginRight} onClick={this.handlePasswordModalClose}>close</Button>
                            <Button variant="contained" color="primary" onClick={this.handleUpdatePassword}>confirm</Button>
                        </div>
                    </div>
                </Modal>
                <div className={styles.accountArea}>
                    <h1>Modify Your Account:</h1>
                    <p style={{backgroundColor:'rgba(255,0,0,0.5)', color:'black'}}>{this.state.error}</p>
                    <hr/>
                    {this.state.user?.providerData[0]?.providerId ==='password'&&<>
                    <h3>Update Password:</h3>
                    <div className={styles.updateArea}>
                    <FormControl className={styles.text}  variant="outlined">
                        <InputLabel htmlFor="oldpassword">Old Password</InputLabel>
                        <OutlinedInput
                            id="oldpassword"
                            type={this.state.showOldPassword ? 'text' : 'password'}
                            value={this.state.oldPassword}
                            onChange={this.handleChange('oldPassword')}
                            endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => {this.handleClickShowPassword('showOldPassword')}}
                                onMouseDown={this.handleMouseDownPassword}
                                edge="end"
                                >
                                {this.state.showOldPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                            }
                            labelWidth={70}
                        />
                    </FormControl>
                    <FormControl className={styles.text}  variant="outlined">
                        <InputLabel htmlFor="newpassword">New Password</InputLabel>
                        <OutlinedInput
                            id="newpassword"
                            type={this.state.showNewPassword ? 'text' : 'password'}
                            value={this.state.newPassword}
                            onChange={this.handleChange('newPassword')}
                            endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => {this.handleClickShowPassword('showNewPassword')}}
                                onMouseDown={this.handleMouseDownPassword}
                                edge="end"
                                >
                                {this.state.showNewPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                            }
                            labelWidth={70}
                        />
                    </FormControl>
                    <FormControl className={styles.text}  variant="outlined">
                        <InputLabel htmlFor="conpassword">Confirm Password</InputLabel>
                        <OutlinedInput
                            id="conpassword"
                            type={this.state.showConfirmPassword ? 'text' : 'password'}
                            value={this.state.confirmPassword}
                            onChange={this.handleChange('confirmPassword')}
                            endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => {this.handleClickShowPassword('showConfirmPassword')}}
                                onMouseDown={this.handleMouseDownPassword}
                                edge="end"
                                >
                                {this.state.showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                            }
                            labelWidth={70}
                        />
                    </FormControl>
                    <Button className={styles.button} variant="contained" onClick={()=>this.setState({openPassword: true})}>Update Password</Button>
                    </div>
                    <hr/>
                    </>}
                    <div>
                        <h3>Update Username:</h3>
                        <div className={styles.updateArea}>
                        <p>Current Username: {this.state.username || "no username set"}</p>
                        <FormControl className={styles.text}  variant="outlined">
                            <InputLabel htmlFor="usernameInput">New username</InputLabel>
                            <OutlinedInput
                                id="usernameInput"
                                type="text"
                                value={this.state.newUsername}
                                onChange={this.handleChange('newUsername')}
                                labelWidth={70}
                            />
                        </FormControl>
                        <Button className={styles.button} variant="contained" onClick={()=>this.setState({openUsername: true})}>Update Username</Button>
                        </div>
                    </div> 
                </div>
            </>
        )
    }
}
