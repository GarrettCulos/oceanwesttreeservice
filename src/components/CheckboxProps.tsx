import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from '@atlaskit/checkbox';

function checkCheckbox(state: any, action: { type: boolean }) {
  switch (action.type) {
    case true:
      return { check: false };
    case false:
      return { check: true };
    default:
      return { check: false };
  }
}

/**
 * Checkbox using Atlaskit that returns a change in the check status (true/false)
 * @param props
 * @param props.label The words to the right of the checkbox
 * @param props.toggle True/false toggle of the initial checkbox status
 * @param props.toggleStatus Function of parent that sets the new toggle status
 */
const CheckboxProps = (props: any) => {
  const attachmentCheckbox = { check: props.toggle };
  const [checkboxesState, checkboxesDispatch] = useReducer(checkCheckbox, attachmentCheckbox);

  return (
    <Checkbox
      isChecked={checkboxesState.check}
      onChange={() => {
        checkboxesDispatch({ type: checkboxesState.check });
        props.toggleStatus(!checkboxesState.check);
      }}
      label={props.label}
    />
  );
};

CheckboxProps.propTypes = {
  label: PropTypes.string,
  toggle: PropTypes.bool,
  toggleStatus: PropTypes.func
};

CheckboxProps.defaultProps = {
  label: '',
  toggle: false,
  toggleStatus: () => {}
};

export default CheckboxProps;
