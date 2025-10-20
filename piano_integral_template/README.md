# Piano Integral Offline App Template

This template provides the minimal files to build an offline version of the **Piano Integral** platform using React, Vite, and Electron.

## Building

1. Install Node.js (v16+).
2. Run `npm run build` to install dependencies and build the React frontend.
3. Run `npm run pack` to package the application as a Windows MSI installer. The installer will be in the `dist/` directory.

## Running in development

```bash
npm install
electron .
```

This starts the Electron app using the local React build.
