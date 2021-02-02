import React, { Component } from 'react'
import {TextField, Button, Typography, CssBaseline, Container} from '@material-ui/core'
import styles from '../css/login.module.css'
import firebase from './firebase/Firebase'


interface SignUpProps{

}

interface SignUpState {
    email: string,
    password: string,
    error: string
}

interface FirebaseError {
    code: string,
    message: string
    a: string | null
}

export default class SignUp extends Component<SignUpProps, SignUpState> {
    constructor(props: SignUpProps){
        super(props);
        this.state = {
            email: "",
            password: "",
            error: ""
        }
    }
    handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(()=> {
                console.log("signed up sucessfully");
                this.setState({error: ""});
                window.location.href="/";
            })
            .catch((err: FirebaseError) => {
                console.log("Error:",err);
                this.setState({error: err.message});
            })
    }

    render() {
        let errorMessage;
        if(this.state.error){
            errorMessage = <div className={styles.warning}>{this.state.error}</div>;
        }
        return (
            <form onSubmit={this.handleSignUp}>
            <Container component="main" maxWidth="xs">
            <CssBaseline />
            {errorMessage}
            <div className={styles.paper}>
                <Typography component="h1" variant="h5">
                    Sign Up
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
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={styles.submit}
                    >
                        Sign Up
                    </Button>
                </div>
            </div>
            </Container>
            </form>
        )
    }
}
