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
import * as Progress from 'react-native-progress';
import { ButtonGroup } from 'react-native-elements';

import { AlbumItem } from '../components/AlbumItem';
import { bdovored, bdovorlightred, AlbumItemHeight, CommonStyles } from '../styles/CommonStyles';
import { Icon } from '../components/Icon';
import { SerieItem } from '../components/SerieItem';
import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';
import CollectionManager from '../api/CollectionManager';


let loadedAlbums = 0;
let loadedSeries = 0;
let collectionGenre = 0;
let albums = [];
let series = [];

function ToCompleteScreen({ route, navigation }) {

  const [collectionType, setCollectionType] = useState(0); // 0: Series, 1: Albums
  const [errortext, setErrortext] = useState('');
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progressRate, setProgressRate] = useState(0);

  let [cachedToken, setCachedToken] = useState('');

  collectionGenre = route.params.collectionGenre;

  const refreshDataIfNeeded = (force = false) => {
    if (CollectionManager.isCollectionEmpty()) {
      albums = [];
      series = [];
    }

    console.log('refreshing ????? local ' + cachedToken + '/' + global.localTimestamp + ' to server ' + global.token + '/' + global.serverTimestamp);
    if ((global.autoSync || force) && cachedToken != 'fetching' && !global.forceOffline && (cachedToken != global.token || !global.collectionManquantsUpdated)) {
      const savedCachedToken = cachedToken;
      cachedToken = 'fetching';
      APIManager.onConnected(navigation, () => {
        console.log('refreshing from local ' + savedCachedToken + '/' + global.localTimestamp + ' to server ' + global.token + '/' + global.serverTimestamp);
        fetchData();
      }, () => { cachedToken = savedCachedToken; });
    }

    applyAlbumsFilters();
    applySeriesFilters();
  }

  useEffect(() => {
    navigation.setOptions({
      title: ('Albums manquants' + (collectionGenre > 0 ? (' - ' + CollectionManager.CollectionGenres[collectionGenre][0]) : '')),
    });

    applyAlbumsFilters();
    applySeriesFilters();
  }, [collectionGenre]);

  const applyAlbumsFilters = () => {
    const genre = CollectionManager.CollectionGenres[collectionGenre][0];
    setFilteredAlbums(albums.filter((album) =>
      !CollectionManager.isAlbumExcluded(album) && (collectionGenre == 0 ? true : (album.ORIGINE == genre || (album.NOM_GENRE ? album.NOM_GENRE.startsWith(genre) : false)))));
  }

  const applySeriesFilters = () => {
    const genre = CollectionManager.CollectionGenres[collectionGenre][0];
    setFilteredSeries(series.filter((serie) =>
      serie.IS_EXCLU != 1 && (collectionGenre == 0 ? true : (serie.ORIGINE == genre || (serie.NOM_GENRE ? serie.NOM_GENRE.startsWith(genre) : false)))));
  }

  useEffect(() => {
    refreshDataIfNeeded();
    // Make sure data is refreshed when login/token changed
    const willFocusSubscription = navigation.addListener('focus', () => {
      refreshDataIfNeeded();
    });
    return willFocusSubscription;
  }, []);

  const fetchData = () => {
    if (global.isConnected) {
      if (global.verbose) {
        Helpers.showToast(false, 'Téléchargement des albums/séries manquants...');
      }
      global.collectionManquantsUpdated = true;
      setLoading(true);
      setProgressRate(0);
      setErrortext('');
      fetchSeries();
    }
  }

  const fetchSeries = () => {
    series = [];
    loadedSeries = 0;
    APIManager.fetchSeriesManquants({ navigation: navigation }, onSeriesFetched)
      .then().catch((error) => console.debug(error));
  }

  const onSeriesFetched = async (result) => {
    console.debug('series ' + (result.done ? 'done' : 'in progress'));
    console.debug(result.items.length + ' series to complete fetched')
    series.push(...result.items);
    setErrortext(result.error);
    loadedSeries += result.items.length;

    applySeriesFilters();

    setProgressRate(parseFloat(loadedSeries) / parseFloat(result.totalItems ?? 1));

    if (result.done) {
      fetchAlbums();
    }
  }

  const fetchAlbums = () => {
    albums = [];
    loadedAlbums = 0;
    APIManager.fetchAlbumsManquants({ navigation: navigation }, onAlbumsFetched)
      .then().catch((error) => console.debug(error));

    }

    const onAlbumsFetched = async (result) => {
      console.debug('albums ' + (result.done ? 'done' : 'in progress'));
      console.debug(result.items.length + ' albums fetched so far');
      albums.push(...result.items);
      setErrortext(result.error);
      loadedAlbums += result.items.length;

      applyAlbumsFilters();

      setProgressRate(parseFloat(loadedAlbums) / parseFloat(result.totalItems ?? 1));

      if (result.done) {
        setLoading(false);
        cachedToken = global.token;
      }
  }

  const onPressCollectionType = (selectedIndex) => {
    setCollectionType(parseInt(selectedIndex));
  }

  const renderItem = ({ item, index }) => {
    if (Helpers.isValid(item)) {
      switch (collectionType) {
        case 0: return (<SerieItem navigation={navigation} item={Helpers.toDict(item)} index={index} showExclude={true} />);
        case 1: return (<AlbumItem navigation={navigation} item={Helpers.toDict(item)} index={index} showExclude={true} />);
      }
    }
    return null;
  }

  const keyExtractor = useCallback((item, index) =>
    Helpers.isValid(item) ?
      (item.IMG_COUV_SERIE ? item.ID_SERIE + 1000000 : Helpers.makeAlbumUID(item)) : index);

  return (
    <View style={CommonStyles.screenStyle}>
      <View style={{ flexDirection: 'row' }}>
        <ButtonGroup
          onPress={onPressCollectionType}
          selectedIndex={collectionType}
          buttons={[{
            element: () => <Text style={CommonStyles.defaultText}>
              {Helpers.pluralWord(filteredSeries.length, 'série')}</Text>
          }, {
            element: () => <Text style={CommonStyles.defaultText}>
              {Helpers.pluralWord(filteredAlbums.length, 'album')}</Text>
          }]}
          containerStyle={[{ marginLeft: 8, flex: 1 }, CommonStyles.buttonGroupContainerStyle]}
          buttonStyle={CommonStyles.buttonGroupButtonStyle}
          selectedButtonStyle={CommonStyles.buttonGroupSelectedButtonStyle}
          innerBorderStyle={CommonStyles.buttonGroupInnerBorderStyle}
        />
        {(!global.autoSync && (!global.collectionManquantsUpdated || albums.length == 0)) ?
          <TouchableOpacity onPress={() => refreshDataIfNeeded(true)}><Icon name='refresh' size={25} style={{ marginTop: 6, marginRight: 10 }} /></TouchableOpacity> : null}
      </View>
      {global.isConnected ?
        <View style={{ marginHorizontal: 1 }}>
          {loading ? <Progress.Bar animated={false} progress={progressRate} width={null} color={CommonStyles.progressBarStyle.color} style={CommonStyles.progressBarStyle} /> : null}
          {errortext ? (
            <View style={{ alignItems: 'center', marginBottom: 5 }}>
              <Text style={CommonStyles.errorTextStyle}>
                {errortext}
              </Text>
            </View>
          ) : null}
          {!loading && CollectionManager.isCollectionEmpty() ?
            <View style={[CommonStyles.screenStyle, { alignItems: 'center', height: '50%', flexDirection: 'column' }]}>
              <View style={{ flex: 1 }}></View>
              <Text style={CommonStyles.defaultText}>Aucun album{CollectionManager.CollectionGenres[collectionGenre][1]} dans la collection.{'\n'}</Text>
              <Text style={CommonStyles.defaultText}>Ajoutez vos albums via les onglets Actualité, Recherche</Text>
              <Text style={CommonStyles.defaultText}>ou le scanner de codes-barres.</Text>
              <View style={{ flex: 1 }}></View>
            </View>
            :
            <FlatList
              initialNumToRender={6}
              maxToRenderPerBatch={6}
              windowSize={10}
              data={(collectionType == 0 ? filteredSeries : filteredAlbums)}
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
        </View> :
        <View style={[CommonStyles.screenStyle, { alignItems: 'center', height: '50%', flexDirection: 'column' }]}>
          <View style={{ flex: 1 }}></View>
          <Text style={CommonStyles.defaultText}>Informations indisponibles en mode non-connecté.{'\n'}</Text>
          <Text style={CommonStyles.defaultText}>Rafraichissez cette page une fois connecté.</Text>
          <TouchableOpacity style={{ flexDirection: 'column', marginTop: 20 }} onPress={fetchData}>
            <Icon name='refresh' size={50} color={CommonStyles.markIconDisabled.color} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}></View>
        </View>}
    </View>
  );
}

export default ToCompleteScreen;
