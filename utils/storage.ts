import { NativeModules, Platform } from 'react-native';

let AsyncStorage: any;

const getAsyncStorage = () => {
    if (AsyncStorage !== undefined) return AsyncStorage;

    // On web, we never want AsyncStorage
    if (Platform.OS === 'web') {
        AsyncStorage = null;
        return null;
    }

    try {
        // Only try to require if we think it might exist in NativeModules
        // RNCAsyncStorage is the common name for the native module
        const hasNativeModule = !!(NativeModules && (
            NativeModules.RNCAsyncStorage ||
            NativeModules.PlatformLocalStorage ||
            NativeModules.AsyncLocalStorage ||
            NativeModules.AsyncStorage
        ));

        if (hasNativeModule) {
            const module = require('@react-native-async-storage/async-storage');
            AsyncStorage = module.default || module;
            return AsyncStorage;
        } else {
            console.warn('AsyncStorage native module not found, using fallback');
            AsyncStorage = null;
            return null;
        }
    } catch (e) {
        console.warn('AsyncStorage could not be loaded:', e);
        AsyncStorage = null;
        return null;
    }
};

// Fallback implementation using memory (or localStorage on web)
const memoryStore: Record<string, string> = {};

const safeStorage = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            const storage = getAsyncStorage();
            if (storage) {
                return await storage.getItem(key);
            }
        } catch (e) {
            console.warn('SafeStorage.getItem failed:', e);
        }

        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return memoryStore[key] || null;
    },

    setItem: async (key: string, value: string): Promise<void> => {
        try {
            const storage = getAsyncStorage();
            if (storage) {
                await storage.setItem(key, value);
                return;
            }
        } catch (e) {
            console.warn('SafeStorage.setItem failed:', e);
        }

        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
        } else {
            memoryStore[key] = value;
        }
    },

    removeItem: async (key: string): Promise<void> => {
        try {
            const storage = getAsyncStorage();
            if (storage) {
                await storage.removeItem(key);
                return;
            }
        } catch (e) {
            console.warn('SafeStorage.removeItem failed:', e);
        }

        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
        } else {
            delete memoryStore[key];
        }
    }
};

export default safeStorage;
