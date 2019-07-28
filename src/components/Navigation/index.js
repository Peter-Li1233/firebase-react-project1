import React from "react"
import { ToggleLink } from "../../tools/ToggleLink";

import SignOutButton from '../SignOut';
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";
import { AuthUserContext } from '../Session';

const NavigationAuth = ({ authUser }) => (
    <div>

        <ToggleLink to={ROUTES.LANDING} exact={true} className="m-2 btn btn-block">Landing</ToggleLink>

        <ToggleLink to={ROUTES.HOME} className="m-2 btn btn-block">Home</ToggleLink>
    
        <ToggleLink to={ROUTES.ACCOUNT} className="m-2 btn btn-block">Account</ToggleLink>

        { !!authUser.roles[ROLES.ADMIN] &&   
        <ToggleLink to={ROUTES.ADMIN} className="m-2 btn btn-block">Admin</ToggleLink> }

        <SignOutButton className="m-2 btn btn-block btn-warning" />
           
    </div>
)

const NavigationNonAuth = () => (
    <div>
       
        <ToggleLink to={ROUTES.SIGN_IN} className="m-2 btn btn-block">Sign In</ToggleLink>

        <ToggleLink to={ROUTES.LANDING} exact={true} className="m-2 btn btn-block">Landing</ToggleLink>
       
    </div>
)

const Navigation = () => (
  <AuthUserContext.Consumer>
      { authUser => authUser ? <NavigationAuth authUser={authUser} /> : <NavigationNonAuth /> }
  </AuthUserContext.Consumer>
  ) 


export default Navigation;