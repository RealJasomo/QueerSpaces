import React, {useContext} from 'react'
import { AuthContext }from './firebase/AuthContext';
import {Route, Redirect} from 'react-router-dom';



interface ProtectedRouteProp {
    to: string, 
    path: string,
    children: React.ReactNode
}
export default function ProtectedRoute(props: ProtectedRouteProp) {
    const auth = useContext(AuthContext);
    if(auth.loaded){
        if(auth.user)
            return (<Route path={props.path}>{props.children}</Route>)
        else
            return (<Redirect to={props.to}></Redirect>)
    }else{
        return null;
    }
}
