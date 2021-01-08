import React from 'react';
import PropTypes from 'prop-types';
import AtlassianButton, { ButtonProps } from '@atlaskit/button';

interface BProps extends ButtonProps {}
const Button = (props: BProps) => {
  return (
    <AtlassianButton
      {...props}
      style={props.style}
      appearance={props.appearance}
      isDisabled={props.isDisabled}
      onClick={props.onClick ? props.onClick : undefined}
    >
      {props.label || props.children}
    </AtlassianButton>
  );
};

Button.propTypes = {
  appearance: PropTypes.string,
  buttonClicked: PropTypes.func,
  isDisabled: PropTypes.bool,
  label: PropTypes.string,
  style: PropTypes.object
};

Button.defaultProps = {
  appearance: 'primary',
  onClick: () => {},
  isDisabled: false,
  label: '',
  style: {}
};

export default Button;
