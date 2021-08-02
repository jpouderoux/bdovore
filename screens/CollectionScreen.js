/* Copyright 2021 Joachim Pouderoux & Association Bdovore
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
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
  const [collectionType, setCollectionType] = useState(0); // 0: Series, 1: Albums
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

  const collectionTypes = {
    0: 'série',
    1: 'album',
  }

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
  }, [collectionGenre]);

  useEffect(() => {
    applyFilters();
  }, [collectionType, filterMode, sortMode, keywords]);

  const filterCollection = (collection, mode) => {

    const lowerSearchText = Helpers.lowerCaseNoAccentuatedChars(keywords);

    const isInCurrentCollectionGenre = (item) =>
      (collectionGenre == 0) ||
      (collectionGenre == 1 && item.ORIGINE === 'BD') ||
      (collectionGenre == 2 && item.ORIGINE === 'Mangas') ||
      (collectionGenre == 3 && item.ORIGINE === 'Comics');

    return collection.filter((item) => {
      // Check if album/serie is in currently selection collection genre (All/BD/Mangas/Comics)
      if (!isInCurrentCollectionGenre(item)) {
        return false;
      }
      // Search for keywords if provided
      if (keywords != '') {
        // search text in lowercase title without taking accents
        let title = mode == 0 ? item.NOM_SERIE : item.TITRE_TOME;
        if (title && !Helpers.lowerCaseNoAccentuatedChars(title).includes(lowerSearchText)) {
          return false;
        }
      }
      // For albums, check the status of selected flag
      if (mode === 1) {
        switch (parseInt(filterMode)) {
          case 1: return item.FLG_LU != 'N';
          case 2: return item.FLG_PRET == 'O';
          case 3: return item.FLG_NUM == 'O';
        }
      }
      return true;
    });
  }

  const applyFilters = () => {

    if (keywords == '' && collectionGenre == 0 && filterMode == 0) {
      setFilteredSeries(null);
      setFilteredAlbums(sortMode == 1 ? Helpers.sliceSortByDate(collectionAlbums) : null);
      return;
    }

    setFilteredSeries(filterCollection(collectionSeries, 0));
    const filteredAlbums = filterCollection(collectionAlbums, 1);
    setFilteredAlbums(sortMode == 1 ? Helpers.sliceSortByDate(filteredAlbums) : filteredAlbums);
  }

  const fetchData = () => {
    setLoading(true);
    loadingSteps = 3;
    CollectionManager.fetchSeries(navigation, onSeriesFetched);
    CollectionManager.fetchAlbums(navigation, onAlbumsFetched);
    CollectionManager.fetchWishlist(navigation, onWishlistFetched);
  }

  const onSeriesFetched = async (result) => {
    setErrortext(result.error);
    setNbTotalSeries(result.totalItems);
    setCollectionSeries(result.items);

    applyFilters();

    loadingSteps -= (result.done ? 1 : 0);
    setLoading(loadingSteps != 0);
  }

  const onAlbumsFetched = async (result) => {
    setErrortext(result.error);
    setNbTotalAlbums(result.totalItems);
    setCollectionAlbums(result.items);

    applyFilters();

    loadingSteps -= (result.done ? 1 : 0);
    setLoading(loadingSteps != 0);
  }

  const onWishlistFetched = (result) => {
    setErrortext(result.error);
    loadingSteps--;
    setLoading(loadingSteps != 0);
  }

  const onPressCollectionType = (selectedIndex) => {
    setCollectionType(parseInt(selectedIndex));
  };

  const onCollectionGenrePress = () => {
    setShowCollectionChooser(true);
  }

  const onFilterModePress = () => {
    setShowFilterChooser(true);
  }

  const onSortModePress = () => {
    setShowSortChooser(true);
  }

  const onSearchChanged = (searchText) => {
    setKeywords(searchText);
  }

  const renderItem = ({ item, index }) => {
    switch (parseInt(collectionType)) {
      case 0: return SerieItem({ navigation, item, index, collectionMode: true });
      case 1: return AlbumItem({ navigation, item, index, collectionMode: true });
    }
  }

  const keyExtractor = useCallback((item, index) =>
    collectionType == 0 ? parseInt(item.ID_SERIE) : Helpers.makeAlbumUID(item));

  return (
    <View style={CommonStyles.screenStyle}>
      <View style={{ flexDirection: 'row', flex:0 }}>
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
              'Rechercher dans mes ' + collectionTypes[collectionType] + 's' + collectionGenres[collectionGenre][1] + '...'}
            onChangeText={onSearchChanged}
            value={keywords}
            platform='ios'
            autoCapitalize='none'
            autoCorrect={false}
            inputContainerStyle={{ height: 20, backgroundColor: 'lightgrey' }}
            inputStyle={{ fontSize: 12 }}
            cancelButtonTitle='Annuler'
          />
        </View>
        {collectionType == 1 ?
          <View style={{ flexDirection: 'row', flex: 0 }}>
            <TouchableOpacity onPress={onFilterModePress} style={{ flex: 0, margin: 8 }}>
              <Icon name={filterMode == 0 ? 'filter-outline' : 'filter-remove'} size={25} color={filterMode == 0 ? '#222' : 'dodgerblue'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onSortModePress} style={{ flex: 0, margin: 8 }}>
              <Icon name='sort-variant' size={25} color={sortMode == 0 ? '#222' : 'dodgerblue'} />
            </TouchableOpacity>
          </View> : null}
      </View>
      <View style={{flex:1}}>
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
    </View>
  );
}

export default CollectionScreen;
