import React, { Component } from 'react'
import {TextField, Link, Button, Typography, CssBaseline, Container} from '@material-ui/core'
import styles from '../css/login.module.css'
import firebase from './firebase/Firebase'


interface LoginProps{

}

interface LoginState {
    email: string,
    password: string,
    error: string
}

interface FirebaseError {
    code: string,
    message: string
    a: string | null
}

export default class Login extends Component<LoginProps, LoginState> {
    constructor(props: LoginProps){
        super(props);
        this.state = {
            email: "",
            password: "",
            error: ""
        }
    }
    handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
            .then(()=> {
                console.log("signed in sucessfully");
                this.setState({error: ""});
                window.location.href="/";
            })
            .catch((err: FirebaseError) => {
                console.log("Error:",err);
                this.setState({error: err.message});
            })
    }
    handleGoogleLogin = () =>{
        var provider: firebase.auth.GoogleAuthProvider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(() => {
            console.log("signed in sucessfully");
                this.setState({error: ""});
                window.location.href="/";
        }).catch((err: FirebaseError) => {
            console.log("Error:",err);
            this.setState({error: err.message});
        });
    }
    render() {
        let errorMessage;
        if(this.state.error){
            errorMessage = <div className={styles.warning}>{this.state.error}</div>;
        }
        return (
            <form onSubmit={this.handleLogin}>
            <Container component="main" maxWidth="xs">
            <CssBaseline />
            {errorMessage}
            <div className={styles.paper}>
                <Typography component="h1" variant="h5">
                    Login
                </Typography>
                <TextField
                    className={styles.formInput}
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    onChange={e => this.setState({
                        ...this.state,
                        email: e.target.value
                    })}
                />
                <TextField
                    className={styles.formInput}
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    onChange={e => this.setState({
                        ...this.state,
                        password: e.target.value
                    })}
                />
                <div className={styles.submitContainer}>
                    <Link href="#" variant="body2" className={styles.forgot}>
                        Forgot password?
                    </Link>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={styles.submit}
                    >
                        Login
                    </Button>
                </div>
                <Link href="/signup" variant="body2" className={styles.signup}>
                    New to this site?&nbsp;&nbsp;Click here to sign up
                </Link> 
                <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={styles.submit}
                        onClick={this.handleGoogleLogin}
                    >
                        Login with Google
                    </Button>
            </div>
            </Container>
            </form>
        )
    }
}
