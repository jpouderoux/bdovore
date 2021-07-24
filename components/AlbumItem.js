
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Rating } from 'react-native-elements';

import CommonStyles from '../styles/CommonStyles';

const onPressAlbum = (navigation, item) => {
  navigation.push('Album', { item });
}

export function AlbumItem({ navigation, item, index }) {
  const tome = (item.NUM_TOME !== null) ? "Tome " + item.NUM_TOME : '';
  return (
    <TouchableOpacity key={index} onPress={() => onPressAlbum(navigation, item)}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ margin: 5 }}>
          <Image source={{ uri: encodeURI('https://www.bdovore.com/images/couv/' + item.IMG_COUV), }} style={CommonStyles.albumImageStyle} />
        </View>
        <View style={{ margin: 5, justifyContent: "center", flexDirection: "column" }}>
          <Text style={CommonStyles.bold}>{item.TITRE_TOME}</Text>
          <Text>{item.NOM_SERIE}</Text>
          <Text>{tome}</Text>
          <Text>{item.NOM_GENRE}</Text>
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
      <View style={{ borderBottomColor: '#eee', borderBottomWidth: StyleSheet.hairlineWidth * 2, }} />
    </TouchableOpacity>
  );
}
