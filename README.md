# f2024-cps731-team3
Travel Itinerary system code repo for team 3 in cps731.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Package Installation
- npm install
- npm install @supabase/supabase-js
- npm run dev

## IMPORTANT

The supabase.admin.token.jsx is left blank, since it is a secret key that should only be locally used to test this system. Not having this key prevents the following features of the system:

- Deleting own account
- Banning a user
- Unbanning a user
