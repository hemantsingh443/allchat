import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const ClerkDebug = () => {
    const { getToken } = useAuth();
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleVerify = async () => {
        setResult(null);
        setError(null);
        console.log("--- Starting Verification Test ---");

        try {
            const token = await getToken();
            if (!token) {
                const msg = "Frontend Error: getToken() returned null. Are you logged in?";
                console.error(msg);
                setError(msg);
                return;
            }
            console.log("1. Frontend: Successfully retrieved a token.");

            const response = await fetch(`${API_URL}/api/verify`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();

            if (!response.ok) {
                const msg = `Backend Error (${response.status}): ${data.error}`;
                console.error(msg);
                setError(msg);
            } else {
                const msg = `✅ SUCCESS! User ID: ${data.userId}`;
                console.log("2. Backend:", msg);
                setResult(msg);
            }
        } catch (err) {
            const msg = `Network/Fetch Error: ${err.message}`;
            console.error(msg);
            setError(msg);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: '10px', left: '50%', transform: 'translateX(-50%)',
            padding: '20px', border: '2px solid blue', backgroundColor: 'rgba(240, 240, 255, 0.9)',
            zIndex: 9999, borderRadius: '8px', textAlign: 'center'
        }}>
            <h2 style={{ color: 'black', margin: 0 }}>Clerk Authentication Debugger</h2>
            <button onClick={handleVerify} style={{ padding: '10px 20px', fontSize: '16px', margin: '10px', cursor: 'pointer' }}>
                Test Backend Authentication
            </button>
            {result && <p style={{ color: 'green', fontWeight: 'bold' }}>{result}</p>}
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        </div>
    );
};

export default ClerkDebug;