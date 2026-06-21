import { BaseView } from '../ModuleFactory.js';
import table from './table.js';
import details from './details.js';

export const view = new BaseView('threads', 'threads', table, details);
export default view;
