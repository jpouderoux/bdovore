import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { Rating } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import CommonStyles from '../styles/CommonStyles';
import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager';

import { CoverImage } from '../components/CoverImage';
import { SmallLoadingIndicator } from '../components/SmallLoadingIndicator';


function ToCompleteScreen({ navigation }) {
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [nbAlbums, setNbAlbums] = useState(0);
  let [cachedToken, setCachedToken] = useState('');

  Helpers.checkForToken(navigation);

  const refreshDataIfNeeded = () => {
    AsyncStorage.getItem('token').then((token) => {
      if (token !== cachedToken) {
        console.log("refresh tocomplete because token changed from " + cachedToken + ' to ' + token);
        setCachedToken(token);
        cachedToken = token;
        fetchData();
      }
    }).catch(() => { });
  }

  useEffect(() => {
    refreshDataIfNeeded();
    // Make sure data is refreshed when login/token changed
    const willFocusSubscription = navigation.addListener('focus', () => {
      refreshDataIfNeeded();
    });
    return willFocusSubscription;
  }, [cachedToken]);

  const onPressAlbum = (item) => {
    navigation.navigate('Album', { item });
  }

  const onIWantIt = () => {
  }

  const onDataFetched = (result) => {
    setNbAlbums(result.totalItems);
    setData(result.items);
    setErrortext(result.error);
    setLoading(result.totalItems != Object.keys(result.items).length);
  }

  const fetchData = async () => {
    setLoading(true);
    setNbAlbums(0);
    setData([]);
    APIManager.fetchAlbumsManquants({ navigation: navigation }, onDataFetched)
      .then().catch((error) => console.log(error));
  }

  const renderAlbum = ({ item, index }) => {
    const tome = (item.NUM_TOME !== null) ? "tome " + item.NUM_TOME : '';
    return (
      <TouchableOpacity key={index} onPress={() => onPressAlbum(item)}>
        <View style={{ flexDirection: 'row' }}>
          <View>
            <CoverImage source={APIManager.getAlbumCoverURL(item)} />
          </View>
          <View style={{ margin: 5, flexDirection: "column", flexGrow: 3 }}>
            <Text style={CommonStyles.bold}>{item.TITRE_TOME}</Text>
            <Text>{item.NOM_SERIE} {tome}</Text>
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
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginRight: 10 }}>
              <TouchableOpacity onPress={onIWantIt} title="" >
                <Icon name='check-bold' size={25} color='#f22' />
              </TouchableOpacity>
              <TouchableOpacity onPress={onIWantIt} title="" >
                <Icon name='heart' size={25} color='#f22' />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={CommonStyles.screenStyle}>
      <View>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <Text style={{ flex: 1, margin: 5, fontSize: 16 }}>
            {Helpers.pluralWord(nbAlbums, 'album')}
          </Text>
          {loading ? <SmallLoadingIndicator /> : null}
        </View>
        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        <FlatList
          maxToRenderPerBatch={20}
          windowSize={12}
          data={data}
          keyExtractor={({ item }, index) => index}
          renderItem={renderAlbum}
          ItemSeparatorComponent={Helpers.renderSeparator}
        />
      </View>
    </SafeAreaView>
  )
}

export default ToCompleteScreen;
