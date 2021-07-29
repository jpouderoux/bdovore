import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Rating } from 'react-native-elements';

import CommonStyles from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager';

import { CoverImage } from './CoverImage';
import { CollectionMarkers } from './CollectionMarkers';

const onPressAlbum = (navigation, item) => {
  navigation.push('Album', { item });
}

export function AlbumItem({ navigation, item, index, collectionMode }) {
  const tome = (item.NUM_TOME !== null) ? "tome " + item.NUM_TOME : '';
  return (
    <TouchableOpacity key={index} onPress={() => onPressAlbum(navigation, item)}>
      <View style={{ flexDirection: 'row', }}>
        <CoverImage source={APIManager.getAlbumCoverURL(item)} />
        <View style={CommonStyles.itemTextContent}>
          <Text style={[CommonStyles.largerText]} numberOfLines={1} textBreakStrategy='balanced'>{item.TITRE_TOME}</Text>
          {(item.MOYENNE_NOTE_TOME !== null) ?
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
          <Text style={[CommonStyles.itemTextWidth, { color: 'lightgrey', marginTop: 15 }]}>
            {item.NOM_SERIE} {tome}{'\n'}
          </Text>
          {collectionMode ? null :
            <CollectionMarkers item={item}/>
          }
        </View>
      </View>
    </TouchableOpacity>
  );
}
