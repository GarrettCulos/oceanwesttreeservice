import React from 'react';
import PropTypes from 'prop-types';
import { ProjectPreviewTemplate, ProjectTemplate } from '../../templates/services-page';

export const ProjectPage = ({ entry, widgetFor }) => (
  <ProjectTemplate
    project={entry.getIn(['data', 'project'])}
    tags={entry.getIn(['data', 'tags'])}
    date={entry.getIn(['data', 'date'])}
    description={widgetFor('body')}
  />
);

ProjectPage.propTypes = {
  entry: PropTypes.shape({
    getIn: PropTypes.func
  }),
  widgetFor: PropTypes.func
};

export const ProjectPagePreview = ({ entry, widgetFor }) => (
  <ProjectPreviewTemplate description={widgetFor('body')} tags={entry.getIn(['data', 'tags'])} project={entry.getIn(['data', 'project'])} />
);

ProjectPagePreview.propTypes = {
  entry: PropTypes.shape({
    getIn: PropTypes.func
  }),
  widgetFor: PropTypes.func
};
