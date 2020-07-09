import React, { useCallback, useReducer } from 'react';
import PropTypes from 'prop-types';
import ButtonProps from './ButtonProps';
import CheckboxProps from './CheckboxProps';
import Textfield from '@atlaskit/textfield';
import Select from '@atlaskit/select';

function checkCheckbox(state, action: { type: boolean }) {
  return { check: action.type };
}

function checkTime(state, action: { amount: number; unit: string; check: 'unit' | 'amount' }) {
  if (action.check === 'unit') {
    switch (action.unit) {
      case 'hours':
        if (action.amount >= 48) {
          return { timeUnit: action.unit, timeAmount: action.amount };
        } else {
          return { timeUnit: action.unit, timeAmount: 48 };
        }
      case 'days':
        if (action.amount >= 2) {
          return { timeUnit: action.unit, timeAmount: action.amount };
        } else {
          return { timeUnit: action.unit, timeAmount: 2 };
        }
      case 'weeks' || 'months' || 'years':
        if (action.amount >= 1) {
          return { timeUnit: action.unit, timeAmount: action.amount };
        } else {
          return { timeUnit: action.unit, timeAmount: 1 };
        }
      default:
        return { timeUnit: action.unit, timeAmount: action.amount };
    }
  } else {
    return { timeUnit: action.unit, timeAmount: action.amount };
  }
}

function checkScheduledDate(state, action: { amount: number; unit: string }) {
  const today = new Date();
  let newDate = new Date();
  switch (action.unit) {
    case 'hours':
      newDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours() + action.amount);
      return { date: newDate };
    case 'days':
      newDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + action.amount, today.getHours());
      return { date: newDate };
    case 'weeks':
      newDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + action.amount * 7, today.getHours());
      return { date: newDate };
    case 'months':
      newDate = new Date(today.getFullYear(), today.getMonth() + action.amount, today.getDate(), today.getHours());
      return { date: newDate };
    case 'years':
      newDate = new Date(today.getFullYear() + action.amount, today.getMonth(), today.getDate(), today.getHours());
      return { date: newDate };
    default:
      return { date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours() + 48) };
  }
}

function checkSaveButton(state, action: { amount: number; unit: string }) {
  return action.unit === 'hours' && action.amount >= 48
    ? { button: true }
    : action.unit === 'days' && action.amount >= 2
    ? { button: true }
    : action.unit === 'weeks' && action.amount >= 1
    ? { button: true }
    : action.unit === 'months' && action.amount >= 1
    ? { button: true }
    : action.unit === 'years' && action.amount >= 1
    ? { button: true }
    : { button: false };
}

/**
 *
 * @param props
 * @param {Boolean} props.attachment Toggle checkbox
 * @param {Function} props.attachmentSet Parent function that uses attachment's true/false
 * @param {Function} props.backupSchedule Parent function uses time's amount (number) and unit
 * @param {Function} props.noChange Parent function that does not take anything because it does not take changes (cancel button)
 * @param {number} props.timeAmount The number currently used to calculate time between system backups
 * @param {string} props.timeUnit The unit currently used to calculate between system backups
 */
const EditSchedule = props => {
  const attachmentCheckbox = { check: props.attachment };
  const [checkboxesState, checkboxesDispatch] = useReducer(checkCheckbox, attachmentCheckbox);

  const timeProperties = { timeAmount: props.timeAmount, timeUnit: props.timeUnit };
  const [timeState, timeDispatch] = useReducer(checkTime, timeProperties);

  const nextScheduledDate = {
    date:
      props.timeUnit === 'hours'
        ? new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
            new Date().getHours() + props.timeAmount
          )
        : props.timeUnit === 'days'
        ? new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate() + props.timeAmount,
            new Date().getHours()
          )
        : props.timeUnit === 'weeks'
        ? new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate() + props.timeAmount * 7,
            new Date().getHours()
          )
        : props.timeUnit === 'months'
        ? new Date(
            new Date().getFullYear(),
            new Date().getMonth() + props.timeAmount,
            new Date().getDate(),
            new Date().getHours()
          )
        : props.timeUnit === 'years'
        ? new Date(
            new Date().getFullYear() + props.timeAmount,
            new Date().getMonth(),
            new Date().getDate(),
            new Date().getHours()
          )
        : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours())
  };
  const [nextScheduledDateState, nextScheduledDateDispatch] = useReducer(checkScheduledDate, nextScheduledDate);

  const saveButtonStatus = {
    button:
      (props.timeUnit === 'hours' && props.timeAmount >= 48) ||
      (props.timeUnit === 'days' && props.timeAmount >= 2) ||
      (props.timeUnit === 'weeks' && props.timeAmount >= 1) ||
      (props.timeUnit === 'months' && props.timeAmount >= 1) ||
      (props.timeUnit === 'years' && props.timeAmount >= 1)
        ? true
        : false
  };
  const [saveButtonState, saveButtonDispatch] = useReducer(checkSaveButton, saveButtonStatus);

  const toggleCheckbox = useCallback(toggleStatus => {
    checkboxesDispatch({ type: toggleStatus });
  }, []);

  const changeDropdown = newOption => {
    timeDispatch({ unit: newOption.value, amount: Number(timeState.timeAmount), check: 'unit' });
    saveButtonDispatch({ amount: Number(timeState.timeAmount), unit: newOption.value });
    nextScheduledDateDispatch({ amount: Number(timeState.timeAmount), unit: newOption.value });
  };
  const changeTimeTextField = newText => {
    saveButtonDispatch({ amount: Number(newText.target.value), unit: timeState.timeUnit });
    timeDispatch({ unit: timeState.timeUnit, amount: Number(newText.target.value), check: 'amount' });
    nextScheduledDateDispatch({ amount: Number(newText.target.value), unit: timeState.timeUnit });
  };

  const saveChanges = () => {
    props.attachmentSet(checkboxesState.check);
    props.backupSchedule(timeState.timeAmount, timeState.timeUnit);
  };

  return (
    <div>
      <label htmlFor="time-amount">Schedule a backup to run every:</label>
      <div style={{ display: 'inline-block', marginBottom: '5px', width: '13%' }}>
        <Textfield
          name="time-amount"
          type="number"
          min={
            timeState.timeUnit === 'Hours' || timeState.timeUnit === 'hours'
              ? 48
              : timeState.timeUnit === 'Days' || timeState.timeUnit === 'days'
              ? 2
              : timeState.timeUnit === 'Weeks' || timeState.timeUnit === 'weeks'
              ? 1
              : timeState.timeUnit === 'Months' || timeState.timeUnit === 'months'
              ? 1
              : timeState.timeUnit === 'Years' || timeState.timeUnit === 'years'
              ? 1
              : 0
          }
          defaultValue={props.timeAmount}
          style={{ textAlign: 'right' }}
          onChange={e => changeTimeTextField(e)}
        />
      </div>
      <div style={{ display: 'inline-block', width: '30%' }}>
        <Select
          className="single-select"
          classNamePrefix="react-select"
          options={[
            { label: 'Hours', value: 'hours' },
            { label: 'Days', value: 'days' },
            { label: 'Weeks', value: 'weeks' },
            { label: 'Months', value: 'months' },
            { label: 'Years', value: 'years' }
          ]}
          defaultValue={{
            label: props.timeUnit.charAt(0).toUpperCase() + props.timeUnit.slice(1),
            value: props.timeUnit.charAt(0).toLowerCase() + props.timeUnit.slice(1)
          }}
          onChange={e => changeDropdown(e)}
        />
      </div>
      <div style={{ display: 'block', marginBottom: '10px' }}>
        <label>The next schduled update is: {nextScheduledDateState.date.toString()}</label>
      </div>

      <CheckboxProps toggle={checkboxesState.check} toggleStatus={toggleCheckbox} label={'Include attachments'} />

      <div style={{ display: 'inline-block', marginBottom: '5px', marginTop: '15px' }}>
        <ButtonProps style={{ fontSize: 'large' }} appearance="primary" buttonClicked={props.noChange} label="Cancel" />

        <ButtonProps
          style={{ marginLeft: '15px', fontSize: 'large' }}
          appearance="primary"
          isDisabled={!saveButtonState.button}
          buttonClicked={saveChanges}
          label="Okay"
        />
      </div>
    </div>
  );
};

EditSchedule.propTypes = {
  attachment: PropTypes.bool,
  attachmentSet: PropTypes.func,
  backupSchedule: PropTypes.func,
  noChange: PropTypes.func,
  timeAmount: PropTypes.number,
  timeUnit: PropTypes.string
};

EditSchedule.defaultProps = {
  attachment: false,
  attachmentSet: () => {},
  backupSchedule: () => {},
  noChange: () => {},
  timeAmount: 48,
  timeUnit: 'hours'
};

export default EditSchedule;
