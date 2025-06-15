import T3ChatUI from './T3ChatUI';
import './index.css';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { ApiKeyProvider } from './contexts/ApiKeyContext'; // <-- Import the provider

function App() {
  return (
    // Wrap the entire app with the ApiKeyProvider
    <ApiKeyProvider>
      <SignedIn>
        <T3ChatUI />
      </SignedIn>
      <SignedOut>
        <div className="w-screen h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <SignIn routing="path" path="/" />
        </div>
      </SignedOut>
    </ApiKeyProvider>
  );
}

export default App;