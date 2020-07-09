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

export const actionsOnly = () => <EditSchedule {...actionsData} />;

export const attachmentTruePreset = () => <EditSchedule attachment={true} />;

export const hours = () => <EditSchedule {...actionsData} attachment={false} timeAmount={52} timeUnit={'hours'} />;

export const days = () => <EditSchedule {...actionsData} {...scheduleData} />;

export const weeks = () => <EditSchedule {...actionsData} attachment={false} timeAmount={3} timeUnit={'weeks'} />;

export const months = () => <EditSchedule {...actionsData} attachment={false} timeAmount={12} timeUnit={'months'} />;

export const years = () => <EditSchedule {...actionsData} attachment={false} timeAmount={1} timeUnit={'years'} />;

export const disableAcceptButton = () => (
  <EditSchedule {...actionsData} attachment={false} timeAmount={1} timeUnit={'hours'} />
);
