import React, { Component } from "react";

import { withFirebase } from '../Firebase';

import { FormValidator } from "../../tools/FormValidator";
import { ValidationMessage } from "../../tools/ValidationMessage";

const INITIAL_STATE = {
    passwordOne: '',
    passwordTwo: '',
    error: null,
}

class PasswordChangeFormBase extends Component {
    
    constructor(props) {
        super(props);

        this.state = {
            ...INITIAL_STATE
        };

        this.rules = {
            passwordOne: { required: true, equals: "passwordTwo" },
            passwordTwo: { required: true, equals: "passwordOne" }
        }
    }

    onSubmit = () => {
        const { passwordOne } = this.state;

        this.props.firebase
            .doPasswordUpdate(passwordOne)
            .then(() => {
                this.setState({ ...INITIAL_STATE })
            })
            .catch(error => {
                this.setState({ error })
            });
    }

    onChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    render() {
        const { passwordOne, passwordTwo, error } = this.state;
        return (
            <div className="h5 bg-info text-white p-2">
                <FormValidator data={ this.state } rules={ this.rules }
                    submit={ this.onSubmit }>
                    
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            className="form-control"
                            name="passwordOne"
                            value={ passwordOne }
                            onChange={ this.onChange }
                            type="password"
                            placeholder="New Password" />
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
                            placeholder="Confirm New  Password" />
                        <ValidationMessage field="passwordTwo" />
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

const PasswordChangeForm = withFirebase(PasswordChangeFormBase);

export default PasswordChangeForm;