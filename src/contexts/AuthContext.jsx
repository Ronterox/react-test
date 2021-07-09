import React, {useContext, useEffect, useState} from "react";
import {auth, storage} from "../firebase";
import images from "../media/images";

const AuthContext = React.createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children })
{
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);
    const [userImage, setUserImage] = useState(null);

    const signup = (email, password) => auth.createUserWithEmailAndPassword(email, password);

    const login = (email, password) => auth.signInWithEmailAndPassword(email, password);

    const logout = () => auth.signOut();

    useEffect(() =>
    {
        return auth.onAuthStateChanged(user =>
        {
            setCurrentUser(user);

            const profileImageRef = storage.child(user.uid);
            profileImageRef.getDownloadURL().then(downloadURl => setUserImage(downloadURl)).catch(() => setUserImage(images.defaultProfile));

            setLoading(false);
        });
    }, []);

    const values = { currentUser, userImage, signup, login, logout }

    return (
        <AuthContext.Provider value={values}>
            {!loading && children}
        </AuthContext.Provider>
    );
}