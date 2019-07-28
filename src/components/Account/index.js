import React, { Component } from "react";

import { PasswordForgetForm } from '../PasswordForget';
import PasswordChangeForm from '../PasswordChange';
import { AuthUserContext, withAuthorization, withEmailVerification } from '../Session';
import { withFirebase } from "../Firebase";

const SIGN_IN_METHODS = [
  {
    id: 'password',
    provider: null,
  },
  {
    id: 'google.com',
    provider: 'googleProvider',
  },
  {
    id: 'facebook.com',
    provider: 'facebookProvider',
  },
  {
    id: 'twitter.com',
    provider: 'twitterProvider',
  }
];

class LoginManagementBase extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeSignInMethods: [],
      error: null
    };
  }

  fetchSignInMethods = () => {
    this.props.firebase.auth
      .fetchSignInMethodsForEmail(this.props.authUser.email)
      .then(activeSignInMethods => 
        this.setState({ activeSignInMethods, erro: null })
      )
      .catch(error => this.setState({ error }));
  }

  onDefaultLoginLink = password => {
    const credential = this.props.firebase.emailAuthProvider.credential(
        this.props.authUser.email,
        password
    )

    this.props.firebase.auth.currentUser
      .linkAndRetrieveDataWithCredential(credential)
      .then(this.fetchSignInMethods)
      .catch(error => this.setState({ error }))
  }

  onSocialLoginLink = provider => {
    this.props.firebase.auth.currentUser
      .linkWithPopup(this.props.firebase[provider])
      .then(this.fetchSignInMethods)
      .catch(error => this.setState({ error }))
  }

  onUnlink = providerId => {
    this.props.firebase.auth.currentUser
      .unlink(providerId)
      .then(this.fetchSignInMethods)
      .catch(error => this.setState({ error }))
  }


  render() {
    const {activeSignInMethods, error } = this.state;

    return (
      <div>
        <h3>Sign In Methods:</h3>
        <div className='btn-group-vertical'>
          {SIGN_IN_METHODS.map(signInMethod => {
            const onlyOneLeft = activeSignInMethods.length === 1;
            const isEnabled = activeSignInMethods.includes(signInMethod.id);

            return (
              <React.Fragment key={signInMethod.id}>
                {
                  signInMethod.id === 'password'
                  ? <DefaultLoginToggle
                      onlyOneLeft={onlyOneLeft}
                      isEnabled={isEnabled}
                      signInMethod={signInMethod}
                      onLink={this.onDefaultLoginLink}
                      onUnlink={this.onUnlink}
                    />
                  : <SocialLoginToggle
                      onlyOneLeft={onlyOneLeft}
                      isEnabled={isEnabled}
                      signInMethod={signInMethod}
                      onLink={this.onSocialLoginLink}
                      onUnlink={this.onUnlink}
                    />
                }
                {/* {isEnabled 
                  ? (
                    <button key={signInMethod.id} className="btn btn-warning btn-lg" 
                      disabled={onlyOneLeft} type="button" onClick={ () => this.unlink(signInMethod.id)}>
                      Deactivate {signInMethod.id} 
                    </button>
                    )
                  : (
                    <button key={signInMethod.id} className="btn btn-secondary btn-lg" type="button" onClick={ () => this.onSocialLoginLink(signInMethod.provider) }>
                      Link {signInMethod.id} 
                    </button>
                    ) */}
              </React.Fragment>
            )
          })}
        </div>
        { error && error.message }
      </div>
    );
  }

  componentDidMount() {
    this.fetchSignInMethods();
  }
}

const SocialLoginToggle = ({
  onlyOneLeft,
  isEnabled,
  signInMethod,
  onLink,
  onUnlink
}) => isEnabled 
  ? (
    <button key={signInMethod.id} className="btn btn-warning btn-lg" 
      disabled={onlyOneLeft} type="button" onClick={ () => onUnlink(signInMethod.id)}>
      Deactivate {signInMethod.id} 
    </button>
    )
  : (
    <button key={signInMethod.id} className="btn btn-secondary btn-lg" type="button" onClick={ () => onLink(signInMethod.provider) }>
      Link {signInMethod.id} 
    </button>
    );

class DefaultLoginToggle extends Component{
  constructor(props) {
    super(props);

    this.state = {
      passwordOne: '',
      passwordTwo: ''
    };
  }

  onSubmit = (e) => {
    e.preventDefault();

    this.props.onLink(this.state.passwordOne);
    this.setState({
      passwordOne: '',
      passwordTwo: '',
    })
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    const {
      onlyOneLeft,
      isEnabled,
      signInMethod,
      onUnlink,
    } = this.props;

    const { passwordOne, passwordTwo } = this.state;

    const isInvalid = 
      passwordOne !== passwordTwo || passwordOne === '';

    return isEnabled
      ? (<button key={signInMethod.id} className="btn btn-warning btn-lg" 
          disabled={onlyOneLeft} type="button" onClick={ () => onUnlink(signInMethod.id)}>
          Deactivate {signInMethod.id} 
        </button>)
      : (
        <form onSubmit={this.onSubmit}>
          <input
            className="form-control"
            name="passwordOne"
            value={passwordOne}
            onChange={this.onChange}
            type="password"
            placeholder="New Password"
          />
          <input
            className="form-control"
            name="passwordTwo"
            value={passwordTwo}
            onChange={this.onChange}
            type="password"
            placeholder="Confirm New Password"
          />

          <button disabled={isInvalid} className="btn btn-secondary btn-lg" type="submit">
            Link {signInMethod.id}
          </button>

        </form>
        );

  }
}

const LoginManagement = withFirebase(LoginManagementBase);

const AccountPage = () => (
    <AuthUserContext.Consumer>
        {
            authUser => (
              <div>
                <h1>
                    Account: {authUser.email}
                </h1>
                <hr />
                <h3 className="bg-light text-dark">Reset Password:</h3>
                <PasswordForgetForm />
                <hr />
                <h3 className="bg-light text-dark">Change Password:</h3>
                <PasswordChangeForm  /> 
                <LoginManagement authUser={authUser} />
              </div>
            )
        }
        
    </AuthUserContext.Consumer>
);

const condition = authUser => !!authUser

// export default withEmailVerification(withAuthorization(condition)(AccountPage));
export default withAuthorization(condition)(AccountPage);