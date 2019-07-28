import React, {Component } from "react";
import { Switch, Route, Link } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import { withAuthorization, withEmailVerification } from '../Session';

import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

const AdminPage = () => (
    <div>
        <p>The Admin Page is accessible by every signed in admin user. </p>

        <Switch>
            <Route exact path={ROUTES.ADMIN_DETAILS} component={UserItem} />
            <Route exact path={ROUTES.ADMIN} component={UserList} />
        </Switch>
    </div>
)

class UserListBase extends Component {
    
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            users: []
        }
    }

    componentDidMount() {
        this.setState({ loading: true });

        this.props.firebase.users().on('value', snapshot => {
            const usersObject = snapshot.val();

            // const usersList1 = Object.entries(usersObject).map(([k, v]) => ({
            //     ...v,
            //     uid: k
            // }));

            // console.log(usersList1);

            const usersList2 = Object.keys(usersObject).map(key => ({
                ...usersObject[key],
                uid: key
            }))
        
            this.setState({
                users: usersList2,
                loading: false
            });
        });
    }

    componentWillUnmount() {
        this.props.firebase.users().off();
    }

    render() {
        const { users, loading } = this.state;
        return <div>
            { loading && <div>Loading...</div> }
             <table className="table table-striped table-bordered text-center m-2 p-2">
                 <thead className="thead-dark">
                     <tr>
                         <th colSpan="4">Admin</th>
                    </tr>
                    <tr><th>ID</th><th>E-Mail</th><th>Username</th><th></th></tr>
                 </thead>
                 <tbody>
                    {users.map(user => 
                        <tr key={user.uid}>
                            <td>{user.uid}</td>
                            <td>{user.email}</td>
                            <td>{user.username}</td>
                            <td>
                                <Link to={{
                                    pathname: `${ROUTES.ADMIN}/${user.uid}`,
                                    state: {user}
                                    }}>
                                    Details
                                </Link>
                            </td>
                        </tr>
                        
                    )}
                 </tbody>
             </table>
        </div>
            
    }
};

class UserItemBase extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            user: null,
            ...props.location.state
        }
    }

    componentDidMount() {
        if (this.state.user) {
            return;
        }

        this.setState({ loading: true});

        this.props.firebase
            .user(this.props.match.params.id)
            .on('value', snapshot => {
                this.setState({
                    user: {...snapshot.val(), uid: this.props.match.params.id },
                    loading: false
                });
            });
    }

    onSendPasswordResetEmail() {
        this.props.firebase.doPasswordReset(this.state.user.email);
    }

    componentWillMount() {
        this.props.firebase.user(this.props.match.params.id).off();
    }

    render() {
        const { user, loading } = this.state;

        return (
            <div>
            { loading && <div>Loading...</div> }

            {user && <table className="table table-striped table-bordered text-center m-2 p-2">
                 <thead className="thead-dark">
                     <tr>
                         <th colSpan="4">{user.username}</th>
                    </tr>
                    <tr><th>ID</th><th>E-Mail</th><th>Username</th><th></th></tr>
                 </thead>
                 <tbody>
                    <tr>
                        <td>{user.uid}</td>
                        <td>{user.email}</td>
                        <td>{user.username}</td>
                        <td>
                            <button type="button" 
                                className="btn btn-danger"
                                onClick={this.onSendPasswordResetEmail}>Send Password Reset</button>
                        </td>
                    </tr>
                 </tbody>
             </table>           
            }
        </div>
        )
    }
}

const UserList = withFirebase(UserListBase);
const UserItem = withFirebase(UserItemBase);

const condition = authUser => authUser && !!authUser.roles[ROLES.ADMIN];

// export default withEmailVerification(withFirebase(withAuthorization(condition)(AdminPage)));
// export default withFirebase(withAuthorization(condition)(AdminPage));
export default withAuthorization(condition)(AdminPage);