import React from 'react';
import Icon from '../components/Icon';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Icon'
};

export const noData = () => <Icon />;

export const completed = () => <Icon label={'Completed'} />;

export const deleteIcon = () => <Icon label={'Delete'} />;

deleteIcon.story = {
  name: 'Delete'
};

export const download = () => <Icon label={'Download'} />;

export const errored = () => <Icon label={'Errored'} />;

export const pending = () => <Icon label={'Pending'} />;

export const insertColour = () => {
  return (
    <div>
      <Icon label={'Completed'} colour={'purple'} />
      <Icon label={'Delete'} colour={'green'} />
      <Icon label={'Download'} colour={'blue'} />
      <Icon label={'Errored'} colour={'orange'} />
      <Icon label={'Pending'} colour={'darkRed'} />
    </div>
  );
};
