import type { Guide } from './types';
import { requestFlow } from './guides/01-request-flow';
import { projectSetup } from './guides/02-project-setup';
import { postgres } from './guides/03-postgres';
import { connect } from './guides/04-connect';
import { table } from './guides/05-table';
import { crud } from './guides/06-crud';
import { validation } from './guides/07-validation';
import { reactFetch } from './guides/08-react-fetch';
import { reactForms } from './guides/09-react-forms';
import { troubleshooting } from './guides/10-troubleshooting';
import { deploy } from './guides/11-deploy';

export const pathName = 'Build a full-stack Task Board';
export const pathSummary =
  'Eleven guides that build one real app together: React in the browser, Express as the API, PostgreSQL as the database. Do them in order, or jump to the one you need.';

/** In build order. Guide n assumes the files from guides before it. */
export const guides: Guide[] = [
  requestFlow,
  projectSetup,
  postgres,
  connect,
  table,
  crud,
  validation,
  reactFetch,
  reactForms,
  troubleshooting,
  deploy,
];

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);
