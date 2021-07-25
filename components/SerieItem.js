
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Rating } from 'react-native-elements';

import CommonStyles from '../styles/CommonStyles';

const onPressSerie = (navigation, item) => {
  navigation.push('Serie', { item });
}

export function SerieItem({ navigation, item, index }) {
  return (
    <TouchableOpacity key={index} onPress={() => onPressSerie(navigation, item)}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ margin: 5 }}>
          <Image source={{ uri: encodeURI('https://www.bdovore.com/images/couv/' + item.IMG_COUV_SERIE), }} style={CommonStyles.albumImageStyle} />
        </View>
        <View style={{ margin: 5, flexDirection: "column" }}>
          <Text style={CommonStyles.bold}>{index} - {item.TITRE_TOME}</Text>
          <Text style={CommonStyles.bold}>{item.NOM_SERIE}</Text>
          <Text>{item.NOM_GENRE}</Text>
          <Text style={CommonStyles.italic}>{item.NB_USER_ALBUM} album{item.NB_USER_ALBUM > 1 ? 's' : ''} sur {item.NB_ALBUM} dans la base</Text>
          <Text style={CommonStyles.italic}>{item.LIB_FLG_FINI_SERIE}</Text>
          {(item.NOTE_SERIE) !== null ?
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
        </View>
      </View>
      <View style={{ borderBottomColor: '#eee', borderBottomWidth: StyleSheet.hairlineWidth * 2, }} />
    </TouchableOpacity >
  );
}
