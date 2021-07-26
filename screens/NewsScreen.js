import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, View } from 'react-native';
import { ButtonGroup, Switch } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager'
import { AlbumItem } from '../components/AlbumItem';
import CommonStyles from '../styles/CommonStyles';

function NewsScreen({ navigation }) {
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [nbAlbums, setNbAlbums] = useState(0);
  const [dataFetched, setDataFetched] = useState(false);
  const [cachedToken, setCachedToken] = useState('');
  const [newsMode, setNewsMode] = useState(0);

  // Move to login page if no token available
  APIManager.checkForToken(navigation);

  const refreshDataIfNeeded = async () => {
    console.log("refresh data wishlist");
    AsyncStorage.getItem('token').then((token) => {
      if (token !== cachedToken) {
        setCachedToken(token);
        fetchData(newsMode);
      } else if (!dataFetched) {
        fetchData(newsMode);
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

  const fetchData = async (newsMode) => {
    setLoading(true);
    let mode = '';
    if (newsMode === 0) mode = 'BD';
    else if (newsMode === 1) mode = 'Mangas';
    else if (newsMode === 2) mode = 'Comics';
    APIManager.fetchNews(mode, { navigation: navigation }, onDataFetched)
      .then().catch((error) => console.log(error));
  }

  const onPressNewsMode = (selectedIndex) => {
    setNewsMode(selectedIndex);
    fetchData(selectedIndex);
  };

  const renderItem = ({ item, index }) => {
    return AlbumItem({ navigation, item, index });
  }

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', height: '100%' }}>
      <ButtonGroup
        onPress={onPressNewsMode}
        selectedIndex={newsMode}
        buttons={[
          { element: () => <Text>BD</Text> },
          { element: () => <Text>Mangas</Text> },
          { element: () => <Text>Comics</Text> }]}
        containerStyle={{ height: 30 }}
      />
      <View>
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
            ItemSeparatorComponent={Helpers.renderSeparator}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default NewsScreen;
