import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Rating } from 'react-native-elements';

import CommonStyles from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';
import { CoverImage } from './CoverImage';


export function SerieItem({ navigation, item, index, collectionMode }) {

  const onPressSerie = (navigation, item) => {
    navigation.push('Serie', { item });
  }

  return (
    <TouchableOpacity key={index} onPress={() => onPressSerie(navigation, item)}>
      <View style={{ flexDirection: 'row' }}>
        <CoverImage source={APIManager.getSerieCoverURL(item)} />
        <View style={[CommonStyles.itemTextContent]} >
          <Text style={[CommonStyles.largerText]} numberOfLines={1} textBreakStrategy='balanced'>{item.NOM_SERIE}</Text>
          {(!collectionMode && item.NOTE_SERIE) ?
            <View style={{ marginTop: 5, height: 20, alignItems: 'baseline' }}>
              <Rating
                ratingCount={5}
                imageSize={20}
                startingValue={(item.NOTE_SERIE) / 2}
                tintColor='#fff'
                readonly={true}
              />
            </View>
            : null}
          <Text style={[CommonStyles.largerText, { color: 'lightgrey', marginTop: 10 }]}>
            {item.LIB_FLG_FINI_SERIE}
            </Text>
          {(item.NB_USER_ALBUM) ? (
            <Text style={[CommonStyles.itemTextWidth, { color: 'lightgrey', marginTop: 15 }]}>
              {Helpers.pluralWord(item.NB_USER_ALBUM, 'album')} sur {Helpers.pluralWord(item.NB_ALBUM, 'album')} dans la base {'\n'}
          </Text>) : null}
        </View>
      </View>
    </TouchableOpacity >
  );
}
