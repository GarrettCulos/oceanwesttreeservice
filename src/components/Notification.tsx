import React from 'react';
import PropTypes from 'prop-types';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';

/**
 * Notification using Atlaskit's ModalTransition and Modal
 * @param props
 * @param props.alertPrompt The buttons of the prompt, i.e. alertPrompt: [ { text: 'Yes', onClick: () => {} }, { text: 'No', onClick: () => {} } ]
 * @param props.body Body of the prompt
 * @param props.close Parent function of what to do when the prompt closes.
 * @param props.header Heading of the prompt
 */
const Notification = (props: any) => {
  return (
    <ModalTransition>
      <Modal actions={props.alertPrompt} onClose={props.close()} heading={props.header}>
        {props.body}
      </Modal>
    </ModalTransition>
  );
};

Notification.propTypes = {
  alertPrompt: PropTypes.object,
  body: PropTypes.string,
  close: PropTypes.func,
  header: PropTypes.string
};

Notification.defaultProps = {
  alertPrompt: [
    { text: 'Yes', onClick: () => {} },
    { text: 'No', onClick: () => {} }
  ],
  body: '',
  close: () => {},
  header: ''
};

export default Notification;
