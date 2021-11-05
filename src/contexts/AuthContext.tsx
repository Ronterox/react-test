import React, { useContext, useEffect, useState } from "react";
import { auth, storage } from "../firebase";
import images from "../media/images";
import firebase from "firebase/app";

export type User = firebase.User | null;
type UserCredential = firebase.auth.UserCredential;

interface UserData
{
    currentUser: User,
    userImage: string,
    signup: (email: string, password: string) => Promise<UserCredential>;
    login: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
}

const AuthContext = React.createContext<Partial<UserData>>({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children })
{
    const [currentUser, setCurrentUser] = useState<User>();
    const [loading, setLoading] = useState(true);
    const [userImage, setUserImage] = useState("");

    const signup = (email, password) => auth.createUserWithEmailAndPassword(email, password);

    const login = (email, password) => auth.signInWithEmailAndPassword(email, password);

    const logout = () => auth.signOut();

    useEffect(() =>
    {
        return auth.onAuthStateChanged(user =>
        {
            setCurrentUser(user);

            if (user)
            {
                const profileImageRef = storage.child(user.uid);
                profileImageRef.getDownloadURL().then(downloadURl => setUserImage(downloadURl)).catch(() => setUserImage(images.defaultProfile));
            }

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