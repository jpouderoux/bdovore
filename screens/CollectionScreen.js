import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { BottomSheet, ButtonGroup, ListItem, SearchBar } from 'react-native-elements';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import CommonStyles from '../styles/CommonStyles';
import CollectionManager from '../api/CollectionManager';
import * as Helpers from '../api/Helpers'

import { AlbumItem } from '../components/AlbumItem';
import { SmallLoadingIndicator } from '../components/SmallLoadingIndicator';
import { SerieItem } from '../components/SerieItem';

function CollectionScreen({ props, navigation }) {

  const [collectionAlbums, setCollectionAlbums] = useState([]);
  const [collectionGenre, setCollectionGenre] = useState(0);
  const [collectionSeries, setCollectionSeries] = useState([]);
  const [errortext, setErrortext] = useState('');
  const [filteredAlbums, setFilteredAlbums] = useState(null);
  const [filteredSeries, setFilteredSeries] = useState(null);
  const [filterMode, setFilterMode] = useState(0);
  const [collectionType, setCollectionType] = useState(0);
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [nbTotalAlbums, setNbTotalAlbums] = useState(0);
  const [nbTotalSeries, setNbTotalSeries] = useState(0);
  const [showCollectionChooser, setShowCollectionChooser] = useState(false);
  const [showFilterChooser, setShowFilterChooser] = useState(false);
  const [showSortChooser, setShowSortChooser] = useState(false);
  const [sortMode, setSortMode] = useState(0);
  let loadingSteps = 0;
  let [cachedToken, setCachedToken] = useState('');

  const collectionGenres = {
    0: ['Tout', ''],
    1: ['BD', ' BD'],
    2: ['Mangas', ' mangas'],
    3: ['Comics', ' comics'],
  };

  const sortModes = {
    0: 'Tri par série',
    1: 'Tri par date d\'ajout',
  }

  const filterModes = {
    0: 'Tous',
    1: 'Non lu',
    2: 'Prêt',
    3: 'Numérique',
  }

  const filterModesSearch = {
    0: 'Rechercher dans tous mes albums...',
    1: 'Rechercher dans mes albums non lus...',
    2: 'Rechercher dans mes albums prêtés...',
    3: 'Rechercher dans mes albums numériques...',
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
      title: ('Ma collection' + (collectionGenre > 0 ? (' - ' + collectionGenres[collectionGenre][0]) : '')),
    });
    applyFilters();
  }, [collectionGenre, collectionType, filterMode, sortMode, keywords]);

  const applyFilters = () => {

    if (keywords == '' && collectionGenre == 0 && filterMode == 0) {
      setFilteredSeries(null);
      setFilteredAlbums(sortMode == 1 ? Helpers.sliceSortByDate(collectionAlbums) : null);
      return;
    }

    const isInCurrentCollectionGenre = (item) =>
      (collectionGenre == 0) ||
      (collectionGenre == 1 && item.origine === 'BD') ||
      (collectionGenre == 2 && item.origine === 'Mangas') ||
      (collectionGenre == 3 && item.origine === 'Comics');

    const lowerSearchText = Helpers.lowerCaseNoAccentuatedChars(keywords);

    for (let mode = 0; mode < 2; mode++) {

      let data = (mode == 0) ? collectionSeries : collectionAlbums;

      let filteredData = data.filter((item) => {
        if (!isInCurrentCollectionGenre(item)) {
          return false;
        }
        if (keywords != '') {
          // search text in lowercase title without taking accents
          let title = mode == 0 ? item.NOM_SERIE : item.TITRE_TOME;
          if (title && !Helpers.lowerCaseNoAccentuatedChars(title).includes(lowerSearchText)) {
            return false;
          }
        }
        if (mode === 1) {
          switch (parseInt(filterMode)) {
            case 1: return item.FLG_LU != 'N';
            case 2: return item.FLG_PRET != 'N';
            case 3: return item.FLG_NUM != 'N';
          }
        }
        return true;
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

  const onPressCollectionType = (selectedIndex) => {
    setCollectionType(selectedIndex);
  };

  const onCollectionGenrePress = () => {
    setShowCollectionChooser(true);
  }

  const onFilterModePress = () => {
    if (collectionType == 1) {
      setShowFilterChooser(true);
    }
  }

  const onSortModePress = () => {
    if (collectionType == 1) {
      setShowSortChooser(true);
    }
  }

  const renderItem = ({ item, index }) => {
    switch (parseInt(collectionType)) {
      case 0: return SerieItem({ navigation, item, index, collectionGenre: true });
      case 1: return AlbumItem({ navigation, item, index, collectionGenre: true });
    }
  }

  const onSearchChanged = (searchText) => {
    setKeywords(searchText);
  }

  const keyExtractor = useCallback((item, index) =>
    collectionType == 0 ? parseInt(item.ID_SERIE) : Helpers.makeAlbumUID(item));

  return (
    <SafeAreaView style={CommonStyles.screenStyle}>
      <View style={{ flexDirection: 'row' }}>
        <ButtonGroup
          onPress={onPressCollectionType}
          selectedIndex={collectionType}
          buttons={[
            {
              element: () => <Text>
                {Helpers.pluralWord(filteredSeries ? filteredSeries.length : nbTotalSeries, 'série')}</Text>
            },
            {
              element: () => <Text>
                {Helpers.pluralWord(filteredAlbums ? filteredAlbums.length : nbTotalAlbums, 'album')}</Text>
            }]}
          containerStyle={{ height: 30, flex: 1, borderRadius: 10, backgroundColor: 'lightgrey' }}
          buttonStyle={{ borderRadius: 10, backgroundColor: 'lightgrey' }}
        />
        {loading ? <SmallLoadingIndicator /> : null}
        <TouchableOpacity onPress={onCollectionGenrePress} style={{ flex: 0, margin: 8 }}>
          <Ionicons name='library-sharp' size={25} color='#222' />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <SearchBar
            placeholder={(collectionType == 1 && filterMode != 0) ?
              filterModesSearch[filterMode] :
              'Rechercher dans mes ' + (collectionType == 0 ? 'séries' : 'albums') + collectionGenres[collectionGenre][1] + '...'}
            onChangeText={onSearchChanged}
            value={keywords}
            platform='ios'
            autoCapitalize='none'
            autoCorrect={false}
            inputContainerStyle={{ height: 20, backgroundColor: 'lightgrey' }}
            inputStyle={{ fontSize: 12 }}
            cancelButtonTitle='Annuler'
            onFocus={()=>console.log("tete")}
            onEndEditing={() => console.log("fini")}
            onCancel={()=> console.log("cancel")}
          />
        </View>
        {collectionType != 0 ?
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={onFilterModePress} style={{ flex: 0, margin: 8 }}>
              <Icon name={filterMode == 0 ? 'filter-outline' : 'filter-remove'} size={25} color={filterMode == 0 ? '#222' : 'dodgerblue'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onSortModePress} style={{ flex: 0, margin: 8 }}>
              <Icon name='sort-variant' size={25} color={sortMode == 0 ? '#222' : 'dodgerblue'}  />
            </TouchableOpacity>
          </View> : null}
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
          data={(collectionType == 0 ? (filteredSeries ? filteredSeries : collectionSeries) : (filteredAlbums ? filteredAlbums : collectionAlbums))}
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
        {Object.entries(collectionGenres).map(([mode, title], index) => (
          <ListItem key={index + 1}
            containerStyle={
              (collectionGenre == mode ? { backgroundColor: 'dodgerblue' } : { backgroundColor: 'white' })}
            onPress={() => {
              setCollectionGenre(mode); setShowCollectionChooser(false);
            }}>
            <ListItem.Content>
              <ListItem.Title style={
                (collectionGenre == mode ? { color: 'white' } : { color: 'dodgerblue' })}>
                {title[0]}
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        ))}
      </BottomSheet>

      {/* Filter chooser */}
      <BottomSheet
        isVisible={showFilterChooser}
        containerStyle={{ backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)' }}>
        <ListItem key='0'>
          <ListItem.Content>
            <ListItem.Title>Filtrer</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        {Object.entries(filterModes).map(([mode, title], index) => (
          <ListItem key={index + 1}
            containerStyle={
              (filterMode == mode ? { backgroundColor: 'dodgerblue' } : { backgroundColor: 'white' })}
            onPress={() => {
              setFilterMode(mode); setShowFilterChooser(false);
            }}>
            <ListItem.Content>
              <ListItem.Title style={
                (filterMode == mode ? { color: 'white' } : { color: 'dodgerblue' })}>
                {title}
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
