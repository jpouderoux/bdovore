import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { BottomSheet, ButtonGroup, ListItem, SearchBar } from 'react-native-elements';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import CommonStyles from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager';
import CollectionManager from '../api/CollectionManager';
import * as Helpers from '../api/Helpers'

import { AlbumItem } from '../components/AlbumItem';
import { SmallLoadingIndicator } from '../components/SmallLoadingIndicator';
import { SerieItem } from '../components/SerieItem';

function CollectionScreen({ props, navigation }) {

  const [collectionAlbums, setCollectionAlbums] = useState([]);
  const [collectionMode, setCollectionMode] = useState(0);
  const [collectionSeries, setCollectionSeries] = useState([]);
  const [errortext, setErrortext] = useState('');
  const [filteredAlbums, setFilteredAlbums] = useState(null);
  const [filteredSeries, setFilteredSeries] = useState(null);
  const [itemMode, setItemMode] = useState(0);
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [nbTotalAlbums, setNbTotalAlbums] = useState(0);
  const [nbTotalSeries, setNbTotalSeries] = useState(0);
  const [showCollectionChooser, setShowCollectionChooser] = useState(false);
  const [showSortChooser, setShowSortChooser] = useState(false);
  const [sortMode, setSortMode] = useState(0);
  let loadingSteps = 0;
  let [cachedToken, setCachedToken] = useState('');

  const collectionModes = {
    0: ['Tout', ''],
    1: ['BD', ' BD'],
    2: ['Mangas', ' mangas'],
    3: ['Comics', ' comics'],
  };

  const sortModes = {
    0: 'Tri par série',
    1: 'Tri par date d\'ajout',
  }

  Helpers.checkForToken(navigation);

  function refreshDataIfNeeded() {
    AsyncStorage.getItem('token').then((token) => {
      if (token !== cachedToken) {
        console.log('refresh collection data because token changed to ' + token);
        setCachedToken(token);
        setKeywords('');
        setSortMode(0);
        setNbTotalSeries(0);
        setNbTotalAlbums(0);
        setFilteredSeries(null);
        setFilteredAlbums(null);
        setCollectionSeries([]);
        setCollectionAlbums([]);
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

  useEffect(() => {
    navigation.setOptions({
      title: ('Ma collection' + (collectionMode > 0 ? (' - ' + collectionModes[collectionMode][0]) : '')),
    });
    applyFilters();
  }, [collectionMode, sortMode, keywords]);

  const applyFilters = () => {

    if (keywords == '' && collectionMode == 0) {
      setFilteredSeries(null);
      setFilteredAlbums(sortMode == 1 ? Helpers.sliceSortByDate(collectionAlbums) : null);
      return;
    }

    const isInCurrentCollection = (origine) =>
      (collectionMode == 0) ||
      (collectionMode == 1 && origine === 'BD') ||
      (collectionMode == 2 && origine === 'Mangas') ||
      (collectionMode == 3 && origine === 'Comics');

    const lowerSearchText = Helpers.lowerCaseNoAccentuatedChars(keywords);

    for (let mode = 0; mode < 2; mode++) {

      let data = (mode == 0) ? collectionSeries : collectionAlbums;

      let filteredData = data.filter(function (item) {
        if (!isInCurrentCollection(item.ORIGINE)) {
          return false;
        }
        if (keywords === '') {
          return true;
        }
        // search text in lowercase title without taking accents
        let title = mode == 0 ? item.NOM_SERIE : item.TITRE_TOME;
        return (title ? Helpers.lowerCaseNoAccentuatedChars(title).includes(lowerSearchText) : false);
      });

      if (mode == 0) {
        setFilteredSeries(filteredData);
      } else {
        setFilteredAlbums(sortMode == 1 ? Helpers.sliceSortByDate(filteredData) : filteredData);
      }
    }
  }

  const fetchData = () => {
    setLoading(true);
    loadingSteps = 3;
    CollectionManager.fetchSeries(navigation, onSeriesFetched);
    CollectionManager.fetchAlbums(navigation, onAlbumsFetched);
    CollectionManager.fetchWishlist(navigation, onWishlistFetched);
  }

  const onSeriesFetched = async (result) => {
    setNbTotalSeries(result.totalItems);
    setCollectionSeries(result.items);

    setErrortext(result.error);
    loadingSteps -= (result.done ? 1 : 0);
    setLoading(loadingSteps != 0);
  }

  const onAlbumsFetched = async (result) => {
    setNbTotalAlbums(result.totalItems);
    setCollectionAlbums(result.items);

    setErrortext(result.error);
    loadingSteps -= (result.done ? 1 : 0);
    setLoading(loadingSteps != 0);
  }

  const onWishlistFetched = (result) => {
    setErrortext(result.error);
    loadingSteps--;
    setLoading(loadingSteps != 0);
  }

  const onPressItemMode = (selectedIndex) => {
    setItemMode(selectedIndex);
  };

  const onCollectionModePress = () => {
    setShowCollectionChooser(true);
  }

  const onSortModePress = () => {
    if (itemMode == 1) {
      setShowSortChooser(true);
    }
  }

  const renderItem = ({ item, index }) => {
    switch (itemMode) {
      case 0: return SerieItem({ navigation, item, index, collectionMode: true });
      case 1: return AlbumItem({ navigation, item, index, collectionMode: true });
    }
  }

  const onSearchChanged = (searchText) => {
    setKeywords(searchText);
  }

  const keyExtractor = useCallback((item, index) =>
    itemMode == 0 ? parseInt(item.ID_SERIE) : Helpers.makeAlbumUID(item));

  return (
    <SafeAreaView style={CommonStyles.screenStyle}>
      <View style={{ flexDirection: 'row' }}>
        <ButtonGroup
          onPress={onPressItemMode}
          selectedIndex={itemMode}
          buttons={[
            {
              element: () => <Text>
                {Helpers.pluralWord(filteredSeries ? filteredSeries.length : nbTotalSeries, 'série')}</Text>
            },
            {
              element: () => <Text>
                {Helpers.pluralWord(filteredAlbums ? filteredAlbums.length : nbTotalAlbums, 'album')}</Text>
            }]}
          containerStyle={{ height: 30, flex: 1, borderRadius: 10, backgroundColor: 'lightgrey'  }}
          buttonStyle={{ borderRadius: 10, backgroundColor: 'lightgrey' }}
        />
        {loading ? <SmallLoadingIndicator /> : null}
        <TouchableOpacity onPress={onCollectionModePress} style={{ flex: 0, margin: 8 }}>
          <Ionicons name='library-sharp' size={25} color='#222' />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <SearchBar
            placeholder={'Rechercher dans mes ' + (itemMode == 0 ? 'séries' : 'albums') + collectionModes[collectionMode][1] + '...'}
            onChangeText={onSearchChanged}
            value={keywords}
            platform='ios'
            autoCapitalize='none'
            autoCorrect={false}
            inputContainerStyle={{ height: 20, }}
            inputStyle={{ fontSize: 12 }}
            cancelButtonTitle='Annuler'
          />
        </View>
        <TouchableOpacity onPress={onSortModePress} style={{ flex: 0, margin: 8 }}>
          <Icon name='sort-variant' size={25} color='#222' />
        </TouchableOpacity>
      </View>
      <View>
        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        <FlatList
            maxToRenderPerBatch={6}
            windowSize={10}
            data={(itemMode == 0 ? (filteredSeries ? filteredSeries : collectionSeries) : (filteredAlbums ? filteredAlbums : collectionAlbums))}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={Helpers.renderSeparator}
        />
      </View>

      {/* Collection chooser */}
      <BottomSheet
        isVisible={showCollectionChooser}
        containerStyle={{ backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)' }}>
        <ListItem key='0'>
          <ListItem.Content>
            <ListItem.Title>Collection à afficher</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        {Object.entries(collectionModes).map(([mode, title], index) => (
          <ListItem key={index + 1}
            containerStyle={
              (collectionMode == mode ? { backgroundColor: 'dodgerblue' } : { backgroundColor: 'white' })}
            onPress={() => {
              setCollectionMode(mode); setShowCollectionChooser(false);
            }}>
            <ListItem.Content>
              <ListItem.Title style={
                (collectionMode == mode ? { color: 'white' } : { color: 'dodgerblue' })}>
                {title[0]}
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        ))}
      </BottomSheet>

      {/* Sort chooser */}
      <BottomSheet
        isVisible={showSortChooser}
        containerStyle={{ backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)' }}>
        <ListItem key='0'>
          <ListItem.Content>
            <ListItem.Title>Trier</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        {Object.entries(sortModes).map(([mode, title], index) => (
          <ListItem key={index + 1}
            containerStyle={
              (sortMode == mode ? { backgroundColor: 'dodgerblue' } : { backgroundColor: 'white' })}
            onPress={() => {
              setSortMode(mode); setShowSortChooser(false);
            }}>
            <ListItem.Content>
              <ListItem.Title style={
                (sortMode == mode ? { color: 'white' } : { color: 'dodgerblue' })}>
                {title}
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        ))}
      </BottomSheet>
    </SafeAreaView>
  );
}

export default CollectionScreen;
