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
import { ButtonGroup } from 'react-native-elements';

import { AlbumItem } from '../components/AlbumItem';
import { bdovored, bdovorlightred, AlbumItemHeight, CommonStyles } from '../styles/CommonStyles';
import { Icon } from '../components/Icon';
import * as APIManager from '../api/APIManager'
import * as Helpers from '../api/Helpers';
import CollectionManager from '../api/CollectionManager';

const newsModeMap = {
  0: '',
  1: 'BD',
  2: 'Mangas',
  3: 'Comics'
};


let cachedToken = '';

function NewsScreen({ route, navigation }) {

  const [collectionGenre, setCollectionGenre] = useState(1);
  const [errortext, setErrortext] = useState('');
  const [filteredUserNewsDataArray, setFilteredUserNewsDataArray] = useState([]);
  const [filteredUserNewsToComeDataArray, setFilteredUserNewsToComeDataArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newsDataArray, setNewsDataArray] = useState([]);
  const [newsMode, setNewsMode] = useState(0);
  const [offline, setOffline] = useState(false);
  const [userNewsDataArray, setUserNewsDataArray] = useState([]);
  const [userNewsToComeDataArray, setUserNewsToComeDataArray] = useState([]);
  const [toggleElement, setToggleElement] = useState(Date.now());

  if (route.params.collectionGenre != collectionGenre) {
    setCollectionGenre(route.params.collectionGenre);
  }

  useEffect(() => {
    navigation.setOptions({
      title: ('Actualité' + (collectionGenre > 0 ? (' - ' + CollectionManager.CollectionGenres[collectionGenre][0]) : '')),
    });

    // Filter the news according the current collection genre
    setFilteredUserNewsDataArray(
      Helpers.stripNewsByOrigin(userNewsDataArray.slice(), newsModeMap[collectionGenre]));

    setFilteredUserNewsToComeDataArray(
      Helpers.stripNewsByOrigin(userNewsToComeDataArray.slice(), newsModeMap[collectionGenre]));

    // Fetch the tendency news for current collection genre
    fetchNewsData();
  }, [collectionGenre]);

  const toggle = () => {
    setToggleElement(Date.now());
  }

  const refreshDataIfNeeded = () => {
    console.log('refreshing ????? local ' + cachedToken + '/' + global.localTimestamp + ' to server ' + global.token + '/' + global.serverTimestamp);
    if (cachedToken != 'fetching' && !global.forceOffline && (cachedToken != global.token)) {
      const savedCachedToken = cachedToken;
      APIManager.onConnected(navigation, () => {
        cachedToken = 'fetching';
        console.log('refreshing from local ' + savedCachedToken + '/' + global.localTimestamp + ' to server ' + global.token + '/' + global.serverTimestamp);
        fetchData();
      }, () => { cachedToken = savedCachedToken; });
    }
  }

  useEffect(() => {
    refreshDataIfNeeded();
    // Make sure data is refreshed when login/token changed
    const willFocusSubscription = navigation.addListener('focus', () => {
      refreshDataIfNeeded();
      toggle();
    });
    return willFocusSubscription;
  }, []);

  const fetchData = () => {
    setOffline(!global.isConnected);
    if (global.isConnected) {
      if (global.verbose) {
        Helpers.showToast(false, 'Téléchargement des news...');
      }
      setLoading(true);
      fetchUserNewsData();
      fetchNewsData();
    }
  }

  const fetchUserNewsData = async () => {
    setFilteredUserNewsDataArray([]);
    APIManager.fetchUserNews({ navigation: navigation }, onUserNewsFetched, { nb_mois: '12' })
      .then().catch((error) => console.debug(error));

    setFilteredUserNewsToComeDataArray([]);
    APIManager.fetchUserNews({ navigation: navigation }, onUserNewsToComeFetched, { nb_mois: '-1' })
      .then().catch((error) => console.debug(error));
  }

  const fetchNewsData = async () => {
    setNewsDataArray([]);
    APIManager.fetchNews(newsModeMap[collectionGenre], { navigation: navigation }, onNewsFetched)
      .then().catch((error) => console.debug(error));
  }

  const onUserNewsFetched = async (result) => {
    console.debug('user news fetched!');
    setUserNewsDataArray(result.items);
    setFilteredUserNewsDataArray(
      Helpers.stripNewsByOrigin(result.items, newsModeMap[collectionGenre]));
    setErrortext(result.error);
    setLoading(false);
    cachedToken = global.token;
  }

  const onUserNewsToComeFetched = async (result) => {
    console.debug('user news to come fetched!');
    result.items.reverse();
    setUserNewsToComeDataArray(result.items);
    setFilteredUserNewsToComeDataArray(
      Helpers.stripNewsByOrigin(result.items, newsModeMap[collectionGenre]));
    setErrortext(result.error);
    setLoading(false);
  }

  const onNewsFetched = async (result) => {
    console.debug('news fetched!');
    setNewsDataArray(result.items);
    setErrortext(result.error);
    setLoading(false);
  }

  const onPressNewsMode = (selectedIndex) => {
    setNewsMode(selectedIndex);
    //fetchNewsData(selectedIndex);
  };

  const renderAlbum = ({ item, index }) =>
    Helpers.isValid(item) &&
    <AlbumItem navigation={navigation} item={Helpers.toDict(item)} index={index} showEditionDate={newsMode == 1} />;

  const keyExtractor = useCallback((item, index) =>
    Helpers.isValid(item) ? Helpers.makeAlbumUID(item) : index);

  return (
    <View style={CommonStyles.screenStyle}>
      <View style={{ marginBottom: 0 }}>
        <ButtonGroup
          onPress={onPressNewsMode}
          selectedIndex={newsMode}
          buttons={[
            { element: () => <Text style={CommonStyles.defaultText}>Mon actualité</Text> },
            { element: () => <Text style={CommonStyles.defaultText}>A paraître</Text> },
            { element: () => <Text style={CommonStyles.defaultText}>Tendance</Text> }]}
          containerStyle={[CommonStyles.buttonGroupContainerStyle]}
          buttonStyle={CommonStyles.buttonGroupButtonStyle}
          selectedButtonStyle={CommonStyles.buttonGroupSelectedButtonStyle}
          innerBorderStyle={CommonStyles.buttonGroupInnerBorderStyle}
        />
      </View>
      <View style={{ flex: 1, marginHorizontal: 1 }}>
        {errortext ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        {!offline ? <FlatList
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={10}
          ItemSeparatorComponent={Helpers.renderSeparator}
          data={newsMode == 0 ? filteredUserNewsDataArray : newsMode == 1 ? filteredUserNewsToComeDataArray : newsDataArray}
          keyExtractor={keyExtractor}
          renderItem={renderAlbum}
          extraData={toggleElement}
          refreshControl={<RefreshControl
            colors={[bdovorlightred, bdovored]}
            tintColor={bdovored}
            refreshing={loading}
            onRefresh={fetchData} />}
          getItemLayout={(data, index) => ({
            length: AlbumItemHeight,
            offset: AlbumItemHeight * index,
            index
          })} />
          : <View style={[CommonStyles.screenStyle, { alignItems: 'center', height: '50%', flexDirection: 'column' }]}>
            <View style={{ flex: 1 }}></View>
            <Text style={CommonStyles.defaultText}>Pas d'actualité en mode non-connecté.{'\n'}</Text>
            <Text style={CommonStyles.defaultText}>Rafraichissez cette page une fois connecté.</Text>
            <TouchableOpacity style={{ flexDirection: 'column', marginTop: 20 }} onPress={fetchData}>
              <Icon name='refresh' size={50} color={CommonStyles.markIconDisabled.color} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}></View>
          </View>}
      </View>
    </View>
  );
}

export default NewsScreen;
