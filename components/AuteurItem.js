import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import CommonStyles from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';
import { CoverImage } from './CoverImage';

const onPressAuteur = (navigation, item) => {
  navigation.push('Auteur', { item });
}

export function AuteurItem({ navigation, item, nbAlbums, nbSeries, noPressAction, index }) {
  const fonction = [];

  if (item.FLG_SCENAR) fonction.push('Scénariste');
  if (item.FLG_DESSIN) fonction.push('Dessinateur');
  if (item.FLG_COLOR) fonction.push('Coloriste');
  const fonctionString = fonction.join(', ');
  return (
    <TouchableOpacity key={index} disabled={noPressAction ? true : false} onPress={() => onPressAuteur(navigation, item)}>
      <View style={{ flexDirection: 'row' }}>
        <CoverImage source={APIManager.getAuteurCoverURL(item)} />
        <View style={[CommonStyles.itemTextContent, { marginTop: 15 }]}>
          <Text style={[CommonStyles.itemTextWidth, { fontSize: 20}]}>{item.PSEUDO}</Text>
          <Text style={[CommonStyles.itemTextWidth, { fontSize: 16, color: 'grey', marginTop: 10 }]}>{fonctionString}</Text>
          {nbSeries && nbSeries > 0 ?
            <Text style={[CommonStyles.itemTextWidth, { fontSize: 16, color: 'grey', marginTop: 10 }]}>
              {Helpers.pluralWord(nbAlbums, 'album')} pour {Helpers.pluralWord(nbSeries, 'série')}
          </Text> : null}
        </View>
      </View>
      <View style={{ borderBottomColor: '#eee', borderBottomWidth: StyleSheet.hairlineWidth * 2, }} />
    </TouchableOpacity >
  );
}
