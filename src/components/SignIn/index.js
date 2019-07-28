import React, { Component } from 'react';
import {  withRouter } from 'react-router-dom';
import { compose } from "recompose";

import { FormValidator } from "../../tools/FormValidator";
import { ValidationMessage } from "../../tools/ValidationMessage";

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import { SignUpLink } from '../SignUp';
import { PasswordForgetLink } from '../PasswordForget';

const ERROR_CODE_ACCOUNT_EXISTS = 'auth/account-exists-with-different-credential';
const ERROR_MSG_ACCOUNT_EXISTS = `
    An account with an E-Mail address to this social account already exists. 
    Try to Login from this account and associate your social accounts on your personal account page
    `;

const SignInPage = () => (
    <div className="bg-primary text-center text-white p-2 ">
        <h1>Sign In</h1>
        <SignInForm />
        
    <div className="container-fluid">
        <div className="row">
            <div className="col"><SignInGoogle /></div>
            <div className="col"><SignInFacebook /></div>
            <div className="col"><SignInTwitter /></div>  
        </div>
    </div>
        
        <PasswordForgetLink />
        <SignUpLink />
    </div>
)

const INITIAL_STATE = {
    email: "",
    password: "",
    error: null
}

class SignInFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...INITIAL_STATE
        }
        this.rules = {
            email: { required: true, email: true },
            password: { required: true }
        }
    }

    onSubmit = () => {
        const { email, password } = this.state;

        this.props.firebase
            .doSignInWithEmailAndPassword(email, password)
            .then(() => {
                this.setState({ ...INITIAL_STATE });
                this.props.history.push(ROUTES.HOME);
            })
            .catch(error => {
                this.setState({ error })
            });

            // e.preventDefault();
    }

    onChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    render() {
        const { email, password, error } = this.state;
        // const isInvalid = 
        //     passwordOne !== passwordTwo ||
        //     passwordOne === '' ||
        //     email === '' ||
        //     username === '';
       
        return (
            <div className="h5 bg-info text-white p-2">
                <FormValidator data={ this.state } rules={ this.rules }
                    submit={ this.onSubmit }>
                    
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            className="form-control"
                            name="email"
                            value={ email }
                            onChange={ this.onChange }
                            type="text"
                            placeholder="Email Address" />
                        <ValidationMessage field="email" />
                    </div>

                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            className="form-control"
                            name="password"
                            value={ password }
                            onChange={ this.onChange }
                            type="password"
                            placeholder="Password" />
                        <ValidationMessage field="password" />
                    </div>
                    
                    {/* <button disabled={ isInvalid } 
                        className="btn btn-warning m-2 p-2"
                        type="submit">Sign Up</button> */}

                    {error && <p>{ error.message }</p>}

                </FormValidator>
            </div>
        )
    }
}

class SignInGoogleBase extends Component {

    constructor(props) {
        super(props);

        this.state = {
            error: null
        }
    }

    onSubmit = e => {
        this.props.firebase
            .doSignInWithGoogle()
            .then(socialAuthUser => {
                //Create a user in your firebase Realmtime Database too
                return this.props.firebase
                    .user(socialAuthUser.user.uid)
                    .set({
                        username: socialAuthUser.user.displayName,
                        email: socialAuthUser.user.email,
                        roles: {}
                    })
            })
            .then(() => {
                this.setState({ error: null });
                this.props.history.push(ROUTES.HOME);
            })
            .catch(error => {
                if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
                    error.message = ERROR_MSG_ACCOUNT_EXISTS
                };
                this.setState({ error })
            });

            e.preventDefault();
    }

    render() {
        const { error } = this.state;

        return (
            <form onSubmit={ this.onSubmit }>
                <button className="btn btn-secondary" type="submit">Sign In with Google</button>

                {error && <p className="text-warning">{error.message}</p>}
            </form>
        )
    }
}

class SignInFacebookBase extends Component {

    constructor(props) {
        super(props);

        this.state = {
            error: null
        }
    }

    onSubmit = e => {
        this.props.firebase
            .doSignInWithFacebook()
            .then(socialAuthUser => {
                //Create a user in your firebase Realmtime Database too
                console.log(socialAuthUser);
                return this.props.firebase
                    .user(socialAuthUser.user.uid)
                    .set({
                        username: socialAuthUser.additionalUserInfo.profile.name,
                        email: socialAuthUser.additionalUserInfo.profile.email,
                        roles: {}
                    })
            })
            .then(() => {
                this.setState({ error: null });
                this.props.history.push(ROUTES.HOME);
            })
            .catch(error => {
                if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
                    error.message = ERROR_MSG_ACCOUNT_EXISTS
                };
                this.setState({ error })
            });

            e.preventDefault();
    }

    render() {
        const { error } = this.state;

        return (
            <form onSubmit={ this.onSubmit }>
                <button className="btn btn-secondary" type="submit">Sign In with Facebook</button>

                {error && <p className="text-warning">{error.message}</p>}
            </form>
        )
    }
}

class SignInTwitterBase extends Component {

    constructor(props) {
        super(props);

        this.state = {
            error: null
        }
    }

    onSubmit = e => {
        this.props.firebase
            .doSignInWithTwitter()
            .then(socialAuthUser => {
                //Create a user in your firebase Realmtime Database too
                return this.props.firebase
                    .user(socialAuthUser.user.uid)
                    .set({
                        username: socialAuthUser.additionalUserInfo.profile.name,
                        email: socialAuthUser.additionalUserInfo.profile.email,
                        roles: {}
                    })
            })
            .then(() => {
                this.setState({ error: null });
                this.props.history.push(ROUTES.HOME);
            })
            .catch(error => {
                if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
                    error.message = ERROR_MSG_ACCOUNT_EXISTS
                };
                this.setState({ error })
            });

            e.preventDefault();
    }

    render() {
        const { error } = this.state;

        return (
            <form onSubmit={ this.onSubmit }>
                <button className="btn btn-secondary" type="submit">Sign In with Twitter</button>

                {error && <p className="text-warning">{error.message}</p>}
            </form>
        )
    }
}

// const SignUpForm = withRouter(withFirebase(SignUpFormBase)); //I like this by the way, don't need external package
const SignInForm = compose(
    withRouter,
    withFirebase
)(SignInFormBase);

const SignInGoogle = compose(
    withRouter,
    withFirebase
)(SignInGoogleBase);

const SignInFacebook = compose(
    withRouter,
    withFirebase
)(SignInFacebookBase);

const SignInTwitter = compose(
    withRouter,
    withFirebase
)(SignInTwitterBase);

export default SignInPage;
export { SignInForm, SignInGoogle, SignInTwitter };