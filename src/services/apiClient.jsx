/**
 * Placeholder for global config, API URLs, API response handlers
 */
const BASE_URL = 'http://localhost:5000/api';

export const fetchPolls = async () => {
    try {
        const response = await fetch(`${BASE_URL}/polls`);
        return await response.json();
    } catch (error) {
        console.error("API error", error);
        return [];
    }
};

export const login = async (email, password) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await response.json();
    } catch (error) {
        console.error("API error", error);
        return { error: 'Login failed' };
    }
}
