import React from 'react';
import Table from '../components/Table';
import {
  getColumnKeys,
  cells,
  sortAscendingOrderByKey,
  makeDynamicTableColumns,
  makeDynamicTableRows
} from '../components/Table';

export default {
  title: 'Table'
};

/**
 * Test: No data into table
 */
export const noData = () => <Table />;

/**
 * Test: Columns, rows, and sorting toggle work
 */
const columnKeys = ['one', 'two', 'three'];

const tableData = [
  { one: 'A', two: 'B', three: 'C' },
  { one: 'Hi', two: 'There', three: 'Bye' },
  { one: 'The', two: 'second', three: 'row' }
];

const testingData = {
  columns: {
    cells: [
      { key: columnKeys[0], content: 'One', isSortable: true },
      { key: columnKeys[1], content: 'Two', isSortable: false },
      { key: columnKeys[2], content: 'Three' }
    ]
  },
  rows: tableData.map(index => ({
    cells: [
      { key: columnKeys[0], content: index.one },
      { key: columnKeys[1], content: index.two },
      { key: columnKeys[2], content: index.three }
    ]
  })),
  sortInitialColumnKey: columnKeys[0]
};
getColumnKeys(testingData.columns);
export const test = () => <Table {...testingData} />;

/**
 * Test: Function to make the dynamic table rows
 *       and function to sort rows works.
 */
const outOfOrderRows = [
  { one: 'D', two: 'E', three: 'F' },
  { one: 'A', two: 'Z', three: 'M' },
  { one: 'F', two: 'Q', three: 'R' },
  { one: 'B', two: 'K', three: 'L' },
  { one: 'C', two: 'H', three: 'I' },
  { one: 'E', two: 'N', three: 'O' }
];

const columnContent = ['One', 'Two', 'Three'];

const isSortable = [false, false, false];

const width = [10];

const testFunctionsData = {
  columns: makeDynamicTableColumns(columnKeys, columnContent, isSortable, width),
  rows: makeDynamicTableRows(sortAscendingOrderByKey(outOfOrderRows, columnKeys[0]), columnKeys)
};

export const functionTesting = () => <Table {...testFunctionsData} />;

/**
 * Test: cells function
 */
const columnCells = [
  { key: 1, content: 'One', isSortable: true },
  { key: 'B', content: 'Two', isSortable: true },
  { key: 3, content: 'Three' }
];

const cellData = {
  columns: cells(columnCells),
  rows: [
    cells([
      { key: 1, content: 1 },
      { key: 2, content: 2 },
      { key: 3, content: 3 }
    ]),
    cells([
      { key: 1, content: 4 },
      { key: 2, content: 8 },
      { key: 3, content: 16 }
    ])
  ]
};

export const cellsFunction = () => <Table {...cellData} />;

/**
 * Test: Non-formatted rows
 */
const nonFormattedRows = [
  { 1: 'A', B: 'B', 3: 'C' },
  { 1: 'Hi', B: 'There', 3: 'Bye' },
  { 1: 'The', B: 'second', 3: 'row' }
];

const nonFormattedCellData = {
  columns: cells(columnCells),
  rows: nonFormattedRows
};

export const nonFormatedRows = () => <Table {...nonFormattedCellData} />;

/**
 * Test: Backup from graphql
 */
class BackupState {
  Pending;
  Completed;
  Errored;
}

class BackupType {
  id; // string
  clientId; // string
  backupDate; // Date
  state; //BackupState
  withAttachments; //boolean
  s3Location; // string
  updatedAt; // Date
  createdAt; // Date
}

const backupColumnKeys = [
  'id',
  'clientId',
  'backupDate',
  'state',
  'withAttachments',
  's3Location',
  'updatedAt',
  'createdAt'
];

const backupColumnHeaders = [
  'Id',
  'Client Id',
  'Backup Date',
  'State',
  'With Attachments',
  'S3 Location',
  'Updated At',
  'Created At'
];

const backupIsSortable = [false, false, false, false, false, false, false, false];

const backupRow = new BackupType();
backupRow.id = 'test';
backupRow.clientId = 'testClient';
backupRow.backupDate = '2020-07-07'; //new Date(2020, 7, 7);
backupRow.state = 'Pending'; //new BackupState('Pending');
backupRow.withAttachments = false;
backupRow.s3Location = 'test location';
backupRow.updatedAt = '2020-07-08'; //new Date(2020, 7, 8);
backupRow.createdAt = '2020-07-06'; //new Date(2020, 7, 6);

const backupRowList = [backupRow, backupRow];

const backupData = {
  columns: makeDynamicTableColumns(backupColumnKeys, backupColumnHeaders, backupIsSortable),
  rows: makeDynamicTableRows(backupRowList, backupColumnKeys)
};

export const backupTest = () => <Table {...backupData} />;

/**
 * Test: Backup test not formatted row
 */
const backupNoFormattedRowsData = {
  columns: makeDynamicTableColumns(backupColumnKeys, backupColumnHeaders, backupIsSortable),
  rows: backupRowList
};

export const backupNoRowFormattingBeforeTest = () => <Table {...backupNoFormattedRowsData} />;
