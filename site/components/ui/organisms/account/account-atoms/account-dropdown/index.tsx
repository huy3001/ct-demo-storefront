import React from 'react';
import LoggedIn from './loggedin';
import LoggedOut from './loggedout';

interface Props {
  loggedIn: boolean;
  onClose?: () => void;
}

const AccountDropdown: React.FC<Props> = ({ loggedIn, onClose }) => {
  return loggedIn ? <LoggedIn onClose={onClose} /> : <LoggedOut onClose={onClose} />;
};

export default AccountDropdown;
