import app from "firebase/app";
import "firebase/auth";
import "firebase/database";

const prodConfig = { 
    apiKey: process.env.REACT_APP_PROD_API_KEY,
    authDomain: process.env.REACT_APP_PROD_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_PROD_DATABASE_URL,
    projectId: process.env.REACT_APP_PROD_PROJECT_ID,
    storageBucket: process.env.REACT_APP_PROD_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_PROD_MESSAGING_SENDER_ID
};

const devConfig = { 
    apiKey: process.env.REACT_APP_DEV_API_KEY,
    authDomain: process.env.REACT_APP_DEV_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DEV_DATABASE_URL,
    projectId: process.env.REACT_APP_DEV_PROJECT_ID,
    storageBucket: process.env.REACT_APP_DEV_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_DEV_MESSAGING_SENDER_ID
};

const config = process.env.NODE_ENV === "production" ? prodConfig : devConfig;

const confirmation_email_redirect = process.env.NODE_ENV ==="production" 
        ? process.env.REACT_APP_PROD_CONFIRMATION_EMAIL_REDIRECT
        : process.env.REACT_APP_DEV_CONFIRMATION_EMAIL_REDIRECT;

class Firebase {
    constructor() {
        app.initializeApp(config);

        this.serverValue = app.database.ServerValue;
        this.emailAuthProvider = app.auth.EmailAuthProvider;
        
        this.auth = app.auth();
        this.db = app.database();

        this.googleProvider = new app.auth.GoogleAuthProvider();
        this.facebookProvider = new app.auth.FacebookAuthProvider();
        this.twitterProvider = new app.auth.TwitterAuthProvider();
    }

    //*** Auth API ***
    doCreateUserWithEmailAndPassword = (email, password) => 
        this.auth.createUserWithEmailAndPassword(email, password);  
        
    doSignInWithEmailAndPassword = (email, password) => 
        this.auth.signInWithEmailAndPassword(email, password);

    doSignInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider);
    doSignInWithFacebook = () => this.auth.signInWithPopup(this.facebookProvider);
    doSignInWithTwitter = () => this.auth.signInWithPopup(this.twitterProvider);

    doSignOut = () => this.auth.signOut();

    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

    doPasswordUpdate = password => this.auth.currentUser.updatePassword(password);

    doSendEmailVerification = () => 
        this.auth.currentUser.sendEmailVerification({
            url: confirmation_email_redirect
        });

    //*** User API */

    user = uid => this.db.ref(`users/${uid}`);
    users = () => this.db.ref('users');

    //*** Message API ***/
    message = uid => this.db.ref(`messages/${uid}`);
    messages = () => this.db.ref('messages');

    //*** Merge Auth and DB User API ***/

    onAuthUserListener = (next, fallback) => 
        this.auth.onAuthStateChanged(authUser => {
            if (authUser) {
                this.user(authUser.uid)
                    .once('value')
                    .then(snapshot => {
                        const dbUser = snapshot.val();

                        //default empty roles
                        if (!dbUser.roles) {
                            dbUser.roles = {};
                        }

                        //merge auth and db user
                        authUser = {
                            uid: authUser.uid,
                            email: authUser.email,
                            emailVerified: authUser.emailVerified,
                            providerData: authUser.providerData,
                            ...dbUser
                        };

                        next(authUser);
                    });
            } else {
                fallback();
            }
        });
}

export default Firebase;

