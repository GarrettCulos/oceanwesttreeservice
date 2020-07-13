import React from 'react';
import PropTypes from 'prop-types';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import DownloadIcon from '@atlaskit/icon/glyph/download';
import RefreshIcon from '@atlaskit/icon/glyph/refresh';
import TrashIcon from '@atlaskit/icon/glyph/trash';

/**
 * Returns an Icon depending on the given label.
 * @param props
 * @param props.colour Able to set colour of the icon, except if icon does not exist.
 * @param props.label Chosen icon, the options are: Completed, Delete, Download, Errored, and Pending
 */
const Icon = props => {
  const icon =
    props.label === 'Pending' ? (
      <RefreshIcon label={''} primaryColor={props.colour || 'blue'} />
    ) : props.label === 'Completed' ? (
      <CheckCircleIcon label={''} primaryColor={props.colour || 'green'} />
    ) : props.label === 'Errored' ? (
      <CrossCircleIcon label={''} primaryColor={props.colour || 'red'} />
    ) : props.label === 'Download' ? (
      <DownloadIcon label={''} primaryColor={props.colour || 'black'} />
    ) : props.label === 'Delete' ? (
      <TrashIcon label={''} primaryColor={props.colour || 'black'} />
    ) : (
      `${props.label}`
    );
  return <div>{icon}</div>;
};

Icon.propTypes = {
  colour: PropTypes.string,
  label: PropTypes.string.isRequired
};

Icon.defaultProps = {
  colour: undefined,
  label: ''
};

export default Icon;
