

import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import CommonStyles from '../styles/CommonStyles';

export function LoadingIndicator() {
  return (
    <View style={{ height: '100%', justifyContent: 'center' }}><ActivityIndicator size="large" color="#f00f0f" /></View>
  );
}

