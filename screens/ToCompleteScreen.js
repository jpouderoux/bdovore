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
import { Text, View } from 'react-native';
import { SectionList } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import * as Progress from 'react-native-progress';
import { useIsFocused } from '@react-navigation/native';

import { CommonStyles } from '../styles/CommonStyles';
import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager';

import { AlbumItem } from '../components/AlbumItem';
import { SerieItem } from '../components/SerieItem';


function ToCompleteScreen({ navigation }) {

  const [albums, setAlbums] = useState(Helpers.makeSection());
  const [series, setSeries] = useState(Helpers.makeSection());
  let [nbTotalAlbums, setNbTotalAlbums] = useState(0);
  let [nbTotalSeries, setNbTotalSeries] = useState(0);
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressRate, setProgressRate] = useState(0);
  let [cachedToken, setCachedToken] = useState('');
  let loadingSteps = 0;
  let loadedAlbums = 0;
  let loadedSeries = 0;

  const isFocused = useIsFocused();

  Helpers.checkForToken(navigation);

  const refreshDataIfNeeded = () => {
    AsyncStorage.getItem('token').then((token) => {
      if (token !== cachedToken) {
        console.log("refresh tocomplete because token changed from " + cachedToken + ' to ' + token);
        setCachedToken(token);
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

  const makeProgress = (result) => {
    loadingSteps -= (result.done ? 1 : 0);
    setLoading(loadingSteps > 0);

    if (parseFloat(nbTotalAlbums) > 0 && parseFloat(nbTotalSeries) > 0) {
      const nbTotalItems = parseFloat(nbTotalAlbums) + parseFloat(nbTotalSeries);
      const rate = parseFloat(loadedAlbums + loadedSeries) / nbTotalItems;
      //console.log(loadedAlbums + ", " + loadedSeries + " rate : " + rate + "   " + nbTotalAlbums + " , "+ nbTotalSeries);
      setProgressRate(rate);
    }
  }

  const onAlbumsFetched = async (result) => {
    console.log('albums ' + (result.done ? ' done' : 'in progress'));
    console.log(result.items.length + ' albums fetched so far');
    nbTotalAlbums = result.totalItems;
    setAlbums(Helpers.makeSection(Helpers.pluralWord(result.totalItems, 'album'), result.items));
    setErrortext(result.error);
    loadedAlbums = result.items.length;

    makeProgress(result);
  }

  const onSeriesFetched = async (result) => {
    console.log('series ' + (result.done ? ' done' : 'in progress'));
    console.log(result.items.length + ' series to complete fetched')
    nbTotalSeries = result.totalItems;
    setSeries(Helpers.makeSection(Helpers.pluralWord(result.totalItems, 'série'), result.items));
    setErrortext(result.error);
    loadedSeries = result.items.length;

    makeProgress(result);
  }

  const fetchData = () => {
    setLoading(true);
    setProgressRate(0);
    loadingSteps = 2;
    setAlbums(Helpers.makeSection());
    setSeries(Helpers.makeSection());
    nbTotalAlbums = 0;
    nbTotalSeries = 0;
    loadedAlbums = 0;
    loadedSeries = 0;
    setErrortext('');
    APIManager.fetchSeriesManquants({ navigation: navigation }, onSeriesFetched)
      .then().catch((error) => console.log(error));
    APIManager.fetchAlbumsManquants({ navigation: navigation }, onAlbumsFetched)
      .then().catch((error) => console.log(error));
  }

  const renderItem = ({ item, index }) => {
    if (item.IMG_COUV_SERIE) {
      return SerieItem({ navigation, item, index });
    } else {
      return AlbumItem({ navigation, item, index });
    }
  }

  const keyExtractor = useCallback((item, index) =>
    item.IMG_COUV_SERIE ? item.ID_SERIE + 1000000 : Helpers.makeAlbumUID(item));

  return (
    <View style={CommonStyles.screenStyle}>
      {loading ? <Progress.Bar progress={progressRate} width={null} style={{ marginLeft: 10, marginRight: 10 }}/> : null}
      {errortext != '' ? (
        <View style={{ alignItems: 'center', marginBottom: 5 }}>
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        </View>
      ) : null}
      <SectionList
        maxToRenderPerBatch={6}
        windowSize={10}
        ItemSeparatorComponent={Helpers.renderSeparator}
        sections={[albums, series].filter(s => s.data.length > 0)}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text style={[CommonStyles.sectionStyle, CommonStyles.bold, CommonStyles.largerText, { paddingLeft: 10 }]}>{section.title}</Text>)}
        stickySectionHeadersEnabled={false}
        onRefresh={fetchData}
        refreshing={loading}
      />
    </View>
  )
}

export default ToCompleteScreen;
