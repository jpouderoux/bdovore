import React, { useState, useEffect } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { BottomSheet, ListItem, Rating } from 'react-native-elements';
import { WebView } from 'react-native-webview';

import * as APIManager from '../api/APIManager';
import CommonStyles from '../styles/CommonStyles';
import { AchatSponsorIcon } from '../components/AchatSponsorIcon';
import { LoadingIndicator } from '../components/LoadingIndicator';

function AlbumScreen({ route, navigation }) {
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [albumEditionsData, setAlbumEditionsData] = useState([]);
  const [showEditionsChooser, setShowEditionsChooser] = useState(0);
  const [editionIndex, setEditionIndex] = useState(0);
  const [item, setItem] = useState(route.params.item);

  //const item = route.params.item;
  const tome = ((item.NUM_TOME !== null) ? 'T' + item.NUM_TOME + ' - ': '') + item.TITRE_TOME;
  let auteurs = item.scpseudo;
  if (auteurs === null || auteurs === '') {
    auteurs = item.depseudo;
  } else if ((item.depseudo !== null || item.depseudo !== '') && (auteurs != item.depseudo)) {
    auteurs = auteurs + ' & ' + item.depseudo;
  }

  //const annee = item.NOM_EDITION.substring(0, 4);

  useEffect(() => {
    getAlbumEditions();
  }, []);

  const getAlbumEditions = () => {
    setLoading(true);
    APIManager.fetchAlbumEditions(item.ID_TOME, onAlbumEditionsFetched);
  }

  const onAlbumEditionsFetched = async (result) => {
    setAlbumEditionsData(result.items);
    setErrortext(result.error);
    setLoading(false);
  }

  const onShowEditionsChooser = () => {
    setShowEditionsChooser(true);
  }

  const onChooseEdition = (index) => {
    setShowEditionsChooser(false);
    setEditionIndex(index);
    setItem(albumEditionsData[index]);
  }

  //console.log("show album " + item.ID_TOME);

  return (
    <SafeAreaView style={CommonStyles.screenStyle}>
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
          <View style={{ flexDirection: 'row' }}><Text>Editions : </Text>
            <TouchableOpacity
              onPress={onShowEditionsChooser}
              title="Editions">
              <Text style={{ borderWidth: 1, borderRadius: 5, backgroundColor: 'lightgrey'}}>
                {' '}{item.NOM_EDITION}{' '}
              </Text>
            </TouchableOpacity>
          </View>
          <AchatSponsorIcon item={item} />

          <WebView style={{ contentInsetAdjustmentBehavior: 'always', width: '100%' }} scalesPageToFit={false} source={{ html: '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>' + item.HISTOIRE_TOME + '</body></html>' }} />
        </View>
        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        {loading ? LoadingIndicator() : null}


        {/* Editions chooser */}
        <BottomSheet
          isVisible={showEditionsChooser}
          containerStyle={{ backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)' }}>
          <ListItem key='0'>
            <ListItem.Content>
              <ListItem.Title>Editions</ListItem.Title>
            </ListItem.Content>
          </ListItem>
          {albumEditionsData.map((item, index) => (
            <ListItem key={index + 1}
              containerStyle={
                (index == editionIndex ? { backgroundColor: 'dodgerblue' } : { backgroundColor: 'white' })}
              onPress={() => {
                onChooseEdition(index);
              }}>
              <ListItem.Content>
                <ListItem.Title style={
                  (index == editionIndex ? { color: 'white' } : { color: 'dodgerblue' })}>
                  {item.NOM_EDITION}
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))}
        </BottomSheet>

      </ScrollView>
    </SafeAreaView>
  );
}

export default AlbumScreen;
