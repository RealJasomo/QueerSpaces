import React, {createContext, Component } from 'react'
import firebase from './Firebase'
export const AuthContext: React.Context<AuthState> = createContext<AuthState>({user: null, loaded: false})

interface AuthState {
    user: firebase.User | null,
    loaded: boolean
}
export default class FirebaseAuthContext extends Component<{}, AuthState>{
    constructor(props: {}){
        super(props);
        this.state = {
            user: firebase.auth().currentUser,
            loaded: false 
        }
    }
    componentDidMount(){
        firebase.auth().onAuthStateChanged(user => this.setState({user: user, loaded: true}));
    }
    render() {
        return (
            <AuthContext.Provider value={this.state}>
                {this.props.children}
            </AuthContext.Provider>
        )
    }
}
