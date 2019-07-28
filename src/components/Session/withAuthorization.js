import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

const withAuthorization = condition => Component => {

    class withAuthorization extends React.Component {
        render() {
            return <AuthUserContext.Consumer>
                { authUser => 
                   condition(authUser) ? <Component { ...this.props} /> : null
                }
            </AuthUserContext.Consumer>
            
        }

        componentDidMount() {
            this.listener = this.props.firebase.onAuthUserListener(
                authUser => {
                    console.log(authUser);
                    if (!condition(authUser)) {
                        this.props.history.push(ROUTES.SIGN_IN);
                    }
                },

                () => this.props.history.push(ROUTES.SIGN_IN)
            )
        }

        componentWillUnmount() {
            this.listener();
        }
    }

    return withRouter(withFirebase(withAuthorization));

    // return compose(
    //     withRouter,
    //     withFirebase
    // )(withAuthorization);
}

export default withAuthorization;