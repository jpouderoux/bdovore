import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Image } from 'react-native-elements';

import CommonStyles from '../styles/CommonStyles';


export function CoverImage({ source, style }) {

  return (
    <Image
      source={{ uri: source }}
      style={[CommonStyles.albumImageStyle, style]}
      PlaceholderContent={<ActivityIndicator/>} />
  );
}
