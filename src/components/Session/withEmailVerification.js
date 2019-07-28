import React from 'react';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';

const needsEmailVerification = authUser =>
    authUser &&
    !authUser.emailVerified &&
    authUser.providerData
        .map(provider => provider.providerId)
        .includes('password')

const withEmailVerification = Component => {
    class withEmailVerification extends React.Component {

        constructor(props) {
            super(props);

            this.state = { isSent: false }
        }

        onSendEmailVerification = () => {
            this.props.firebase.doSendEmailVerification()
                .then(() => this.setState({ isSent: true }));
        }

        render() {
            return (
                <AuthUserContext.Consumer>
                    {authUser => 
                        needsEmailVerification(authUser) 
                        ? (
                            <div>
                                {this.state.isSent 
                                ? (
                                    <p>
                                        E-mail confirmation sent: Check your E-mails(include spam folder).
                                        Refresh this page once you confirmed your E-mail
                                    </p>
                                  )
                                : (
                                    <p>
                                        Verify your E-mail: Check you E-mails(Spam folder included)
                                        for a confirmation E-mail or send another confirmation E-mail
                                    </p>
                                  )
                                }

                                <button type="button" className="btn btn-warning"
                                    onClick={this.onSendEmailVerification}
                                    disabled={this.state.isSent}>
                                        Send confirmation E-mail
                                </button>
                            </div>
                          )
                        : (<Component { ...this.props} />)
                    }
                </AuthUserContext.Consumer>
            );
        }
    }

    return withFirebase(withEmailVerification)
};

export default withEmailVerification;