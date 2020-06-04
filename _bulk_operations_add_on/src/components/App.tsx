import React, { useEffect, useState, useCallback, useReducer } from 'react';
import styled from 'styled-components';
import reqService from '../services/request';
import DynamicTable from '@atlaskit/dynamic-table';
import { Project } from '../table/project-table';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import Select from '@atlaskit/select';
import { Checkbox } from '@atlaskit/checkbox';
import Button from '@atlaskit/button';

const AppContainer = styled.div`
  height: auto;
  width: auto;
  padding-left: 5rem;
  padding-right: 5rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

const Avatar = styled.img`
  width: 24px;
  height: 24px;
`;

const TableStyle = styled.div`
  width: 100%;
`;

function updateCheckedBoxes(checkboxesState, action: { type: string; payload: any }) {
  switch (action.type) {
    case 'toggleKey': {
      if (checkboxesState.check.includes(action.payload.key)) {
        return { ...checkboxesState, check: checkboxesState.check.filter(key => key !== action.payload.key) };
      } else {
        return { ...checkboxesState, check: [...checkboxesState.check, action.payload.key] };
      }
    }
    case 'selectAll': {
      if (checkboxesState.check.includes(action.payload.key)) {
        return checkboxesState;
      } else {
        return { ...checkboxesState, check: [...checkboxesState.check, action.payload.key] };
      }
    }
    case 'deselect': {
      if (checkboxesState.check.includes(action.payload.key)) {
        return { ...checkboxesState, check: checkboxesState.check.filter(key => key !== action.payload.key) };
      } else {
        return checkboxesState;
      }
    }
    case 'reset': {
      return { check: [] };
    }
    default:
      return checkboxesState;
  }
}

function headerCheckbox(tableHeadState, action: { type: boolean }) {
  switch (action.type) {
    case true:
      return { check: false };
    case false:
      return { check: true };
    default:
      return { check: false };
  }
}

const App: React.FC = () => {
  console.log('App start!');

  const noCheckmarks = { check: [] };
  const [checkboxesState, checkboxesDispatch] = useReducer(updateCheckedBoxes, noCheckmarks);
  const headCheckbox = { check: false };
  const [tableHeadState, tableHeadDispatch] = useReducer(headerCheckbox, headCheckbox);

  const [requestData, setRequestData] = useState();

  const [defaultPageNumber, setDefaultPageNumber] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState(undefined);

  const [openDeleteAllAlert, setDeleteAllAlert] = useState(false);
  const [openDeleteAllSuccessAlert, setDeleteAllSuccessAlert] = useState(false);

  const [openDeleteSelectedAlert, setDeleteSelectedAlert] = useState(false);
  const [openDeleteSelectedSuccessAlert, setDeleteSelectedSuccessAlert] = useState(false);

  const [openDeleteButtonAlert, setDeleteButtonAlert] = useState(false);
  const [openDeleteButtonSuccessAlert, setDeleteButtonSuccessAlert] = useState(false);
  const [openDeleteButtonAlertKey, setDeleteButtonAlertKey] = useState();

  const [searchKey, setSearchKey]: [any, Function] = useState();
  const [searchResultOptions, setSearchResultOptions] = useState();
  const [searchBoxInput, setSearchBoxInput] = useState();
  const [isSearching, setIsSearching] = useState(false);

  const searchKeyOptionsArray = ['Name', 'Key', 'ID', 'Project Lead'];
  const searchSelectOptionsArray = [
    { label: 'Name', value: 'Name' },
    { label: 'Key', value: 'Key' },
    { label: 'ID', value: 'ID' },
    { label: 'Project Lead', value: 'Project Lead' }
  ];

  useEffect(() => {
    reqService.jiraRequest({ path: '/rest/api/3/project?expand=lead', type: 'GET' }).then(
      (data: any) => {
        setRequestData(data);
        setSearchKey('Name');
        const mapping: any = data;
        setSearchResultOptions(
          mapping.map(row => ({
            label: row.name,
            value: row.name
          }))
        );
        const ascending: any = 'ASC';
        setSortOrder(ascending);
      },
      reason => {}
    );
  }, []);

  const deleteChosenProject = useCallback((key: string | number, searchKey, searchKeyOptionsArray) => {
    reqService.jiraRequest({ path: `/rest/api/3/project/${key}`, type: 'DELETE' }).then(
      value => {
        reqService.jiraRequest({ path: '/rest/api/3/project?expand=lead', type: 'GET' }).then(
          (data: any) => {
            checkboxesDispatch({ type: 'deselect', payload: { key } });
            setRequestData(data);
            const mapping: any = data;
            switch (searchKeyOptionsArray.indexOf(searchKey)) {
              case 0: {
                setSearchResultOptions(
                  mapping.map(row => ({
                    label: row.name,
                    value: row.name
                  }))
                );
                break;
              }
              case 1: {
                setSearchResultOptions(
                  mapping.map(row => ({
                    label: row.key,
                    value: row.key
                  }))
                );
                break;
              }
              case 2: {
                setSearchResultOptions(
                  mapping.map(row => ({
                    label: row.id,
                    value: row.id
                  }))
                );
                break;
              }
              case 3: {
                const options = mapping.map(row => row.lead.displayName);
                const reducedOption = options.reduce(
                  (unique, item) => (unique.includes(item) ? unique : [...unique, item]),
                  []
                );
                const finalOption = reducedOption.map(row => ({
                  label: row,
                  value: row
                }));
                setSearchResultOptions(finalOption);
                break;
              }
              default:
                break;
            }
            setDeleteButtonAlert(false);
            setDeleteButtonSuccessAlert(true);
          },
          reason => {}
        );
      },
      reason => {}
    );
  }, []);

  const deleteAllProjects = useCallback((data, searchKey, searchKeyOptionsArray) => {
    const promises: any = [];
    for (let i = 0; i < data.length; i++) {
      const promiseRequest = reqService
        .jiraRequest({ path: `/rest/api/3/project/${data[i].cells[3].key}`, type: 'DELETE' })
        .then(
          value => {},
          reason => {}
        );
      promises.push(promiseRequest);
    }
    Promise.all(promises).then(
      value => {
        reqService.jiraRequest({ path: '/rest/api/3/project?expand=lead', type: 'GET' }).then(
          (data: any) => {
            checkboxesDispatch({ type: 'reset', payload: { undefined } });
            setRequestData(data);
            setDeleteAllAlert(false);
            setDeleteAllSuccessAlert(true);
            const mapping: any = data;
            switch (searchKeyOptionsArray.indexOf(searchKey)) {
              case 0: {
                setSearchResultOptions(
                  mapping.map(row => ({
                    label: row.name,
                    value: row.name
                  }))
                );
                break;
              }
              case 1: {
                setSearchResultOptions(
                  mapping.map(row => ({
                    label: row.key,
                    value: row.key
                  }))
                );
                break;
              }
              case 2: {
                setSearchResultOptions(
                  mapping.map(row => ({
                    label: row.id,
                    value: row.id
                  }))
                );
                break;
              }
              case 3: {
                const options = mapping.map(row => row.lead.displayName);
                const reducedOption = options.reduce(
                  (unique, item) => (unique.includes(item) ? unique : [...unique, item]),
                  []
                );
                const finalOption = reducedOption.map(row => ({
                  label: row,
                  value: row
                }));
                setSearchResultOptions(finalOption);
                break;
              }
              default:
                break;
            }
          },
          reason => {}
        );
      },
      reason => {}
    );
  }, []);

  const handleOptionChange = useCallback((newOption, rows, isSearching, searchKey, searchKeyOptionsArray) => {
    if (isSearching) {
      tableHeadDispatch({ type: true });
    }
    if (searchKey !== newOption.label) {
      setSearchKey(newOption.label);
    }
    if (newOption.label === searchKeyOptionsArray[0]) {
      setSearchResultOptions(
        rows.map(row => ({
          label: row.name,
          value: row.name
        }))
      );
    } else if (newOption.label === searchKeyOptionsArray[1]) {
      setSearchResultOptions(
        rows.map(row => ({
          label: row.key,
          value: row.key
        }))
      );
    } else if (newOption.label === searchKeyOptionsArray[2]) {
      setSearchResultOptions(
        rows.map(row => ({
          label: row.id,
          value: row.id
        }))
      );
    } else if (newOption.label === searchKeyOptionsArray[3]) {
      const options = rows.map(row => row.lead.displayName);
      const reducedOption = options.reduce((unique, item) => (unique.includes(item) ? unique : [...unique, item]), []);
      const finalOption = reducedOption.map(row => ({
        label: row,
        value: row
      }));
      setSearchResultOptions(finalOption);
    }
  }, []);

  const handleSearchboxInputChange = useCallback(newInput => {
    if (newInput && newInput !== undefined && newInput !== '') {
      if (newInput.label) {
        setSearchBoxInput(newInput.label);
      } else {
        setSearchBoxInput(newInput);
      }
    }
  }, []);

  const handleNewSearchTerm = useCallback(newInput => {
    if (newInput && newInput !== undefined && newInput !== '') {
      if (newInput.label) {
        setSearchBoxInput(newInput.label);
      } else {
        setSearchBoxInput(newInput);
      }
      setIsSearching(true);
      setDefaultPageNumber(1);
      tableHeadDispatch({ type: true });
    }
  }, []);

  const handleResetSearch = useCallback(() => {
    setSearchBoxInput(undefined);
    setIsSearching(false);
    setDefaultPageNumber(1);
    tableHeadDispatch({ type: true });
  }, []);

  const toggleCheckbox = (key: string) => {
    checkboxesDispatch({ type: 'toggleKey', payload: { key } });
    if (checkboxesState.check.includes(key)) {
      tableHeadDispatch({ type: true });
    }
  };

  const checkMarks = rows => {
    rows.forEach(element => {
      const key = element.cells[3].key;
      checkboxesDispatch({ type: 'selectAll', payload: { key } });
    });
  };

  const uncheckMarks = useCallback(rows => {
    rows.forEach(element => {
      const key = element.cells[3].key;
      checkboxesDispatch({ type: 'deselect', payload: { key } });
    });
  }, []);

  const deleteCheckmarkedProjects = (searchKey: string, searchKeyOptionsArray) => {
    setDeleteButtonAlertKey(undefined);
    checkboxesState.check.forEach(key => {
      deleteChosenProject(key, searchKey, searchKeyOptionsArray);
      checkboxesDispatch({ type: 'deselect', payload: { key } });
    });
    setDeleteSelectedAlert(false);
    setDeleteSelectedSuccessAlert(true);
    tableHeadDispatch({ type: true });
  };

  const selectAllButton = rows => {
    tableHeadDispatch({ type: tableHeadState.check });
    switch (tableHeadState.check) {
      case false:
        checkMarks(rows);
        break;
      case true:
        uncheckMarks(rows);
        break;
      default:
        uncheckMarks(rows);
        break;
    }
  };

  const pageMustBeChanged = useCallback(pageNumber => {
    setDefaultPageNumber(pageNumber);
  }, []);

  const handleDeleteAllOptionOpen = useCallback(() => {
    setDeleteAllAlert(true);
  }, []);

  const handleCloseDeleteAllOption = useCallback(() => {
    setDeleteAllAlert(false);
  }, []);

  const handleCloseDeleteAllSuccessOption = useCallback(() => {
    setDeleteAllSuccessAlert(false);
  }, []);

  const handleDeleteSelectedOptionOpen = useCallback(() => {
    setDeleteSelectedAlert(true);
  }, []);

  const handleCloseDeleteSelectedOption = useCallback(() => {
    setDeleteSelectedAlert(false);
    setDeleteButtonSuccessAlert(false);
    setDeleteButtonAlertKey(undefined);
  }, []);

  const handleCloseDeleteSelectedSuccessOption = useCallback(() => {
    setDeleteSelectedSuccessAlert(false);
    setDeleteButtonSuccessAlert(false);
    setDeleteButtonAlertKey(undefined);
  }, []);

  const handleDeleteButtonOptionOpen = useCallback(projectKey => {
    setDeleteButtonSuccessAlert(false);
    setDeleteButtonAlert(true);
    setDeleteButtonAlertKey(projectKey);
  }, []);

  const handleCloseDeleteButtonOption = useCallback(() => {
    setDeleteButtonAlert(false);
    setDeleteButtonAlertKey(undefined);
  }, []);

  const handleCloseDeleteButtonSuccessOption = useCallback(() => {
    setDeleteButtonAlertKey(undefined);
    setDeleteButtonSuccessAlert(false);
  }, []);

  const createRows = requestDataInterface => {
    const projectContent = (key, value) => {
      switch (key) {
        case 'lead':
          return value.displayName;
        case 'avatarUrls':
          return <Avatar src={value['24x24']} />;
        default:
          return typeof value !== 'object' ? `${value}` : '';
      }
    };
    let rows = [];
    if (requestDataInterface && typeof requestDataInterface !== undefined) {
      rows = requestDataInterface.map((project: Project, index: number) => ({
        cells: [
          {
            key: 'checkbox',
            content: (
              <Checkbox
                onChange={() => toggleCheckbox(`${project.key}`)}
                isChecked={checkboxesState.check.includes(project.key)}
              />
            )
          },
          {
            key: 'avatarUrls',
            content: projectContent('avatarUrls', project.avatarUrls)
          },
          {
            key: project.name,
            content: project.name
          },
          {
            key: project.key,
            content: project.key
          },
          {
            key: project.id,
            content: project.id
          },
          {
            key: project.lead,
            content: projectContent('lead', project.lead)
          },
          {
            key: 'deleteButton',
            content: (
              <div>
                <Button
                  style={{ fontSize: '14px', fontWeight: 'bold', borderColor: 'black !important', borderWidth: 'thin' }}
                  onClick={() => handleDeleteButtonOptionOpen(project.key)}
                >
                  Delete
                </Button>
                <ModalTransition>
                  {openDeleteButtonAlert && openDeleteButtonAlertKey === project.key && (
                    <Modal
                      actions={[
                        {
                          text: 'Yes',
                          onClick: () => deleteChosenProject(project.key, searchKey, searchKeyOptionsArray)
                        },
                        { text: 'No', onClick: handleCloseDeleteButtonOption }
                      ]}
                      onClose={handleCloseDeleteButtonOption}
                      heading={`Are you sure you want to delete the project: ${project.name}?`}
                    />
                  )}
                </ModalTransition>
              </div>
            )
          }
        ]
      }));
    }
    return rows;
  };
  const checkSearchOrNotRows = (
    searching,
    requestDataInterface,
    searchboxFilter,
    searchKey,
    pageNumber,
    amountPerPage
  ) => {
    if (searching) {
      let checkedboxesArray: any[] = [];
      checkboxesState.check.forEach(key => {
        checkedboxesArray = [...checkedboxesArray, ...requestDataInterface.filter(item => item.key === key)];
      });
      let filteredArray: any[];
      switch (searchKeyOptionsArray.indexOf(searchKey)) {
        case 0:
          filteredArray = requestDataInterface.filter(item => item.name === searchboxFilter);
          break;
        case 1:
          filteredArray = requestDataInterface.filter(item => item.key === searchboxFilter);
          break;
        case 2:
          filteredArray = requestDataInterface.filter(item => item.id === searchboxFilter);
          break;
        case 3:
          filteredArray = requestDataInterface.filter(item => item.lead.displayName === searchboxFilter);
          break;
        default:
          return createRows(requestDataInterface);
      }
      const finalArray = [...filteredArray, ...checkedboxesArray].reduce(
        (unique, item) => (unique.includes(item) ? unique : [...unique, item]),
        []
      );
      if (
        finalArray.length <= (pageNumber - 1) * amountPerPage &&
        pageNumber !== Math.floor(finalArray.length / amountPerPage) &&
        pageNumber !== 1
      ) {
        pageMustBeChanged(pageNumber - 1);
      }
      return createRows(finalArray);
    } else {
      return createRows(requestDataInterface);
    }
  };

  const createdHeaderRow = (withWidth: boolean, rows: any) => {
    return {
      cells: [
        {
          key: 'checkbox',
          content: <Checkbox onChange={() => selectAllButton(rows)} isChecked={tableHeadState.check} />,
          isSortable: false,
          width: withWidth ? 1 : undefined
        },
        {
          key: 'avatarUrls',
          content: '',
          isSortable: false,
          width: withWidth ? 1 : undefined
        },
        {
          key: 'name',
          content: 'Name',
          isSortable: true,
          width: withWidth ? 10 : undefined
        },
        {
          key: 'key',
          content: 'Key',
          isSortable: true,
          width: withWidth ? 10 : undefined
        },
        {
          key: 'id',
          content: 'ID',
          isSortable: true,
          width: withWidth ? 10 : undefined
        },
        {
          key: 'lead',
          content: 'Project Lead',
          isSortable: false,
          width: withWidth ? 10 : undefined
        },
        {
          key: 'delete',
          content: '',
          isSortable: false,
          width: withWidth ? 5 : undefined
        }
      ]
    };
  };

  const handleRowAmountChange = useCallback(value => {
    try {
      setRowsPerPage(parseInt(value.value));
      setDefaultPageNumber(1);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const tableSortSettings = useCallback(data => {
    setSortKey(data.key);
    setSortOrder(data.sortOrder);
  }, []);

  const updatePageNumber = useCallback((page: any) => {
    setDefaultPageNumber(page);
  }, []);

  // console.log(checkboxesState.check);

  const rows = checkSearchOrNotRows(
    isSearching,
    requestData,
    searchBoxInput,
    searchKey,
    defaultPageNumber,
    rowsPerPage
  );
  const head = createdHeaderRow(true, rows);
  const rowsPerPageOptions = [
    { label: 10, value: 10 },
    { label: 20, value: 20 },
    { label: 30, value: 30 },
    { label: 40, value: 40 },
    { label: 50, value: 50 }
  ];

  const alertDeleteAllPrompt = [
    { text: 'Yes', onClick: () => deleteAllProjects(rows, searchKey, searchKeyOptionsArray) },
    { text: 'No', onClick: handleCloseDeleteAllOption }
  ];
  const alertDeleteAllSuccess = [{ text: 'OK', onClick: handleCloseDeleteAllSuccessOption }];
  const alertDeleteSelectedPrompt = [
    { text: 'Yes', onClick: () => deleteCheckmarkedProjects(searchKey || '', searchKeyOptionsArray) },
    { text: 'No', onClick: handleCloseDeleteSelectedOption }
  ];
  const alertDeleteSelectedSuccess = [{ text: 'OK', onClick: handleCloseDeleteSelectedSuccessOption }];

  return (
    <AppContainer>
      <h1>List of Projects</h1>

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <label style={{ fontSize: '24px' }}>Search for Project(s): </label>

        <div style={{ display: 'inline-block', width: '15%' }}>
          <Select
            className="search-select"
            defaultValue={searchSelectOptionsArray[0]}
            options={searchSelectOptionsArray}
            onChange={e => handleOptionChange(e, requestData, isSearching, searchKey, searchKeyOptionsArray)}
          />
        </div>

        <div style={{ display: 'inline-block', width: '30%', marginLeft: '5px' }}>
          <Select
            value={!searchBoxInput ? { label: searchBoxInput, value: searchBoxInput } : ''}
            className="single-select"
            classNamePrefix="react-select"
            placeholder="Click and type to begin searching"
            options={searchResultOptions}
            onInputChange={e => handleSearchboxInputChange(e)}
            onChange={e => handleNewSearchTerm(e)}
          />
        </div>

        <Button
          isDisabled={!isSearching}
          style={{ marginLeft: '5px', marginTop: '-4px', fontSize: 'large' }}
          appearance="primary"
          onClick={handleResetSearch}
        >
          Clear search
        </Button>
      </div>

      <div style={{ marginTop: '10px' }}>
        {/* <h2 style={{ fontWeight: "normal" }}>Projects are ordered by: {updateCaption(sortKey)}</h2> */}
        <label style={{ fontSize: '18px' }}>Amount of Projects per Page: </label>
        <div style={{ display: 'inline-block', marginBottom: '10px', width: '10%' }}>
          <Select
            className="search-select"
            defaultValue={rowsPerPageOptions[0]}
            options={rowsPerPageOptions}
            onChange={e => handleRowAmountChange(e)}
          />
        </div>
      </div>

      <TableStyle>
        <DynamicTable
          // caption={`Projects are ordered by ${updateCaption(sortKey)}`}
          head={head}
          rows={rows}
          rowsPerPage={rowsPerPage}
          loadingSpinnerSize="small"
          defaultSortKey={sortKey}
          defaultSortOrder={sortOrder}
          page={defaultPageNumber}
          onSetPage={page => updatePageNumber(page)}
          onSort={data => tableSortSettings(data)}
        ></DynamicTable>
      </TableStyle>

      <ModalTransition>
        {openDeleteButtonSuccessAlert && !openDeleteButtonAlertKey && (
          <Modal
            actions={[{ text: 'OK', onClick: handleCloseDeleteButtonSuccessOption }]}
            onClose={handleCloseDeleteButtonSuccessOption}
            heading={`The project was successfully deleted!`}
          />
        )}
      </ModalTransition>

      {/* <div style={{ marginTop: "10px" }}>
        Input Key: <input type='text' id='keyString'></input>
        <Button style={{
          marginLeft: "5px",
          fontSize: "14px",
          borderColor: "black !important",
          borderWidth: "thin"
        }} onClick={() => deleteInputKeyProject(rows, searchKey)}> Click to delete project </Button>
      </div> */}

      <div style={{ marginTop: '20px' }}>
        <label>Delete all selected projects? </label>
        <Button
          style={{
            marginLeft: '5px',
            fontSize: '14px',
            borderColor: 'black !important',
            borderWidth: 'thin'
          }}
          onClick={handleDeleteSelectedOptionOpen}
        >
          {' '}
          Yes, please delete the checkmarked projects{' '}
        </Button>
        <ModalTransition>
          {openDeleteSelectedAlert && (
            <Modal
              actions={alertDeleteSelectedPrompt}
              onClose={handleCloseDeleteSelectedOption}
              heading="Are you sure you want to delete all checkmarked project(s)?"
            />
          )}
          {openDeleteSelectedSuccessAlert && (
            <Modal
              actions={alertDeleteSelectedSuccess}
              onClose={handleCloseDeleteSelectedSuccessOption}
              heading="All selected project were deleted!"
            />
          )}
        </ModalTransition>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Do you want to delete all projects? </label>
        <Button
          style={{
            marginLeft: '5px',
            fontSize: '14px',
            borderColor: 'black !important',
            borderWidth: 'thin'
          }}
          onClick={handleDeleteAllOptionOpen}
        >
          Yes, delete all projects
        </Button>
        <ModalTransition>
          {openDeleteAllAlert && (
            <Modal
              actions={alertDeleteAllPrompt}
              onClose={handleCloseDeleteAllOption}
              heading="Are you sure you want to delete all projects listed in the table?"
            ></Modal>
          )}
          {openDeleteAllSuccessAlert && (
            <Modal
              actions={alertDeleteAllSuccess}
              onClose={handleCloseDeleteAllSuccessOption}
              heading="All Projects were deleted!"
            ></Modal>
          )}
        </ModalTransition>
      </div>
    </AppContainer>
  );
};

export default App;
