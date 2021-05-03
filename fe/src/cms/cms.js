import CMS from 'netlify-cms';
import { ProjectPagePreview } from './project/ProjectPage';

CMS.registerPreviewTemplate('project', ProjectPagePreview);
