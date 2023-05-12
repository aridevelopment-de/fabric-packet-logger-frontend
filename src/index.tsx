import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import React from 'react';
import ReactDOM from 'react-dom/client';
import CustomRouter from './CustomRouter';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { metadataManager } from './utils/metadatamanager';

// Fix for dev environment
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  window.onerror = (...args) => {
    if (args[0] === "ResizeObserver loop limit exceeded" || args[0] === "ResizeObserver loop completed with undelivered notifications.") {
      return true;
    } else {
      console.error(...args);
      return false;
    }
  }
}

const clientVersion = new URLSearchParams(document.location.search).get("version") || "1.19.4";
metadataManager.fetchMetadata(clientVersion);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <MantineProvider withNormalizeCSS theme={{ colorScheme: "dark" }}>
      <Notifications />
      <ModalsProvider>
        <CustomRouter clientVersion={clientVersion} />
      </ModalsProvider>
    </MantineProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
