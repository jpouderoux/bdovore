import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import CommonStyles from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager';

const onPressAuteur = (navigation, item) => {
  //navigation.push('Auteur', { item });
}

export function AuteurItem({ navigation, item, index }) {
  const fonction = [];
  if (item.FLG_SCENAR) fonction.push('Scenariste');
  if (item.FLG_DESSIN) fonction.push('Dessinateur');
  if (item.FLG_COLOR) fonction.push('Coloriste');
  const fonctionString = fonction.join(', ');
  return (
    <TouchableOpacity key={index} onPress={() => onPressAuteur(navigation, item)}>
      <View style={{ flexDirection: 'row' }}>
        <Image source={{ uri: APIManager.getAuteurCoverURL(item) }} style={CommonStyles.auteurImageStyle} />
        <View style={[CommonStyles.itemTextContent, { marginTop: 15 }]}>
          <Text style={[CommonStyles.itemTextWidth, { fontSize: 20}]}>{item.NOM}, {item.PRENOM}{'\n'}</Text>
          <Text style={[CommonStyles.itemTextWidth, { fontSize: 16, color: 'grey' }]}>{fonctionString}</Text>
        </View>
      </View>
      <View style={{ borderBottomColor: '#eee', borderBottomWidth: StyleSheet.hairlineWidth * 2, }} />
    </TouchableOpacity >
  );
}
