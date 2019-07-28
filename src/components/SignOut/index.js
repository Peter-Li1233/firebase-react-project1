import React from "react";
import { withFirebase } from '../Firebase';

const SignOutButton = (props) => (
  <button type="button" className={ props.className } onClick={ props.firebase.doSignOut }>
      Sign Out
  </button>
);

export default withFirebase(SignOutButton);