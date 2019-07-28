import React, { Component } from "react";
import { Link } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

import { FormValidator } from "../../tools/FormValidator";
import { ValidationMessage } from "../../tools/ValidationMessage";

const PasswordForgetPage = () => (
    <div>
        <h1>Password Forget</h1>
        <PasswordForgetForm />
    </div>
);

const INITIAL_STATE = {
    email: '',
    error: null
};

class PasswordForgetFormBase extends Component {

    constructor(props) {
        super(props);

        this.state = {
            ...INITIAL_STATE
        }

        this.rules = {
            email: { required: true, email: true }
        }
    }

    onSubmit = () => {
        const { email } = this.state;

        this.props.firebase
            .doPasswordReset(email)
            .then(() => {
                this.setState({ ...INITIAL_STATE });
            })
            .catch(error => {
                this.setState({ error })
            });

            // e.preventDefault();
    }

    onChange = e => {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        const {email, error } = this.state;

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

                    {error && <p>{ error.message }</p>}

                </FormValidator>
            </div>
        )
    }
}

const PasswordForgetLink = () => (
    <p>
        <Link className="text-white p-2" to={ROUTES.PASSWORD_FORGET}>Forgot Password?</Link>
    </p>
)

export default PasswordForgetPage;

const PasswordForgetForm = withFirebase(PasswordForgetFormBase);

export { PasswordForgetForm, PasswordForgetLink };