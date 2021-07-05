import React from 'react';
import {Redirect, Route} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";

export function PrivateRoute({ component: Component, ...rest })
{
    const { currentUser } = useAuth();

    return (
        <Route {...rest} render={props => currentUser ? <Component {...props}/> : <Redirect to={"/"}/>}>
        </Route>
    );
}

export function PublicRoute({ component: Component, ...rest })
{
    const { currentUser } = useAuth();

    return (
        <Route {...rest} render={props => currentUser ? <Redirect to={"/"}/> : <Component {...props}/>}>
        </Route>
    );
}