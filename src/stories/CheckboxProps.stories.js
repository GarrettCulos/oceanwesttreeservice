import React from 'react';
import CheckboxProps from '../components/CheckboxProps';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Checkbox Props'
};

const actionsData = {
  toggleStatus: action('toggleStatus')
};

export const noProps = () => <CheckboxProps />;

export const toggleStatusAction = () => <CheckboxProps {...actionsData} />;

export const label = () => <CheckboxProps label={'Testing Label'} {...actionsData} />;

export const startWithTrueToggle = () => <CheckboxProps toggle={true} {...actionsData} />;

export const allProps = () => <CheckboxProps label={'All Props'} toggle={false} {...actionsData} />;
