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
import { RefreshControl, SectionList, Text, TouchableOpacity, View } from 'react-native';
import { ButtonGroup } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager'
import { AlbumItem } from '../components/AlbumItem';
import { bdovored, bdovorlightred, CommonStyles } from '../styles/CommonStyles';


let newsModeMap = {
  0: 'BD',
  1: 'Mangas',
  2: 'Comics'
};

function createUserNewsSection(data = []) {
  return { title: 'Mon actualité', idx: 0, data };
}

function createUserNewsToComeSection(data = []) {
  return { title: 'A paraître', idx: 1, data };
}

function createNewsSection(data = []) {
  return { title: 'Albums tendances', idx: 2, data };
}

let cachedToken = '';

function NewsScreen({ navigation }) {

  const [errortext, setErrortext] = useState('');
  const [filteredUserNewsDataArray, setFilteredUserNewsDataArray] = useState(createUserNewsSection());
  const [filteredUserNewsToComeDataArray, setFilteredUserNewsToComeDataArray] = useState(createUserNewsToComeSection());
  const [loading, setLoading] = useState(false);
  const [newsDataArray, setNewsDataArray] = useState(createNewsSection());
  const [newsMode, setNewsMode] = useState(0);
  const [refresh, setRefresh] = useState(1);
  const [userNewsDataArray, setUserNewsDataArray] = useState([]);
  const [userNewsToComeDataArray, setUserNewsToComeDataArray] = useState([]);
  const [offline, setOffline] = useState(false);

  const isFocused = useIsFocused(); // Needed to make sure the component is refreshed on focus get back!

  Helpers.checkForToken(navigation);

  useFocusEffect(() => {
    AsyncStorage.getItem('token').then((token) => {
      if (token !== cachedToken) {
        console.debug('refresh collection data because token changed to ' + token);
        cachedToken = token;
        fetchData();
      }
    }).catch(() => { });
  });

  useEffect(() => {
    // Filter the user news according the current news mode
    setFilteredUserNewsDataArray(
      createUserNewsSection(Helpers.stripNewsByOrigin(userNewsDataArray.slice(), newsModeMap[newsMode])));

    // Filter the user news to come according the current news mode
    setFilteredUserNewsToComeDataArray(
      createUserNewsToComeSection(Helpers.stripNewsByOrigin(userNewsToComeDataArray.slice(), newsModeMap[newsMode])));
  }, [newsMode]);

  const fetchData = () => {
    setOffline(!global.isConnected);
    if (global.isConnected) {
      fetchUserNewsData();
      fetchNewsData(newsMode);
    }
  }

  const fetchUserNewsData = async () => {
    setLoading(true);

    setFilteredUserNewsDataArray(createUserNewsSection());
    APIManager.fetchUserNews({ navigation: navigation }, onUserNewsFetched, { nb_mois: '12'})
    .then().catch((error) => console.debug(error));

    setFilteredUserNewsToComeDataArray(createUserNewsToComeSection());
    APIManager.fetchUserNews({ navigation: navigation }, onUserNewsToComeFetched, { nb_mois: '-1' })
      .then().catch((error) => console.debug(error));
  }

  const fetchNewsData = async (newsMode) => {
    setLoading(true);
    setNewsDataArray(createNewsSection());
    APIManager.fetchNews(newsModeMap[newsMode], { navigation: navigation }, onNewsFetched)
      .then().catch((error) => console.debug(error));
  }

  const onUserNewsFetched = async (result) => {
    console.debug('user news fetched!');
    setUserNewsDataArray(result.items);
    setFilteredUserNewsDataArray(
      createUserNewsSection(Helpers.stripNewsByOrigin(result.items, newsModeMap[newsMode])));
    setErrortext(result.error);
    setLoading(false);
  }

  const onUserNewsToComeFetched = async (result) => {
    console.debug('user news to come fetched!');
    setUserNewsToComeDataArray(result.items);
    setFilteredUserNewsToComeDataArray(
      createUserNewsToComeSection(Helpers.stripNewsByOrigin(result.items, newsModeMap[newsMode])));
    setErrortext(result.error);
    setLoading(false);
  }

  const onNewsFetched = async (result) => {
    console.debug('news fetched!');
    setNewsDataArray(createNewsSection(result.items));
    setErrortext(result.error);
    setLoading(false);
  }

  const onPressNewsMode = (selectedIndex) => {
    setNewsMode(selectedIndex);
    fetchNewsData(selectedIndex);
  };

  const renderAlbum = ({ item, section, index }) =>
    Helpers.isValid(item) ? AlbumItem({ navigation, item: Helpers.toDict(item), index, showEditionDate: (section.idx == 1) }) : null;

  const keyExtractor = useCallback((item, index) =>
    Helpers.isValid(item) ? Helpers.makeAlbumUID(item) : index);

  return (
    <View style={CommonStyles.screenStyle}>
      <View style={{ marginBottom:0}}>
        <ButtonGroup
          onPress={onPressNewsMode}
          selectedIndex={newsMode}
          buttons={[
            { element: () => <Text style={CommonStyles.defaultText}>{newsModeMap[0]}</Text> },
            { element: () => <Text style={CommonStyles.defaultText}>{newsModeMap[1]}</Text> },
            { element: () => <Text style={CommonStyles.defaultText}>{newsModeMap[2]}</Text> }]}
          containerStyle={[CommonStyles.buttonGroupContainerStyle]}
          buttonStyle={CommonStyles.buttonGroupButtonStyle}
          selectedButtonStyle={CommonStyles.buttonGroupSelectedButtonStyle}
          innerBorderStyle={CommonStyles.buttonGroupInnerBorderStyle}
        />
      </View>
      <View style={{ flex: 1 }}>
        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        {!offline ? <SectionList
          maxToRenderPerBatch={6}
          windowSize={10}
          ItemSeparatorComponent={Helpers.renderSeparator}
          sections={[filteredUserNewsDataArray, filteredUserNewsToComeDataArray, newsDataArray].filter(s => s.data.length > 0)}
          keyExtractor={keyExtractor}
          renderItem={renderAlbum}
          renderSectionHeader={({ section }) => (
            <Text style={[CommonStyles.sectionStyle, CommonStyles.bold, CommonStyles.largerText, { paddingLeft: 10 }]}>{section.title}</Text>)}
          stickySectionHeadersEnabled={true}
          extraData={refresh}
          refreshControl={<RefreshControl
            colors={[bdovorlightred, bdovored]}
            tintColor={bdovored}
            refreshing={loading}
            onRefresh={fetchData} />}
        /> :
          <View style={[CommonStyles.screenStyle, { alignItems: 'center', height: '50%', flexDirection: 'column' }]}>
            <View style={{ flex: 1 }}></View>
            <Text style={CommonStyles.defaultText}>Pas d'actualité en mode non-connecté.{'\n'}</Text>
            <Text style={CommonStyles.defaultText}>Rafraichissez cette page une fois connecté.</Text>
            <TouchableOpacity style={{ flexDirection: 'column', marginTop: 20 }} onPress={fetchData}>
              <MaterialCommunityIcons name='refresh' size={50} color={CommonStyles.markIconDisabled.color} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}></View>
          </View>}
      </View>
    </View>
  );
}

export default NewsScreen;
