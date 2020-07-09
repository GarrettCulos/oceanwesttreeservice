import React from 'react';
import PropTypes from 'prop-types';
import Button from '@atlaskit/button';

/**
 * Button using Atlaskit that can run a function when clicked
 * @param props
 * @param props.appearance String options are 'default', 'danger', 'link', 'primary', 'subtle', 'subtle-link', and 'warning'
 * @param props.buttonClicked Function from parent
 * @param props.isDisabled Boolean that sets disabled or not
 * @param props.label Button label
 * @param props.style Button style, i.e. style={{ fontSize: 'large' }}
 */
const ButtonProps = props => {
  return (
    <Button
      style={props.style}
      appearance={props.appearance}
      isDisabled={props.isDisabled}
      onClick={() => props.buttonClicked()}
    >
      {props.label}
    </Button>
  );
};

ButtonProps.propTypes = {
  appearance: PropTypes.string,
  buttonClicked: PropTypes.func,
  isDisabled: PropTypes.bool,
  label: PropTypes.string,
  style: PropTypes.object
};

ButtonProps.defaultProps = {
  appearance: 'primary',
  buttonClicked: () => {},
  isDisabled: false,
  label: '',
  style: {}
};

export default ButtonProps;
