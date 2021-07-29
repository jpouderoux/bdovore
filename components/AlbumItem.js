import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Image, Rating } from 'react-native-elements';

import CommonStyles from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager';

import { CoverImage } from './CoverImage';

const onPressAlbum = (navigation, item) => {
  navigation.push('Album', { item });
}

export function AlbumItem({ navigation, item, index }) {
  const tome = (item.NUM_TOME !== null) ? "Tome " + item.NUM_TOME : '';
  return (
    <TouchableOpacity key={index} onPress={() => onPressAlbum(navigation, item)}>
      <View style={{ flexDirection: 'row', }}>
        <CoverImage source={APIManager.getAlbumCoverURL(item)} />
        <View style={CommonStyles.itemTextContent}>
          <Text style={[CommonStyles.itemTextWidth, CommonStyles.bold]}>{item.TITRE_TOME}</Text>
          <Text style={CommonStyles.itemTextWidth}>
            {item.NOM_SERIE}{'\n'}
            {tome}{'\n'}
            {item.NOM_GENRE}
          </Text>
          {(item.MOYENNE_NOTE_TOME) !== null ?
            <View style={{ marginTop: 5, height: 20, alignItems: 'baseline' }}>
              <Rating
                ratingCount={5}
                imageSize={20}
                startingValue={(item.MOYENNE_NOTE_TOME) / 2}
                tintColor='#fff'
                readonly={true}
              />
            </View>
            : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
