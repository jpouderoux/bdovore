import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import CommonStyles from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager';

export function AuteurItem({ navigation, item, index }) {

  return (
    <TouchableOpacity key={index} onPress={() => onPressSerie(navigation, item)}>
      <View style={{ flexDirection: 'row' }}>
        <Image source={{ uri: APIManager.getAuteurCoverURL(item) }} style={CommonStyles.albumImageStyle} />
        <View style={CommonStyles.itemTextContent}>
          <Text>To be done.</Text>
        </View>
      </View>
      <View style={{ borderBottomColor: '#eee', borderBottomWidth: StyleSheet.hairlineWidth * 2, }} />
    </TouchableOpacity >
  );
}
