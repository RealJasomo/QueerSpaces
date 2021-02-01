import React, { Component } from 'react'
import {TextField, Link, Button, Typography, CssBaseline, Container} from '@material-ui/core'
import styles from '../css/login.module.css'

interface LoginProps{

}

interface LoginState {
    username: String,
    password: String,
    error: String
}

export default class Login extends Component<LoginProps, LoginState> {
    constructor(props: LoginProps){
        super(props);
        this.state = {
            username: "",
            password: "",
            error: ""
        }
    }
    handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
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
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    onChange={e => this.setState({
                        ...this.state,
                        username: e.target.value
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
            </div>
            </Container>
            </form>
        )
    }
}
