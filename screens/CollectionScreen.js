import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { BottomSheet, ButtonGroup, ListItem, SearchBar } from 'react-native-elements';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers'
import { AlbumItem } from '../components/AlbumItem';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { SerieItem } from '../components/SerieItem';
import CommonStyles from '../styles/CommonStyles';

function CollectionScreen({ props, navigation }) {
  const [keywords, setKeywords] = useState('');
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [collectionAlbums, setCollectionAlbums] = useState([]);
  const [collectionSeries, setCollectionSeries] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState(null);
  const [filteredAlbums, setFilteredAlbums] = useState(null);
  const [itemMode, setItemMode] = useState(0);
  let [cachedToken, setCachedToken] = useState('');
  const [collectionMode, setCollectionMode] = useState(0);
  const [showCollectionChooser, setShowCollectionChooser] = useState(false);
  const [sortMode, setSortMode] = useState(0);
  const [showSortChooser, setShowSortChooser] = useState(false);

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
    console.log("collectionMode: " + collectionMode);
    navigation.setOptions({
      title: ('Ma collection' + (collectionMode > 0 ? (' - ' + collectionModes[collectionMode][0]) : '')),
    });

    if (keywords === '' && collectionMode == 0) {
      setFilteredSeries(null);
      setFilteredAlbums(null);
      return;
    }

    const isInCurrentCollection = (origine) =>
      (collectionMode == 0) ||
      (collectionMode == 1 && origine === 'BD') ||
      (collectionMode == 2 && origine === 'Mangas') ||
      (collectionMode == 3 && origine === 'Comics');

    const lowerSearchText = keywords.toLowerCase();

    for (let mode = 0; mode < 2; mode++) {
      let data = (mode == 0) ? collectionSeries : collectionAlbums;
      let filteredData = data.filter(function (item) {
        if (!isInCurrentCollection(item.ORIGINE)) return false;
        if (keywords === '') return true;
        let title = mode == 0 ? item.NOM_SERIE : item.TITRE_TOME;
        title = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); // remove accents
        return (title ? title.includes(lowerSearchText) : false);
      });

      if (sortMode == 1 && mode == 1) {
        // Sort albums by date of addition into user's database
        String.prototype.replaceAt = function (index, replacement) {
          return this.substr(0, index) + replacement + this.substr(index + replacement.length);
        }
        filteredData.sort(function (item1, item2) {
          return new Date(item2.DATE_AJOUT.replaceAt(10, 'T')) - new Date(item1.DATE_AJOUT.replaceAt(10, 'T'));
        });
      }
      //console.log(filteredData);
      if (mode == 0) {
        setFilteredSeries(filteredData);
      } else {
        setFilteredAlbums(filteredData);
      }
    }
  }, [collectionMode, sortMode, keywords]);

  const fetchData = () => {
    fetchSeries();
    fetchAlbums();
  }

  const fetchSeries = () => {
    setLoading(true);
    APIManager.fetchCollectionData('Userserie', { navigation: navigation }, onSeriesFetched);
  }

  const fetchAlbums = () => {
    setLoading(true);
    APIManager.fetchCollectionData('Useralbum', { navigation: navigation }, onAlbumsFetched);
  }

  const onSeriesFetched = async (data) => {
    console.log("series fetched");

    /*AsyncStorage.multiSet([
      'collectionSeries', JSON.stringify(data.items),
      'collecFetched', (data.error === null) ? 'true' : 'false']);*/

    setCollectionSeries(data.items);

    if (data.error === '') {
      setErrortext('');
    } else {
      setErrortext(data.error);
    }
    setLoading(false);
  }

  const onAlbumsFetched = async (data) => {
    console.log("albums fetched");

    /*AsyncStorage.multiSet([]
      'collectionAlbums', JSON.stringify(data.items),
      'collecFetched', (data.error === null) ? 'true' : 'false']);*/

    setCollectionAlbums(data.items);

    if (data.error === '') {
      setErrortext('');
    } else {
      setErrortext(data.error);
    }
    setLoading(false);
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
    if (itemMode == 0) {
      return SerieItem({ navigation, item, index });
    }
    if (itemMode == 1) {
      return AlbumItem({ navigation, item, index });
    }
  }

  const onSearchChanged = (searchText) => {
    setKeywords(searchText);
  }

  const keyExtractor = useCallback(({ item }, index) =>
    item ?
      parseInt(itemMode == 0 ? item.ID_SERIE : item.ID_TOME)
      + (itemMode == 0 ? 0 : 1000000) : index);

  return (
    <SafeAreaView style={CommonStyles.screenStyle}>
      <View style={{ flexDirection: 'row' }}>
        <ButtonGroup
          onPress={onPressItemMode}
          selectedIndex={itemMode}
          buttons={[
            {
              element: () => <Text>
                {Helpers.pluralWord(filteredSeries ? filteredSeries.length : collectionSeries.length, 'série')}</Text>
            },
            {
              element: () => <Text>
                {Helpers.pluralWord(filteredAlbums ? filteredAlbums.length : collectionAlbums.length, 'album')}</Text>
            }]}
          containerStyle={{ height: 30, flex: 1 }}
        />
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
        {loading ? LoadingIndicator() : (
          <FlatList
            maxToRenderPerBatch={6}
            windowSize={10}
            data={(itemMode == 0 ? (filteredSeries ? filteredSeries : collectionSeries) : (filteredAlbums ? filteredAlbums : collectionAlbums))}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={Helpers.renderSeparator}
          />
        )}
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
