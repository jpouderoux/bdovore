import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { ButtonGroup, SearchBar } from 'react-native-elements';

import * as APIManager from '../api/APIManager.js'
import { AlbumItem } from '../components/AlbumItem.js';
import { SerieItem } from '../components/SerieItem.js';
import CommonStyles from '../styles/CommonStyles.js';

function CollectionScreen({ navigation }) {
  const [keywords, setKeywords] = useState('');
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [collectionAlbums, setCollectionAlbums] = useState([]);
  const [collectionSeries, setCollectionSeries] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [nbSeries, setNbSeries] = useState(0);
  const [nbAlbums, setNbAlbums] = useState(0);
  const [collecMode, setCollecMode] = useState(0);
  const [dataFetched, setDataFetched] = useState(false);
  const [cachedToken, setCachedToken] = useState('');

  // Move to login page if no token available
  APIManager.checkForToken(navigation).then().catch();

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

  const fetchData = () => {
    fetchSeries();
    fetchAlbums();
  }

  const fetchSeries = () => {
    setLoading(true);
    APIManager.fetchCollectionData('Userserie', { navigation: navigation }, onSeriesFetched );
  }

  const fetchAlbums = () => {
    setLoading(true);
    APIManager.fetchCollectionData('Useralbum', { navigation: navigation }, onAlbumsFetched);
  }

  const onSeriesFetched = async (data) => {
    console.log("series fetched");

    //AsyncStorage.setItem('nbSeries', data.nbItems.toString());
    //AsyncStorage.setItem('collectionSeries', JSON.stringify(data.items));

    setNbSeries(data.nbItems);
    setCollectionSeries(data.items);

    if (!!data.error) {
      setErrortext('');
      setDataFetched(true);
    } else {
      setErrortext(data.error);
    }

    AsyncStorage.setItem('collecFetched', (data.error === null) ? 'true' : 'false');
    setLoading(false);
  }

  const onAlbumsFetched = async (data) => {
    console.log("albums fetched");

    //AsyncStorage.setItem('nbAlbums', data.nbItems.toString());
    //AsyncStorage.setItem('collectionAlbums', JSON.stringify(data.items));

    setNbAlbums(data.nbItems);
    setCollectionAlbums(data.items);

    if (!!data.error) {
      setErrortext('');
      setDataFetched(true);
    } else {
      setErrortext(data.error);
    }

    AsyncStorage.setItem('collecFetched', (data.error === null) ? 'true' : 'false');
    setLoading(false);
  }

  const onPressSearchMode = (selectedIndex) => {
    setCollecMode(selectedIndex);
  };

  const renderItem = ({ item, index }) => {
    if (collecMode == 0) {
      return SerieItem({ navigation, item, index });
    }
    if (collecMode == 1) {
      return AlbumItem({ navigation, item, index });
    }
  }

  const onSearchChanged = (searchText) => {
    setKeywords(searchText);
    let data = (collecMode == 0) ? collectionSeries : collectionAlbums;
    let filteredData = data.filter(function (item) {
      let title = collecMode == 0 ? item.NOM_SERIE : item.TITRE_TOME;
      title = title.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accents
      return title ? title.toLowerCase().includes(searchText.toLowerCase()): false;
    });
    setFilteredData(filteredData);
  }

  return (
    <SafeAreaView style={{ backgroundColor: '#fff' }}>
      <ButtonGroup
        onPress={onPressSearchMode}
        selectedIndex={collecMode}
        buttons={[
          { element: () => <Text>{nbSeries} série{nbSeries > 1 ? 's' : ''}</Text> },
          { element: () => <Text>{nbAlbums} album{nbAlbums > 1 ? 's' : ''}</Text> }]}
        containerStyle={{ height: 30 }}
      />
      <SearchBar
        placeholder={'Rechercher dans mes ' + (collecMode == 0 ? 'séries' : 'albums') + '...'}
        onChangeText={onSearchChanged}
        value={keywords}
        platform='ios'
        autoCapitalize='none'
        autoCorrect={false}
        inputContainerStyle={{height:20,}}
        inputStyle={{fontSize: 13 }}
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
            data={keywords && keywords !== '' ? filteredData : (collecMode == 0 ? collectionSeries : collectionAlbums)}
            keyExtractor={({ item }, index) => index}
            renderItem={renderItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default CollectionScreen;
