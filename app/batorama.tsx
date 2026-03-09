import { BatoramaContent } from '@/components/screens/BatoramaContent';
import { Stack } from 'expo-router';
import React from 'react';

export default function BatoramaScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Batorama', headerShown: false }} />
            <BatoramaContent />
        </>
    );
}
