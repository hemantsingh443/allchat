import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key. Check your .env.local file and ensure it's named REACT_APP_CLERK_PUBLISHABLE_KEY");
}

// Light theme appearance configuration
const customAppearance = {
  elements: {
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.1)',
    },
    formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm normal-case',
    userButtonPopoverCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.1)',
      width: '260px',
    },
    userButtonPopoverActionButton: {
      '&:hover': {
        backgroundColor: 'rgba(0,0,0,0.05)',
      },
      padding: '12px 16px',
      borderRadius: '8px',
    },
    userButtonPopoverActionButtonIcon: {
      color: '#4b5563', // gray-600
    },
    userButtonTrigger: {
      '&:focus': {
        boxShadow: '0 0 0 2px rgba(255,255,255,0.8), 0 0 0 4px rgba(99,102,241,0.5)',
      }
    },
  }
};

// Dark theme appearance configuration
const customAppearanceDark = {
  elements: {
    card: {
      backgroundColor: 'rgba(20, 20, 25, 0.5)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.2)',
    },
    formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm normal-case',
    footerActionLink: 'text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300',
    userButtonPopoverCard: {
      backgroundColor: 'rgba(20, 20, 25, 0.5)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.2)',
      width: '260px',
    },
    userButtonPopoverActionButton: {
      '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.08)',
      },
      padding: '12px 16px',
      borderRadius: '8px',
    },
    userButtonPopoverActionButtonIcon: {
      color: '#9ca3af', // gray-400
    },
    userButtonTrigger: {
      '&:focus': {
        boxShadow: '0 0 0 2px rgba(0,0,0,0.5), 0 0 0 4px rgba(129,140,248,0.6)',
      }
    },
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProvider 
        publishableKey={clerkPubKey}
        appearance={{
          baseTheme: [customAppearance],
          dark: customAppearanceDark,
          layout: {
            socialButtonsVariant: 'iconButton',
            logoImageUrl: '/logo192.png',
          }
        }}
      >
        <App />
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>
);