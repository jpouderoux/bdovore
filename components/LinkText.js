import React from 'react';
import { Linking, Text } from 'react-native';

import CommonStyles from '../styles/CommonStyles';

export function LinkText({ text, url, style }) {
  return (
    <Text
      style={[CommonStyles.linkTextStyle, style]}
      onPress={() => { Linking.openURL(url); }}
    >
      {text ? text : ''}
    </Text>
  );
}

