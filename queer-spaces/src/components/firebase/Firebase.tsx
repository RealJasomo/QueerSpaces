import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/storage'

const config = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

firebase.initializeApp(config);
export const usernameRef = firebase.firestore().collection('Usernames');
export const usersRef = firebase.firestore().collection('Users');
export const storageRef = firebase.storage().ref();
export default firebase;
