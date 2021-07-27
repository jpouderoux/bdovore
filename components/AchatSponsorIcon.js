

import React from 'react';
import { Image, Linking, TouchableOpacity } from 'react-native';

import CommonStyles from '../styles/CommonStyles';

export function AchatSponsorIcon({ navigation, item }) {
  return (
    <TouchableOpacity
      onPress={() => { Linking.openURL('https://www.bdfugue.com/a/?ref=295&ean=' + item.EAN_EDITION); }}
      title="Acheter sur BDFugue">
      <Image source={require('../assets/bdfugue.png')} style={CommonStyles.bdfugueIcon} />
    </TouchableOpacity>
  );
}

