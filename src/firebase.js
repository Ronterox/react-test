import firebase from 'firebase/app'
import "firebase/auth"
import "firebase/database"
import "firebase/storage"

const firebaseConfig = firebase.initializeApp({
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
})

export default firebaseConfig;

export const auth = firebaseConfig.auth();

export const database = firebaseConfig.database().ref("Users");

export const databasePatchNotes = firebaseConfig.database().ref("Patch Notes");

export const storage = firebaseConfig.storage().ref("Images");