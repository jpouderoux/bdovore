import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Switch, Text, View } from 'react-native';
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
  const [filteredData, setFilteredData] = useState(null);
  const [nbAlbums, setNbAlbums] = useState(0);
  const [filterByDate, setFilterByDate] = useState(false);
  let [cachedToken, setCachedToken] = useState('');

  Helpers.checkForToken(navigation);

  const refreshDataIfNeeded = async () => {
    AsyncStorage.getItem('token').then((token) => {
      if (token !== cachedToken) {
        console.log("refresh wishlist because token changed from " + cachedToken + ' to ' + token);
        //setCachedToken(token);
        //cachedToken = token;
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

  useEffect(() => {

    if (!filterByDate) {
      setFilteredData(null);
    } else {
      setFilteredData(Helpers.sliceSortByDate(data));
    }
  }, [filterByDate]);

  const onDataFetched = (result) => {
    setNbAlbums(result.nbItems);
    setData(result.items);

    console.log("here");
    global.wishlistAlbums = result.items;
    global.wishlistAlbumsDict = {};
    Helpers.createAlbumDict(global.wishlistAlbums, global.wishlistAlbumsDict);
    console.log(global.wishlistAlbumsDict);

    setErrortext(result.error);
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

  const toggleFilterByDate = () => {
    setFilterByDate(previousState => !previousState);
  }

  const keyExtractor = useCallback((item , index) =>
    Helpers.makeAlbumUID(item));

  return (
    <SafeAreaView style={CommonStyles.screenStyle}>
      <View>
        {loading ? null :
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            <Text style={{ flex: 1, margin: 5, fontSize: 16 }}>
              {Helpers.pluralWord(nbAlbums, 'album')}
            </Text>
            <View></View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ margin: 5, fontSize: 16 }}>Tri par ajout</Text>
              <Switch value={filterByDate}
                onValueChange={toggleFilterByDate} />
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
            data={filteredData ? filteredData : data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={Helpers.renderSeparator}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default WishlistScreen;
