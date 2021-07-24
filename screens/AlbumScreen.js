import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-elements';
import { WebView } from 'react-native-webview';
import { Rating } from 'react-native-elements';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import EStyleSheet from 'react-native-extended-stylesheet';

function AlbumScreen({ route, navigation }) {
  const item = route.params.item;
  const tome = ((item.NUM_TOME !== null) ? "T" + item.NUM_TOME + ' - ': '') + item.TITRE_TOME;
  let auteurs = item.scpseudo;
  if (auteurs === null || auteurs === '') {
    auteurs = item.depseudo;
  } else if ((item.depseudo !== null || item.depseudo !== '') && (auteurs != item.depseudo)) {
    auteurs = auteurs + ' & ' + item.depseudo;
  }

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', height:'100%'}}>
      <ScrollView style={{  margin: 10 }}>
        <View style={{ margin: 20, alignItems: 'center' }}>
          <Image source={{ uri: encodeURI('https://www.bdovore.com/images/couv/' + item.IMG_COUV), }} style={styles.albumImageStyle} />
        </View>
        <View style={{ margin: 20, alignItems: 'center' }}>
          <Text h4 style={[styles.bold, { fontWeight: 'bold', textAlign: 'center' }]}>{tome}</Text>
          {(item.MOYENNE_NOTE_TOME) !== null ?
            <View style={{ marginTop: 5, height: 20, alignItems: 'baseline' }}>
              <Rating
                ratingCount={5}
                imageSize={20}
                startingValue={(item.MOYENNE_NOTE_TOME) / 2}
                tintColor={'#fff'}
                readonly={true}
              />
            </View>
            : null}
        </View>
        <View style={{ margin: 5, alignItems: 'center' }}>
          <Text>Collection</Text>
          <Text>.....</Text>
        </View>
        <View>
          <Text style={styles.largerText}>{item.NOM_SERIE}</Text>
          <Text>Auteurs : {auteurs}</Text>
          <Text>Genre : {item.NOM_GENRE}</Text>
          <Text>Editions : {item.NOM_EDITEUR}</Text>
          <WebView style={{ contentInsetAdjustmentBehavior: 'always',  width: '100%' }} scalesPageToFit={false} source={{ html: '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>'+item.HISTOIRE_TOME+'</body></html>' }}/>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = EStyleSheet.create({
  largerText: {
    fontSize: '1.1rem'
  },
  albumImageStyle: {
    width: 180,
    height: 244,
  },
  italic: {
    fontStyle: 'italic'
  },
  bold: {
    fontWeight: 'bold'
  },
});

export default AlbumScreen;
