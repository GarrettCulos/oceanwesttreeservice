import React from 'react';
import ButtonProps from '../components/Button';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Button Props'
};

const actionsData = {
  buttonClicked: action('buttonClicked')
};

const buttonData = {
  appearance: 'primary',
  isDisabled: false,
  label: 'Button',
  style: { marginLeft: '15px', fontSize: 'large' }
};

export const noProps = () => <ButtonProps />;

export const PressButtonActions = () => <ButtonProps {...actionsData} {...buttonData} />;

export const isDisabled = () => <ButtonProps {...actionsData} {...buttonData} isDisabled={true} />;
