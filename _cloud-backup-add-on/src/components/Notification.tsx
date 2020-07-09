import React from 'react';
import PropTypes from 'prop-types';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';

const Notification = props => {
  return (
    <ModalTransition>
      <Modal actions={props.alertPrompt} onClose={props.close(props.isOpen)} heading={props.tag}></Modal>
    </ModalTransition>
  );
};

Notification.propTypes = {
  alertPrompt: PropTypes.object,
  close: PropTypes.func,
  isOpen: PropTypes.bool,
  tag: PropTypes.string
};

Notification.defaultProps = {
  alertPrompt: [
    { text: 'Yes', onClick: () => {} },
    { text: 'No', onClick: () => {} }
  ],
  close: (isOpen: boolean) => {},
  isOpen: false,
  tag: ''
};

export default Notification;
