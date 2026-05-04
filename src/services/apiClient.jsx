/**
 * API Client for interacting with the Node.js Express backend.
 * This is meant specifically for secure and admin-level operations that shouldn't be done
 * purely client-side via Firebase SDK.
 */

import { Platform } from 'react-native';

const LOCAL_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || LOCAL_API_URL;

export const banUserAPI = async (userId) => {
    try {
        const response = await fetch(`${BASE_URL}/admin/users/${userId}/ban`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    } catch (error) {
        console.warn("API warning banning user:", error.message);
        return { error: 'Failed to ban user' };
    }
};

export const resolveFlagAPI = async (flagId) => {
    try {
        const response = await fetch(`${BASE_URL}/admin/flags/${flagId}/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    } catch (error) {
        console.warn("API warning resolving flag:", error.message);
        return { error: 'Failed to resolve flag' };
    }
};
