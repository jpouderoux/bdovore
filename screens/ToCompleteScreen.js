import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import CommonStyles from '../styles/CommonStyles';
import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager';

import { AlbumItem } from '../components/AlbumItem';
import { SmallLoadingIndicator } from '../components/SmallLoadingIndicator';


function ToCompleteScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
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

  const onDataFetched = (result) => {
    setNbAlbums(result.totalItems);
    setData(result.items);
    setErrortext(result.error);
    setLoading(result.totalItems != Object.keys(result.items).length);

    if (result.error) {
      setTimeout(() => { fetchData(); }, 2000);
    }
  }

  const fetchData = async () => {
    setLoading(true);
    setNbAlbums(0);
    setData([]);
    setErrortext('');
    APIManager.fetchAlbumsManquants({ navigation: navigation }, onDataFetched)
      .then().catch((error) => console.log(error));
  }

  const renderItem = ({ item, index }) => {
    return AlbumItem({ navigation, item, index });
  }

  const keyExtractor = useCallback((item, index) =>
    Helpers.makeAlbumUID(item));

  return (
    <SafeAreaView style={CommonStyles.screenStyle}>
      <View>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <Text style={{ flex: 1, margin: 5, fontSize: 16 }}>
            {loading ? '' : Helpers.pluralWord(nbAlbums, 'album')}
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
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={Helpers.renderSeparator}
        />
      </View>
    </SafeAreaView>
  )
}

export default ToCompleteScreen;
