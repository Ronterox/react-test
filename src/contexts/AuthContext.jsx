import React, {useContext, useEffect, useState} from "react";
import {auth, storage} from "../firebase";
import images from "../media/images";

const AuthContext = React.createContext({});

export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children })
{
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);
    const [userImage, setUserImage] = useState(null);

    function signup(email, password) { return auth.createUserWithEmailAndPassword(email, password); }

    function login(email, password) { return auth.signInWithEmailAndPassword(email, password);}

    function logout() { return auth.signOut(); }

    useEffect(() =>
    {
        return auth.onAuthStateChanged(user =>
        {
            setCurrentUser(user);

            setLoading(false);

            const profileImageRef = storage.child(user.uid);

            profileImageRef.getDownloadURL().then(downloadURl => setUserImage(downloadURl)).catch(() => setUserImage(images.defaultProfile));
        });
    }, []);

    const values = { currentUser, userImage, signup, login, logout }

    return (
        <AuthContext.Provider value={values}>
            {!loading && children}
        </AuthContext.Provider>
    );
}