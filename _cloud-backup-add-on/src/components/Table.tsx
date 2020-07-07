import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import DynamicTable from '@atlaskit/dynamic-table';

/**
 * Sorts the list of rows by the given column key in ascending order
 * @param rows List of rows, i.e. [ { column1: content, column2: content... }, ... ]
 * @param columnKey List of column keys, i.e. [ 'column1', 'column2', ... ]
 * @returns {}[]
 */
export function sortByKey(rows: {}[], columnKey: any) {
    try {
        const sortedRows = rows.sort((a, b) => (a[columnKey] > b[columnKey] ? 1 : -1));
        return sortedRows;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

/**
 * Checks the column.cells and takes the keys in order of the column
 * @param columns columns.cells[ { key: key1, ... }, { key: key2,... }, ... ]
 * @returns any[]
 */
export function getColumnKeys(columns: any) {
    try {
        if (columns.cells) {
            let keys: any = [];
            keys = [];
            columns.cells.forEach(column => {
                keys.push(`${column.key}`);
            });
            return keys;
        } else {
            throw new Error('Column does not match dynamic table standards!');
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}

/**
 * Gets the index of the matching column key.
 * If there is no match, returns -1.
 * @param key 
 * @param columns columns.cells[ { key: key1, ... }, { key: key2,... }, ... ]
 * @returns number
 */
export function getColumnKeyIndex(key, columns) {
    try {
        if (columns.cells) {
            for (let i = 0; i < columns.cells.length; i++) {
                if (`${columns.cells[i].key}` === `${key}`) {
                    return i;
                }
            }
            return -1;
        } else {
            throw new Error('Columns do not exist!');
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}

/**
 * Wraps data in cells: { cells: data }
 * @param data
 */
export function cells(data: {}[] | any) {
    return { cells: data };
}

/**
 * Make the head columns for a table by matching position in arrays.
 * @param columnKeys List of column keys, i.e. [ 'column1', 'column2', 'column 3', ... ]
 * @param columnContent List of data in the columns, i.e. ['Column 1', <button>Second Column</button>, 3, ... ]
 * @param isSortable List of which column is sortable, i.e [ false, true, false, ... ]
 * @returns [] List of { key: columnKeys[i], content: columnContent[i], isSortable: isSortable[i] }
 */
export function makeDynamicTableColumns(
    columnKeys: any[],
    columnContent: any[],
    isSortable: boolean[],
    width?: any[] | undefined
) {
    if (
        columnKeys.length !== columnContent.length ||
        columnKeys.length !== isSortable.length ||
        columnContent.length !== isSortable.length
    ) {
        throw new Error('Array data cannot be matched because not all arrays are the same length!');
    }
    let columnHeaders = [{}];
    columnHeaders = [];
    for (let i = 0; i < columnKeys.length; i++) {
        if (width) {
            columnHeaders.push({
                key: columnKeys[i],
                content: columnContent[i],
                isSortable: isSortable[i],
                width: width[i] ? width[i] : undefined
            });
        } else {
            columnHeaders.push({ key: columnKeys[i], content: columnContent[i], isSortable: isSortable[i] });
        }
    }
    const dynamicTableColumns = cells(columnHeaders);
    return dynamicTableColumns;
}

/**
 * Makes the layout used for the body (rows) of a dynamic table.
 * @param rows List of rows, i.e. [ { column1: content, column2: content... }, ... ]
 * @param columnKeys List of column keys, i.e. [ 'column1', 'column2', ... ]
 * @returns {}[]
 */
export function makeDynamicTableRows(rows: any[], columnKeys: any[]) {
    try {
        let dynamicTableRows: any = [];
        let rowData: any = [];
        rows.forEach(index => {
            rowData = [];
            columnKeys.forEach(column => {
                rowData.push({ key: column, content: index[column] });
            });
            const row = cells(rowData);
            dynamicTableRows.push(row);
        });
        return dynamicTableRows;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

/**
 * Requires the rows be sorted beforehand
 * @param param0
 * @param columns
 * @param loadingSpinnerSize
 * @param rows
 * @param rowsPerPage
 * @param sortInitialColumnKey
 */
const Table = ({ columns, rows, rowsPerPage, loadingSpinnerSize, sortInitialColumnKey }) => {
    if (rows && rows[0] && !rows[0].cells) {
        if (sortInitialColumnKey) {
            rows = makeDynamicTableRows(sortByKey(rows, sortInitialColumnKey), getColumnKeys(columns));
        } else {
            rows = makeDynamicTableRows(rows, getColumnKeys(columns));
        }
    }

    const [defaultPageNumber, setDefaultPageNumber] = useState(1);
    const [sortKey, setSortKey] = useState(sortInitialColumnKey);
    const ascending: any = 'ASC';
    const [sortOrder, setSortOrder] = useState(ascending);
    const [rowsData, setRows] = useState(rows);

    const updatePageNumber = useCallback((page: any) => {
        setDefaultPageNumber(page);
    }, []);

    const tableSortSettings = useCallback(
        data => {
            const cellIndex = getColumnKeyIndex(data.key, columns);
            if (data.sortOrder === 'ASC' && cellIndex !== -1) {
                setRows(rowsData.sort((a, b) => (a.cells[cellIndex].content > b.cells[cellIndex].content ? 1 : -1)));
            } else if (data.sortOrder === 'DESC' && cellIndex !== -1) {
                setRows(rowsData.sort((a, b) => (a.cells[cellIndex].content < b.cells[cellIndex].content ? 1 : -1)));
            }
            setSortKey(data.key);
            setSortOrder(data.sortOrder);
        },
        [columns, rowsData]
    );

    if (!columns) {
        return (
            <div>
                <DynamicTable
                    rows={rowsData}
                    rowsPerPage={rowsPerPage}
                    loadingSpinnerSize={loadingSpinnerSize}
                    page={defaultPageNumber}
                    onSetPage={page => updatePageNumber(page)}
                ></DynamicTable>
            </div>
        );
    } else if (!rows) {
        return (
            <div>
                <DynamicTable head={columns} loadingSpinnerSize={loadingSpinnerSize}></DynamicTable>
            </div>
        );
    } else {
        return (
            <div>
                <DynamicTable
                    head={columns}
                    rows={rowsData}
                    rowsPerPage={rowsPerPage}
                    loadingSpinnerSize={loadingSpinnerSize}
                    defaultSortKey={sortKey}
                    defaultSortOrder={sortOrder}
                    page={defaultPageNumber}
                    onSetPage={page => updatePageNumber(page)}
                    onSort={data => tableSortSettings(data)}
                ></DynamicTable>
            </div>
        );
    }
};

Table.propTypes = {
    columns: PropTypes.object,
    rows: PropTypes.array,
    rowsPerPage: PropTypes.number,
    loadingSpinnerSize: PropTypes.string,
    sortInitialColumnKey: PropTypes.string
};

Table.defaultProps = {
    columns: undefined,
    rows: undefined,
    rowsPerPage: undefined,
    loadingSpinnerSize: undefined,
    sortInitialColumnKey: undefined
};

export default Table;
