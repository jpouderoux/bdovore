

import React from 'react';
import { ActivityIndicator, View } from 'react-native';


export function SmallLoadingIndicator() {
  return (
    <View style={{ ustifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#f00f0f" />
    </View>
  );
}

