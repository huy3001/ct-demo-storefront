# stores-manager-application

Merchant Center Custom Application to manage physical stores. Every store is a commercetools **Channel** with the `InventorySupply` role and the `store-metadata-type` custom type, all accessed through GraphQL.

## Setup

1. The `store-metadata-type` custom type (resource type `channel`) is **created automatically** the first time a store is saved and the project does not have it yet (this needs the `manage_types` scope, which the application requests). To create it manually instead, use this draft:

   ```json
   {
     "key": "store-metadata-type",
     "name": { "en": "Store metadata" },
     "resourceTypeIds": ["channel"],
     "fieldDefinitions": [
       { "name": "openingHours", "label": { "en": "Opening hours (JSON)" }, "required": false, "type": { "name": "String" }, "inputHint": "MultiLine" },
       { "name": "phoneNumber", "label": { "en": "Phone number" }, "required": false, "type": { "name": "String" }, "inputHint": "SingleLine" },
       { "name": "storeManager", "label": { "en": "Store manager" }, "required": false, "type": { "name": "String" }, "inputHint": "SingleLine" }
     ]
   }
   ```

   Latitude/longitude and the address are stored in the channel's native `geoLocation` and `address`, so they match what the Merchant Center shows under Settings > Channels. Legacy `latitude`/`longitude` custom fields are only read as a fallback.

2. The map needs no API key: it uses [React-Leaflet](https://react-leaflet.js.org) with OpenStreetMap tiles and Nominatim for address search. Both domains are allowed in the CSP headers of `custom-application-config.mjs`. Review the [tile](https://operations.osmfoundation.org/policies/tiles/) and [Nominatim](https://operations.osmfoundation.org/policies/nominatim/) usage policies before production use.

3. Install and run:

   ```sh
   npm install
   npm start
   ```

   For production builds also set `APPLICATION_ID` and `APPLICATION_URL`.

## Structure

- `src/components/store-list` – dashboard with search, table, edit and delete confirmation.
- `src/components/store-form` – create/edit form with the React-Leaflet map picker (`/stores/new`, `/stores/:id`).
- `src/hooks/use-store-gql` – GraphQL queries/mutations (`*.ctp.graphql`) and hooks.
- `src/helpers.ts` – channel ⇄ store mapping, update actions, validation and `toStoreMarkers` for storefront consumers.

## Notes

- The store list loads up to 500 stores and filters by key/name client-side (channel predicates do not support partial matching).
- `opening hours` is stored as a JSON string, e.g. `{"mon": "09:00-21:00", "sun": "closed"}`.
