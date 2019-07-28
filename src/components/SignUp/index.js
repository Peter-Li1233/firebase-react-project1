import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from "recompose";

import { FormValidator } from "../../tools/FormValidator";
import { ValidationMessage } from "../../tools/ValidationMessage";

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

const ERROR_CODE_ACCOUNT_EXISTS = 'auth/email-already-in-use';
const ERROR_MSG_ACCOUNT_EXISTS = `
    An account with this E-Mail already exists. 
    Try to Login from this account instead.
    if you think the account is already used from one of the social logins, 
     try to sign-in with one of them. Afterward, associate your accounts on your personal account page
    `;

const SignUpPage = () => (
    <div className="bg-primary text-center text-white p-2 ">
        <h1>Sign Up</h1>
        <SignUpForm />
    </div>
)

const INITIAL_STATE = {
    username: "",
    email: "",
    passwordOne: "",
    passwordTwo: "",
    isAdmin: false,
    error: null
}

class SignUpFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...INITIAL_STATE
        }
        this.rules = {
            username: { required: true },
            email: { required: true, email: true },
            passwordOne: { required: true, equals: "passwordTwo" },
            passwordTwo: { required: true, equals: "passwordOne" }
        }
    }

    onSubmit = () => {
        const { username, email, passwordOne, isAdmin } = this.state;
        const roles = {};

        if (isAdmin) {
            roles[ROLES.ADMIN] = ROLES.ADMIN;
        }

        this.props.firebase
            .doCreateUserWithEmailAndPassword(email, passwordOne)
            .then(authUser => {
                // Create a user in Firebase realtime database
                return this.props.firebase
                    .user(authUser.user.uid)
                    .set({
                        username,
                        email,
                        roles
                    });
            })
            .then(() => {
                return this.props.firebase.doSendEmailVerification();
            })
            .then(() => {
                this.setState({ ...INITIAL_STATE });
                this.props.history.push(ROUTES.HOME);
            })
            .catch(error => {
                if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
                    error.message = ERROR_MSG_ACCOUNT_EXISTS
                };
                this.setState({ error })
            });

            // e.preventDefault();
    }

    onChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onChangeCheckbox = e => {
        this.setState({
            [e.target.name]: e.target.checked
        })
    }

    render() {
        const {username, email, passwordOne, passwordTwo, isAdmin, error } = this.state;
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
                        <label>Name:</label>
                        <input
                            className="form-control"
                            name="username"
                            value={ username }
                            onChange={ this.onChange }
                            type="text"
                            placeholder="Full Name" />
                        <ValidationMessage field="username" />
                    </div>
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
                            name="passwordOne"
                            value={ passwordOne }
                            onChange={ this.onChange }
                            type="password"
                            placeholder="Password" />
                        <ValidationMessage field="passwordOne" />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password:</label>
                        <input
                            className="form-control"
                            name="passwordTwo"
                            value={ passwordTwo }
                            onChange={ this.onChange }
                            type="password"
                            placeholder="Confirm Password" />
                        <ValidationMessage field="passwordTwo" />
                    </div>
                    <div className="form-group">
                        <label>Admin?</label>
                        <input
                            className="form-control"
                            name="isAdmin"
                            checked={ isAdmin }
                            onChange={ this.onChangeCheckbox }
                            type="checkbox"
                        />
                        <ValidationMessage field="isAdmin" />
                    </div>

                    {/* <button disabled={ isInvalid } 
                        className="btn btn-warning m-2 p-2"
                        type="submit">Sign Up</button> */}

                    {error && <p className="text-warning">{ error.message }</p>}

                </FormValidator>
            </div>
        )
    }
}

// const SignUpForm = withRouter(withFirebase(SignUpFormBase)); //I like this by the way, don't need external package
const SignUpForm = compose(
    withRouter,
    withFirebase
)(SignUpFormBase);

const SignUpLink = () => (
    <p>
        Don't have an account? <Link className="text-white p-2" to={ROUTES.SIGN_UP}>Sign Up</Link>
    </p>
)

export default SignUpPage;
export { SignUpForm, SignUpLink };