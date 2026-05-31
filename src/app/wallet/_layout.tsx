/**
 * Wallet Stack Layout
 * Contains: index, top-up, transactions
 */

import { Stack } from 'expo-router';

export default function WalletLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
