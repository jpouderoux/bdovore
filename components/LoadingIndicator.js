import React from 'react';
import { ActivityIndicator, View } from 'react-native';


export function LoadingIndicator() {

  return (
    <View style={{ height: '100%', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="red" />
    </View>
  );
}

