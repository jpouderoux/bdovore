import React, { useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, View } from 'react-native';
import { Switch } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager'
import CommonStyles from '../styles/CommonStyles';

import { AlbumItem } from '../components/AlbumItem';
import { LoadingIndicator } from '../components/LoadingIndicator';

function WishlistScreen({ navigation }) {
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [nbAlbums, setNbAlbums] = useState(0);
  const [dataFetched, setDataFetched] = useState(false);
  let [cachedToken, setCachedToken] = useState('');

  // Move to login page if no token available
  APIManager.checkForToken(navigation);

  const refreshDataIfNeeded = async () => {
    AsyncStorage.getItem('token').then((token) => {
      if (token !== cachedToken) {
        console.log("refresh wishlist because token changed from " + cachedToken + ' to ' + token);
        setCachedToken(token);
        cachedToken = token;
        fetchData();
      }/* else if (!dataFetched) {
        console.log("refresh wishlist because no dat fetched yet");
        fetchData();
      }*/
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

  const onDataFetched = (data) => {
    setNbAlbums(data.nbItems);
    setData(data.items);
    setErrortext(data.error);
    if (data.error === '') {
      setDataFetched(true);
      console.log('fetched!');
    }
    setLoading(false);
  }

  const fetchData = async () => {
    setLoading(true);
    APIManager.fetchWishlist({ navigation: navigation }, onDataFetched)
      .then().catch((error) => console.log(error));
  }

  const renderItem = ({ item, index }) => {
      return AlbumItem({ navigation, item, index });
  }


  return (
    <SafeAreaView style={{ backgroundColor: '#fff', height: '100%' }}>
      <View>
        {loading ? null :
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ flex: 1, margin: 5, fontSize: 16 }}>{nbAlbums} album{nbAlbums > 1 ? 's' : ''}</Text>
          <View></View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ margin: 5, fontSize: 16 }}>Tri par ajout</Text>
            <Switch value={false} />
          </View>
        </View>}
        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        {loading ? LoadingIndicator() : (
          <FlatList
            maxToRenderPerBatch={20}
            windowSize={12}
            data={data}
            keyExtractor={({ item }, index) => index}
            renderItem={renderItem}
            ItemSeparatorComponent={Helpers.renderSeparator}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default WishlistScreen;
