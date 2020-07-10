import React from 'react';
import { linkTo } from '@storybook/addon-links';
import { Welcome } from '@storybook/react/demo';
import ButtonProps from '../components/ButtonProps';
import CheckboxProps from '../components/CheckboxProps';
import EditSchedule from '../components/EditSchedule';
import Icon from '../components/Icon';
import Table from '../components/Table';
import { cells } from '../components/Table';
import { action } from '@storybook/addon-actions';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';

export default {
  title: 'Welcome'
};

export const toStorybook = () => <Welcome showApp={linkTo('Button')} />;

toStorybook.story = {
  name: 'to Storybook'
};

const columnHeaders = [
  { key: 'date', content: 'Date', isSortable: true },
  { key: 'status', content: 'Status', isSortable: false },
  { key: 'size', content: 'Size' },
  { key: 'option', content: 'Option' }
];

class RowType {
  date;
  status;
  size;
  option;
}

const row1 = new RowType();
row1.date = new Date().toString();
row1.status = <Icon label={'Pending'} />;
row1.size = '12KB';
row1.option = (
  <div className="row" style={{ display: 'flex' }}>
    <div className="column" style={{ width: '50%' }}>
      <Icon label={''} />
    </div>
    <div className="column" style={{ width: '50%' }}>
      <Icon label={'Delete'} />
    </div>
  </div>
);

const row2 = new RowType();
row2.date = new Date(2020, 6, 8, 14).toString();
row2.status = <Icon label={'Completed'} />;
row2.size = '3KB';
row2.option = (
  <div className="row" style={{ display: 'flex' }}>
    <div className="column" style={{ width: '50%' }}>
      <Icon label={'Download'} />
    </div>
    <div className="column" style={{ width: '50%' }}>
      <Icon label={'Delete'} />
    </div>
  </div>
);

const row3 = new RowType();
row3.date = new Date(2020, 6, 9, 14).toString();
row3.status = <Icon label={'Errored'} />;
row3.size = '2KB';
row3.option = (
  <div className="row" style={{ display: 'flex' }}>
    <div className="column" style={{ width: '50%' }}></div>
    <div className="column" style={{ width: '50%' }}>
      <Icon label={'Delete'} />
    </div>
  </div>
);

const rows = [row1, row2, row3];

//To toggle edit button: <ButtonProps label={"Edit Schedule"} buttonClicked={() => {isOpen = !isOpen;}} />
export const toTestComponentsEditClosed = () => (
  <div>
    <ButtonProps label={'Edit Schedule'} buttonClicked={action('buttonClicked')} />
    <ButtonProps label={'Create Cloud Backup'} style={{ marginLeft: '15px' }} buttonClicked={action('buttonClicked')} />
    <div style={{ display: 'inline-block' }}>
      <CheckboxProps label={'Enabled Scheduled backup'} toggleStatus={action('toggleStatus')} />
    </div>
    {false && <EditSchedule />}
    <Table columns={cells(columnHeaders)} rows={rows} />
  </div>
);

toTestComponentsEditClosed.story = {
  name: 'to testing the components (Edit is closed)'
};

export const toTestComponentsEditOpen = () => (
  <div>
    <ButtonProps label={'Edit Schedule'} buttonClicked={action('buttonClicked')} />
    <ButtonProps label={'Create Cloud Backup'} style={{ marginLeft: '15px' }} buttonClicked={action('buttonClicked')} />
    <div style={{ display: 'inline-block' }}>
      <CheckboxProps label={'Enabled Scheduled backup'} toggleStatus={action('toggleStatus')} />
    </div>
    {true && (
      <EditSchedule
        attachmentSet={action('attachmentSet')}
        backupSchedule={action('backupSchedule')}
        noChange={action('noChange')}
      />
    )}
    <Table columns={cells(columnHeaders)} rows={rows} />
  </div>
);

toTestComponentsEditOpen.story = {
  name: 'to testing the components (Edit is open)'
};
