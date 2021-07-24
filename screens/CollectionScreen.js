import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { ButtonGroup, SearchBar } from 'react-native-elements';

import * as APIManager from '../api/APIManager.js'
import { AlbumItem } from '../components/AlbumItem.js';
import { SerieItem } from '../components/SerieItem.js';

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

  useEffect(() => {
    console.log("effect");
    AsyncStorage.getItem('collecFetched').then(v => {
      if (v === 'false') {
        getSeries();
        getAlbums();
      }
    }).catch(()=>{});

    // Make sure data is refreshed when login/token changed
    const willFocusSubscription = navigation.addListener('focus', () => {
      console.log("new focus");
      AsyncStorage.getItem('collecFetched').then(v => {
        if (v === 'false') {
          getSeries();
          getAlbums();
        }
      }).catch(() => { });
    });
    return willFocusSubscription;
  }, []);

  // Move to login page if no token available
  APIManager.checkForToken(navigation).then().catch();

  const onDataFetched = () => {
    console.log("data fetched");
    AsyncStorage.getItem('nbSeries').then(v => setNbSeries(v)).catch(() => { });
    AsyncStorage.getItem('nbAlbums').then(v => setNbAlbums(v)).catch(() => { });
    AsyncStorage.getItem('collectionSeries').then(v => {
      setCollectionSeries(JSON.parse(v));
    }).catch(() => { });
    AsyncStorage.getItem('collectionAlbums').then(v => {
      setCollectionAlbums(JSON.parse(v));
    }).catch(() => { });
    AsyncStorage.setItem('collecFetched', 'true');
  }

  const getSeries = () => {
    APIManager.fetchCollectionData('Userserie', onDataFetched, { navigation: navigation, setErrortext: setErrortext, setLoading: setLoading });
  }

  const getAlbums = () => {
    APIManager.fetchCollectionData('Useralbum', onDataFetched, { navigation: navigation, setErrortext: setErrortext, setLoading: setLoading });
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
