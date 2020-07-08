import React from 'react';
import EditSchedule from '../components/EditSchedule';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Edit Schedule'
};

const actionsData = {
  attachmentSet: action('attachmentSet'),
  backupSchedule: action('backupSchedule'),
  noChange: action('noChange')
};

const scheduleData = {
  attachment: false,
  timeAmount: 2,
  timeUnit: 'days'
};

export const noProps = () => <EditSchedule />;

export const test = () => <EditSchedule {...actionsData} />;
