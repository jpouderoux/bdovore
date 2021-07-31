import React from 'react';
import { Image, Linking, TouchableOpacity } from 'react-native';

import CommonStyles from '../styles/CommonStyles';

export function AchatSponsorIcon({ ean }) {

    return <TouchableOpacity
      onPress={() => { Linking.openURL('https://www.bdfugue.com/a/?ean=' + ean + "&ref=295"); }}
      title="Acheter sur BDFugue"
      style={{ marginTop: 5 }}>
      <Image source={require('../assets/bdfugue.png')} style={CommonStyles.bdfugueIcon} />
    </TouchableOpacity>;
}

