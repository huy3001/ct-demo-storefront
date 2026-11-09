import { PERMISSIONS, entryPointUriPath } from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomApplication}
 */
const config = {
  name: 'Stores',
  entryPointUriPath,
  cloudIdentifier: 'aws-us',
  mcApiUrl: 'https://mc-api.us-east-2.aws.commercetools.com',
  env: {
    development: {
      initialProjectKey: 'test-b2b-project',
    },
    production: {
      applicationId: 'cmw92d890000101vi729qxmsl',
      url: 'https://stores-manager-application.vercel.app',
    },
  },
  headers: {
    csp: {
      'connect-src': ['https://nominatim.openstreetmap.org'],
      'img-src': [
        'https://*.tile.openstreetmap.org',
        'https://tile.openstreetmap.org',
      ],
    },
  },
  oAuthScopes: {
    view: ['view_products', 'view_types'],
    manage: ['manage_products', 'manage_types'],
  },
  icon: '${path:@commercetools-frontend/assets/application-icons/location.svg}',
  mainMenuLink: {
    defaultLabel: 'Stores',
    labelAllLocales: [],
    permissions: [PERMISSIONS.View],
  },
};

export default config;
