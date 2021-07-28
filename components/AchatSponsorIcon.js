

import React from 'react';
import { Image, Linking, TouchableOpacity } from 'react-native';

import CommonStyles from '../styles/CommonStyles';

export function AchatSponsorIcon(props) {
  return (props.item && props.item.EAN_EDITION) ? (
    <TouchableOpacity
      onPress={() => { Linking.openURL('https://www.bdfugue.com/a/?ref=295&ean=' + item.EAN_EDITION); }}
      title="Acheter sur BDFugue"
      style={{ marginTop: 5 }}>
      <Image source={require('../assets/bdfugue.png')} style={CommonStyles.bdfugueIcon} />
    </TouchableOpacity>) : null;
}

