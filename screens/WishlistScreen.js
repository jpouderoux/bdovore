import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, View } from 'react-native';
import { Switch } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';

import { AlbumItem } from '../components/AlbumItem';
import * as APIManager from '../api/APIManager'
import CommonStyles from '../styles/CommonStyles';

function WishlistScreen({ navigation }) {
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [nbAlbums, setNbAlbums] = useState(0);
  const [dataFetched, setDataFetched] = useState(false);
  const [cachedToken, setCachedToken] = useState('');

  // Move to login page if no token available
  APIManager.checkForToken(navigation);

  const refreshDataIfNeeded = async () => {
    console.log("refresh data wishlist");
    AsyncStorage.getItem('token').then((token) => {
      if (token !== cachedToken) {
        setCachedToken(token);
        fetchData();
      } else if (!dataFetched) {
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
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ flex: 1, margin: 5, fontSize: 16 }}>{nbAlbums} album{nbAlbums > 1 ? 's' : ''}</Text>
          <View></View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ margin: 5, fontSize: 16 }}>Tri par ajout</Text>
            <Switch value={false} />
          </View>
        </View>
        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        {loading ? <ActivityIndicator size="large" color="#f00f0f" /> : (
          <FlatList
            maxToRenderPerBatch={20}
            windowSize={12}
            data={data}
            keyExtractor={({ item }, index) => index}
            renderItem={renderItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default WishlistScreen;
