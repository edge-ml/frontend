import React, { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import './Navbar.css';
import { PopoverBody, Button, Popover } from 'reactstrap';
import { AuthContext } from '../../AuthProvider';
import UserSettingsModal from '../UserSettingsModal/UserSettingsModal';
import useAuth from '../../Hooks/useAuth';
import useUserStore from '../../Hooks/useUser';

const NavbarUserSettings = () => {
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [userSettingsModalOpen, setUserSettingsModalOpen] = useState(false);

  const { logout } = useAuth();
  const { user } = useUserStore();

  const toggleUserPopOver = () => {
    setUserPopoverOpen(!userPopoverOpen);
  };

  const toggleUserSettingsModal = () => {
    setUserSettingsModalOpen(!userSettingsModalOpen);
  };

  return (
    <>
      <div
        id="userProfileSettings"
        className="d-flex flex-row justify-content-center navbar-project-item align-items-center pt-3 pb-3 w-100"
        onClick={toggleUserPopOver}
      >
        <Popover
          target="userProfileSettings"
          placement="right"
          isOpen={userPopoverOpen}
        >
          <PopoverBody>
            <div className="d-flex justify-content-center align-items-center flex-column">
              <div className="m-2 w-100">
                <Button
                  className="w-100"
                  color="primary"
                  outline
                  onClick={toggleUserSettingsModal}
                >
                  Settings
                </Button>
              </div>
              <div className="m-2 w-100">
                <Button
                  className="w-100"
                  color="danger"
                  outline
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </PopoverBody>
        </Popover>
        <div
          style={{
            backgroundColor: 'lightgray',
            border: '0px solid darkgray',
            width: '26px',
            height: '26px',
            borderRadius: '13px',
            overflow: 'hidden',
          }}
          className="me-2 d-flex justify-content-center align-items-center"
        >
          <FontAwesomeIcon
            icon={faUser}
            style={{ fontSize: 'x-large', color: 'white' }}
            className="mt-2"
          />
        </div>
        {user.name}
      </div>
      <UserSettingsModal
        isOpen={userSettingsModalOpen}
        onClose={toggleUserSettingsModal}
      ></UserSettingsModal>
    </>
  );
};

export default NavbarUserSettings;
