/* Copyright 2021 Joachim Pouderoux & Association BDovore
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
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ButtonGroup, ListItem, SearchBar } from 'react-native-elements';
import * as Progress from 'react-native-progress';
import { useIsFocused } from '@react-navigation/native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { bdovored, bdovorlightred, AlbumItemHeight, CommonStyles } from '../styles/CommonStyles';
import CollectionManager from '../api/CollectionManager';
import * as Helpers from '../api/Helpers'
import { BottomSheet } from '../components/BottomSheet';

import { AlbumItem } from '../components/AlbumItem';
import { SerieItem } from '../components/SerieItem';


const defaultSortMode = 1;

const sortModes = {
  0: 'Tri par série',
  1: 'Tri par date d\'ajout',
}

const serieFilterModes = {
  0: 'Toutes',
  1: 'Complètes',
  2: 'Incomplètes',
}

const filterModes = {
  0: 'Tous',
  1: 'Non lus',
  2: 'Prêtés',
  3: 'Numériques',
}

const filterModesSearch = {
  0: 'Rechercher dans tous mes albums...',
  1: 'Rechercher dans mes albums non lus...',
  2: 'Rechercher dans mes albums prêtés...',
  3: 'Rechercher dans mes albums numériques...',
}

let loadTime = 0;
let loadingSteps = 0;
let nbTotalAlbums = 0;
let nbTotalSeries = 0;
let collectionGenre = 0;
let cachedToken = '';

function CollectionScreen({ route, navigation }) {

  const [errortext, setErrortext] = useState('');
  const [filteredAlbums, setFilteredAlbums] = useState(null);
  const [filteredSeries, setFilteredSeries] = useState(null);
  const [serieFilterMode, setSerieFilterMode] = useState(0);
  const [filterMode, setFilterMode] = useState(0);
  const [collectionType, setCollectionType] = useState(0); // 0: Series, 1: Albums
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSerieFilterChooser, setShowSerieFilterChooser] = useState(false);
  const [showFilterChooser, setShowFilterChooser] = useState(false);
  const [showSortChooser, setShowSortChooser] = useState(false);
  const [sortMode, setSortMode] = useState(defaultSortMode);  // 0: Default, 1: Sort by date
  const [progressRate, setProgressRate] = useState(0);

  collectionGenre = route.params.collectionGenre;

  const isFocused = useIsFocused();

  Helpers.checkForToken(navigation);

  function refreshDataIfNeeded() {
    AsyncStorage.getItem('token').then((token) => {
      if (token !== cachedToken) {
        console.debug('refresh collection data because token changed to ' + token);
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
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: ('Ma collection' + (collectionGenre > 0 ? (' - ' + CollectionManager.CollectionGenres[collectionGenre][0]) : '')),
    });
    applyFilters();
  }, [collectionGenre]);

  useEffect(() => {
    applyFilters();
  }, [collectionType, filterMode, serieFilterMode, sortMode, keywords]);

  const filterCollection = (collection, mode) => {

    const lowerSearchText = Helpers.lowerCaseNoAccentuatedChars(keywords);

    return collection.filter((item) => {
      // Search for keywords if provided
      if (keywords != '') {
        // search text in lowercase title without taking accents
        let title = mode == 0 ? item.NOM_SERIE : item.TITRE_TOME;
        if (title && !Helpers.lowerCaseNoAccentuatedChars(title).includes(lowerSearchText)) {
          return false;
        }
      }
      if (mode == 0) {
        // Filter serie according there completeness status and requested filter mode
        const fMode = parseInt(serieFilterMode);
        if (fMode > 0) {
          const isComplete = CollectionManager.isSerieComplete(item);
          if (fMode == 1) return isComplete;
          if (fMode == 2) return !isComplete;
        }
      }
      else {
        // For albums, check the status of selected filter modes
        switch (parseInt(filterMode)) {
          case 1: return item.FLG_LU == 'N';
          case 2: return item.FLG_PRET == 'O';
          case 3: return item.FLG_NUM == 'O';
        }
      }
      return true;
    });
  }

  const applyFilters = () => {

    if (keywords == '' && collectionGenre == 0 && filterMode == 0) {
      setFilteredAlbums(sortMode == 1 ? Helpers.sliceSortByDate(CollectionManager.getAlbums()) : null);
    } else {
      const filteredAlbums = filterCollection(CollectionManager.getAlbums(collectionGenre), 1);
      setFilteredAlbums(sortMode == 1 ? Helpers.sliceSortByDate(filteredAlbums) : filteredAlbums);
    }

    if (keywords == '' && collectionGenre == 0 && serieFilterMode == 0) {
      setFilteredSeries(null);
    }
    else {
      setFilteredSeries(filterCollection(CollectionManager.getSeries(collectionGenre), 0));
    }
  }

  const fetchData = () => {
    setKeywords('');
    setSortMode(defaultSortMode);
    setLoading(true);
    setFilteredSeries(null);
    setFilteredAlbums(null);
    setProgressRate(0);
    nbTotalSeries = 0;
    nbTotalAlbums = 0;
    loadingSteps = 3;
    loadTime = Date.now();
    if (global.verbose && global.isConnected) {
      Helpers.showToast(false, 'Téléchargement de la collection...');
    }
    CollectionManager.fetchWishlist(navigation, onWishlistFetched);
    CollectionManager.fetchSeries(navigation, onSeriesFetched);
    CollectionManager.fetchAlbums(navigation, onAlbumsFetched);
  }

  const makeProgress = (result) => {
    loadingSteps -= (result.done ? 1 : 0);
    setLoading(loadingSteps != 0);

    if (loadingSteps == 0) {
      const millis = Date.now() - loadTime;
      console.debug('Collection loaded in ' + millis / 1000 + ' seconds');
    }

    let rate = 1;
    if (parseFloat(nbTotalAlbums) > 0 && parseFloat(nbTotalSeries) > 0) {
      const nbTotalItems = parseFloat(nbTotalAlbums) + parseFloat(nbTotalSeries);
      rate = parseFloat(CollectionManager.numberOfSeries() + CollectionManager.numberOfAlbums()) / nbTotalItems;
      //console.debug("progress rate " + rate + " nbtotal:" + nbTotalItems + " loaded: " + parseFloat(CollectionManager.numberOfSeries() + CollectionManager.numberOfAlbums()));
    }
    setProgressRate(rate);
  }

  const onSeriesFetched = async (result) => {
    setErrortext(result.error);
    nbTotalSeries = result.totalItems ?? result.items.length;

    applyFilters();

    makeProgress(result);
  }

  const onAlbumsFetched = async (result) => {
    setErrortext(result.error);
    nbTotalAlbums = result.totalItems ?? result.items.length;

    applyFilters();

    makeProgress(result);
  }

  const onWishlistFetched = (result) => {
    setErrortext(result.error);

    makeProgress(result);
  }

  const onPressCollectionType = (selectedIndex) => {
    setCollectionType(parseInt(selectedIndex));
  }

  const onSerieFilterModePress = () => {
    setShowSerieFilterChooser(true);
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
    if (Helpers.isValid(item)) {
      switch (parseInt(collectionType)) {
        case 0: return SerieItem({ navigation, item: Helpers.toDict(item), index, collectionMode: true });
        case 1: return AlbumItem({ navigation, item: Helpers.toDict(item), index, collectionMode: true });
      }
    }
    return null;
  }

  const keyExtractor = useCallback((item, index) =>
    Helpers.isValid(item) ? (collectionType == 0 ? parseInt(item.ID_SERIE) : Helpers.makeAlbumUID(item)) : index);

  return (
    <View style={CommonStyles.screenStyle}>
      <View style={{ flexDirection: 'row', flex: 0 }}>
        <ButtonGroup
          onPress={onPressCollectionType}
          selectedIndex={collectionType}
          buttons={[{
            element: () => <Text style={CommonStyles.defaultText}>
              {Helpers.pluralWord(filteredSeries ? filteredSeries.length : CollectionManager.numberOfSeries(collectionGenre), 'série')}</Text>
          }, {
            element: () => <Text style={CommonStyles.defaultText}>
              {Helpers.pluralWord(filteredAlbums ? filteredAlbums.length : CollectionManager.numberOfAlbums(collectionGenre), 'album')}</Text>
          }]}
          containerStyle={[{ marginLeft: 8, flex: 1 }, CommonStyles.buttonGroupContainerStyle]}
          buttonStyle={CommonStyles.buttonGroupButtonStyle}
          selectedButtonStyle={CommonStyles.buttonGroupSelectedButtonStyle}
          innerBorderStyle={CommonStyles.buttonGroupInnerBorderStyle}
        />
      </View>

      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <SearchBar
            placeholder={(collectionType == 1 && filterMode != 0) ?
              filterModesSearch[filterMode] :
              'Rechercher dans mes ' + CollectionManager.CollectionTypes[collectionType] + 's' + CollectionManager.CollectionGenres[collectionGenre][2] + '...'}
            onChangeText={onSearchChanged}
            value={keywords}
            platform='ios'
            autoCapitalize='none'
            autoCorrect={false}
            inputContainerStyle={[{ height: 30 }, CommonStyles.searchContainerStyle]}
            containerStyle={[CommonStyles.screenStyle]}
            inputStyle={[CommonStyles.defaultText, { fontSize: 12 }]}
            cancelButtonTitle='Annuler'
          />
        </View>
        {collectionType == 0 ?
          <View style={{ flexDirection: 'row', flex: 0, margin: 5, marginLeft: 0 }}>
            <TouchableOpacity onPress={onSerieFilterModePress} style={{ flex: 0, marginRight: 5 }}>
              <Icon name={serieFilterMode == 0 ? 'filter-outline' : 'filter-remove'} size={25} color={serieFilterMode == 0 ? CommonStyles.iconStyle.color : CommonStyles.iconEnabledStyle.color} />
            </TouchableOpacity>
          </View>
          :
          <View style={{ flexDirection: 'row', flex: 0, margin: 5, marginLeft: 0 }}>
            <TouchableOpacity onPress={onSortModePress} style={{ flex: 0 }}>
              <Icon name={sortMode == defaultSortMode ? 'sort-variant' : 'sort-variant-remove'} size={25} color={sortMode == defaultSortMode ? CommonStyles.iconStyle.color : CommonStyles.iconEnabledStyle.color} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onFilterModePress} style={{ flex: 0, marginRight: 5 }}>
              <Icon name={filterMode == 0 ? 'filter-outline' : 'filter-remove'} size={25} color={filterMode == 0 ? CommonStyles.iconStyle.color : CommonStyles.iconEnabledStyle.color} />
            </TouchableOpacity>
          </View>
        }
      </View>

      {loading ?
        <Progress.Bar animated={false} progress={progressRate} width={null} color={CommonStyles.progressBarStyle.color} style={CommonStyles.progressBarStyle} /> :
        null}
      {!loading && CollectionManager.isCollectionEmpty() ?
        <View style={[CommonStyles.screenStyle, { alignItems: 'center', height: '50%', flexDirection: 'column' }]}>
          <View style={{ flex: 1 }}></View>
          <Text style={CommonStyles.defaultText}>Aucun album{CollectionManager.CollectionGenres[collectionGenre][1]} dans la collection.{'\n'}</Text>
          <Text style={CommonStyles.defaultText}>Ajoutez vos albums via les onglets Actualité, Recherche</Text>
          <Text style={CommonStyles.defaultText}>ou le scanner de codes-barres.</Text>
          <View style={{ flex: 1 }}></View>
        </View>
        :
        <View style={{ flex: 1 }}>
          {errortext ? (
            <Text style={CommonStyles.errorTextStyle}>
              {errortext}
            </Text>
          ) : null}
          {<FlatList
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={10}
            data={(collectionType == 0 ? (filteredSeries ? filteredSeries : CollectionManager.getSeries()) : (filteredAlbums ? filteredAlbums : CollectionManager.getAlbums()))}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={Helpers.renderSeparator}
            getItemLayout={(data, index) => ({
              length: AlbumItemHeight,
              offset: AlbumItemHeight * index,
              index
            })}
            refreshControl={<RefreshControl
              colors={[bdovorlightred, bdovored]}
              tintColor={bdovored}
              refreshing={loading}
              onRefresh={fetchData} />}
          />}
        </View>}

      {/* Serie filter chooser */}
      <BottomSheet
        isVisible={showSerieFilterChooser}
        visibleSetter={setShowSerieFilterChooser}
        containerStyle={CommonStyles.bottomSheetContainerStyle}>
        <ListItem key='0' containerStyle={CommonStyles.bottomSheetTitleStyle}>
          <ListItem.Content>
            <ListItem.Title style={[CommonStyles.bottomSheetItemTextStyle, CommonStyles.defaultText]}>Filtrer</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        {Object.entries(serieFilterModes).map(([mode, title], index) => (
          <ListItem key={index + 1}
            containerStyle={serieFilterMode == mode ? CommonStyles.bottomSheetSelectedItemContainerStyle : CommonStyles.bottomSheetItemContainerStyle}
            onPress={() => {
              setSerieFilterMode(mode); setShowSerieFilterChooser(false);
            }}>
            <ListItem.Content>
              <ListItem.Title style={serieFilterMode == mode ? CommonStyles.bottomSheetSelectedItemTextStyle : CommonStyles.bottomSheetItemTextStyle}>
                {title}
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        ))}
      </BottomSheet>

      {/* Filter chooser */}
      <BottomSheet
        isVisible={showFilterChooser}
        visibleSetter={setShowFilterChooser}
        containerStyle={CommonStyles.bottomSheetContainerStyle}>
        <ListItem key='0' containerStyle={CommonStyles.bottomSheetTitleStyle}>
          <ListItem.Content>
            <ListItem.Title style={[CommonStyles.bottomSheetItemTextStyle, CommonStyles.defaultText]}>Filtrer</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        {Object.entries(filterModes).map(([mode, title], index) => (
          <ListItem key={index + 1}
            containerStyle={filterMode == mode ? CommonStyles.bottomSheetSelectedItemContainerStyle : CommonStyles.bottomSheetItemContainerStyle}
            onPress={() => {
              setFilterMode(mode); setShowFilterChooser(false);
            }}>
            <ListItem.Content>
              <ListItem.Title style={filterMode == mode ? CommonStyles.bottomSheetSelectedItemTextStyle : CommonStyles.bottomSheetItemTextStyle}>
                {title}
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        ))}
      </BottomSheet>

      {/* Sort chooser */}
      <BottomSheet
        isVisible={showSortChooser}
        visibleSetter={setShowSortChooser}
        containerStyle={CommonStyles.bottomSheetContainerStyle}>
        <ListItem key='0' containerStyle={CommonStyles.bottomSheetTitleStyle}>
          <ListItem.Content>
            <ListItem.Title style={[CommonStyles.bottomSheetItemTextStyle, CommonStyles.defaultText]}>Trier</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        {Object.entries(sortModes).map(([mode, title], index) => (
          <ListItem key={index + 1}
            containerStyle={sortMode == mode ? CommonStyles.bottomSheetSelectedItemContainerStyle : CommonStyles.bottomSheetItemContainerStyle}
            onPress={() => {
              setSortMode(mode); setShowSortChooser(false);
            }}>
            <ListItem.Content style={{flexDirection: 'column'}}>
              <ListItem.Title style={sortMode == mode ? CommonStyles.bottomSheetSelectedItemTextStyle : CommonStyles.bottomSheetItemTextStyle}>
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
