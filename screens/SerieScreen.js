import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import CommonStyles from '../styles/CommonStyles';

function SerieScreen({ route, navigation }) {
  const item = route.params.item;
  return (
    <SafeAreaView>
      <View style={{ margin: 20, alignItems: 'center' }}>
        <Image source={{ uri: encodeURI('https://www.bdovore.com/images/couv/' + item.IMG_COUV_SERIE), }} style={CommonStyles.albumImageStyle} />
      </View>
      <View style={{ flexDirection: 'column', marginVertical: 8, alignItems: 'center' }}>
          <Text style={styles.bold}>{item.NOM_SERIE}</Text>
          <Text style={styles.bold}>{item.NOM_SERIE}</Text>
          <Text style={styles.italic}>{item.NB_USER_ALBUM} album(s) possédé(s)</Text>
          <Text style={styles.italic}>{item.LIB_FLG_FINI_SERIE}</Text>
      </View>
    </SafeAreaView >
  );
}

export default SerieScreen;
