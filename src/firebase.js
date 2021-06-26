import firebase from 'firebase/app'
import "firebase/auth"

const app = firebase.initializeApp({
    apiKey: process.env,
    authDomain: process.env,
    projectId: process.env,
    storageBucket: process.env,
    messagingSenderId: process.env,
    appId: process.env
})

export default app;

export const auth = app.auth();