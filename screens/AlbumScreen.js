import React from 'react';
import { Image, Linking, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native'
import { Text } from 'react-native-elements';
import { WebView } from 'react-native-webview';
import { Rating } from 'react-native-elements';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import * as APIManager from '../api/APIManager';
import CommonStyles from '../styles/CommonStyles';

function AlbumScreen({ route, navigation }) {
  const item = route.params.item;
  const tome = ((item.NUM_TOME !== null) ? 'T' + item.NUM_TOME + ' - ': '') + item.TITRE_TOME;
  let auteurs = item.scpseudo;
  if (auteurs === null || auteurs === '') {
    auteurs = item.depseudo;
  } else if ((item.depseudo !== null || item.depseudo !== '') && (auteurs != item.depseudo)) {
    auteurs = auteurs + ' & ' + item.depseudo;
  }

  const annee = item.DTE_PARUTION.substring(0, 4);

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', height:'100%'}}>
      <ScrollView style={{  margin: 10 }}>
        <View style={{ margin: 10, alignItems: 'center' }}>
          <Image source={{ uri: APIManager.getAlbumCoverURL(item) }} style={CommonStyles.fullAlbumImageStyle} />
        </View>
        <View style={{ margin: 0, alignItems: 'center' }}>
          <Text h4 style={[CommonStyles.bold, { fontWeight: 'bold', textAlign: 'center' }]}>{tome}</Text>
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
        <View style={{ marginTop: 10, marginBottom: 10, alignItems: 'center' }}>
          <Text style={[CommonStyles.sectionStyle, CommonStyles.center, CommonStyles.largerText ]}>Collection</Text>
          <Text>... TBD ...</Text>
          <Text style={[CommonStyles.sectionStyle, CommonStyles.center, CommonStyles.largerText ]}>Info Album</Text>
        </View>
        <View>
          <Text style={CommonStyles.largerText}>{item.NOM_SERIE}</Text>
          <Text>Auteurs : {auteurs}</Text>
          <Text>Genre : {item.NOM_GENRE}</Text>
          <Text>Editions : {item.NOM_EDITEUR} {annee}</Text>
          <WebView style={{ contentInsetAdjustmentBehavior: 'always',  width: '100%' }} scalesPageToFit={false} source={{ html: '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>'+item.HISTOIRE_TOME+'</body></html>' }}/>
          <TouchableOpacity
            onPress={() => { Linking.openURL('https://www.bdfugue.com/a/?ref=295&ean='+item.EAN_EDITION); }}
            title="Acheter sur BDFugue">
            <Image source={ require('../assets/bdfugue.png') } style={CommonStyles.bdfugueIcon}/>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default AlbumScreen;
