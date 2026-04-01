import React from 'react';
import { Stack } from 'expo-router';
import RoleGuard from '../../components/RoleGuard';

export default function StudentLayout() {
  return (
    <RoleGuard allowedRoles={['student']} fallbackRoute="/admin/dashboard">
      <Stack screenOptions={{ headerShown: false }} />
    </RoleGuard>
  );
}
