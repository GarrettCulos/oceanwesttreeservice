import React from 'react';
import Notification from '../components/Notification';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Notification'
};

export const noData = () => <Notification />;

noData.story = {
  name: 'Default'
};

const testData = {
  alertPrompt: [
    { text: 'Yes', onClick: action('Yes') },
    { text: 'No', onClick: action('No') }
  ],
  body: 'Test Body Notification',
  close: action('close'),
  header: 'Test Header Notification'
};

export const testNotification = () => <Notification {...testData} />;
