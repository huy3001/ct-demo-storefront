# AGENTS.md

## 🎯 Role & Context
You are an expert Frontend and Composable Commerce Engineer specializing in **commercetools Custom Applications**. Your task is to build a merchant-facing store management application named **`stores-manager-application`**. 

This application will be integrated directly into the commercetools Merchant Center using the official **commercetools Frontend SDK, React, and Merchant Center UIKit**. It will manage physical brick-and-mortar stores using commercetools **Channels** backed by **Custom Fields** via **GraphQL**.

---

## 🏗️ Technical Constraints & Architecture
* **App Name:** `stores-manager-application`
* **Framework:** React (using the official `@commercetools-frontend/create-mc-app` architecture).
* **UI Components:** Strictly use `@commercetools-uikit` components for layout, forms, tables, and typography to maintain a native look and feel.
* **Data Protocol:** **GraphQL only** utilizing Apollo Client or the built-in SDK hooks (`@commercetools-frontend/sdk`).
* **Storage Entity:** commercetools **Channels**. Every physical store is a Channel.
  * Every store Channel must have the `InventorySupply` role enabled.
* **Third-Party APIs:** React-Leaflet with OpenStreetMap for address auto-complete, coordinate picking (latitude/longitude), and rendering maps inside the app.

---

## 🗄️ Core Data Modeling (commercetools Type & Channel Setup)
Before creating channels, the application relies on a Custom Type named `store-metadata-type` assigned to the Resource Type `channel`.

### Custom Fields Schema (`store-metadata-type`)
Your code must expect and query these exact custom fields on the Channel object. Latitude/longitude and the address are NOT custom fields: they use the Channel's native `geoLocation` (GeoJSON Point `[lng, lat]`) and `address`, so they stay identical to the Merchant Center. The type is auto-created on first save when missing (`manage_types` scope).
* `openingHours` (String) -> JSON string representing weekly hours (e.g., `{"mon": "09:00-21:00", ...}`).
* `phoneNumber` (String) -> Store contact number.
* `storeManager` (String) -> Name of the assigned manager.

---

## 📋 Feature Blueprint

### Feature 1: The Store Dashboard (List View)
* **Description:** A primary landing view showing a data table of all physical stores.
* **UI Structure:**
  * Top header with a `<Text.Headline>` "Stores Management" and a primary `<PrimaryButton>` labeled "Add New Store".
  * A search and filter bar to filter stores by key or name.
  * A `<DataTable>` component mapping the following columns: `Store Name (Name)`, `Store Code (Key)`, `Roles`, `Phone Number`, `Actions`.
  * Actions column contains an "Edit" button (redirects to Detail view) and a "Delete" button (triggers a confirmation `<ConfirmationDialog>`).

### Feature 2: Store Creator & Editor (Form View)
* **Description:** A unified component used to create a new channel or update an existing one.
* **UI Structure & Components:**
  * Two-column layout using UIKit `<Grid>`.
  * **Left Column (Forms):** 
    * `<TextField>` for Store Name (localized string, default to current project locale).
    * `<TextField>` for Store Key (unique identifier).
    * `<TextField>` for Phone Number.
    * `<MultilineTextField>` or structured time pickers for Opening Hours JSON.
  * **Right Column (Google Maps Interactive Picker):**
    * A search text box mapped to **Google Maps Places Autocomplete API**. When a user types an address and selects it, auto-populate the Latitude and Longitude values.
    * An embedded visual map rendering a draggable map marker. Moving the pin dynamically updates the hidden `latitude` and `longitude` form states.
  * **Footer:** Fixed bar with `<PrimaryButton type="submit">` and `<SecondaryButton>` for Cancel.

---

## 🧬 GraphQL Queries & Mutations Reference
Implement your data fetching layers using these structures:

### 1. Fetch Store Channels
```graphql
query FetchStoreChannels(\(limit: Int!,\)offset: Int!) {
  channels(limit: \(limit, offset:\)offset, where: "roles contains any (\"InventorySupply\")") {
    results {
      id
      key
      roles
      nameAllLocales {
        locale
        value
      }
      custom {
        customFieldsRaw {
          name
          value
        }
      }
    }
  }
}
```

### 2. Create/Update Store Channel
```graphql
mutation ManageStoreChannel(\$actions: [ChannelUpdateAction!]!, \(id: String!,\)version: Long!) {
  updateChannel(id: \$id, version: \(version, actions:\)actions) {
    id
    key
  }
}
```
*(Note for AI: When creating, use the standard `createChannel` mutation mapping name, key, roles: `["InventorySupply"]`, and the custom type fields configuration).*

---

## 🎨 Storefront Integration Guide (Reference Code for Consumers)
While you are building the admin Merchant Center app, ensure your code exports data structures that allow a custom storefront (Next.js/Vue) to fetch and render via Google Maps. The consumer storefront will execute the matching public GraphQL query and pass data directly to standard map arrays:

```javascript
// Expected format generated by your app for storefront consumers
const storeMarkers = stores.map(store => ({
  title: store.name,
  position: { 
    lat: parseFloat(store.custom.fields.latitude), 
    lng: parseFloat(store.custom.fields.longitude) 
  },
  hours: JSON.parse(store.custom.fields.openingHours)
}));
```

---

## 🚀 Execution Steps for the AI Assistant
1. **Scaffold the App:** Establish the `application-config.json` registering the entry point under the main navigation sidebar section titled "Stores".
2. **Build Components:** Set up a clean folder structure under `/src`: `/components/store-list`, `/components/store-form`, `/hooks/use-store-gql`.
3. **Integrate SDK:** Wire up Apollo Provider hooks linking to the host Merchant Center context.

Please output complete, modern React functional components using Hooks, type checking (TypeScript or PropTypes matching UIKit standard), and modular file architecture.
