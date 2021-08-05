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
import { SectionList, Text, View } from 'react-native';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager';

import CommonStyles from '../styles/CommonStyles';
import { AlbumItem } from '../components/AlbumItem';
import { CoverImage } from '../components/CoverImage';
import { LoadingIndicator } from '../components/LoadingIndicator';


function SerieScreen({ route, navigation }) {

  const [errortext, setErrortext] = useState('');
  const [serie, setSerie] = useState(route.params.item);
  const [loading, setLoading] = useState(false);
  const [serieAlbums, setSerieAlbums] = useState([]);
  const [serieAlbumsLoaded, setSerieAlbumsLoaded] = useState(false);

  const refreshDataIfNeeded = async () => {
    console.log("refresh data serie " + serie.ID_SERIE);
    if (!serieAlbumsLoaded) {
      setSerieAlbumsLoaded(true);
      fetchData();
    }
  }

  useEffect(() => {
    refreshDataIfNeeded();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setErrortext('');
    setSerieAlbums([]);
    APIManager.fetchSerieAlbums(serie.ID_SERIE, {}, onSerieAlbumsFetched);
  }

  const onSerieAlbumsFetched = async (result) => {
    console.log("serie albums fetched");

    let newdata = [
      { title: 'Albums', data: [] },
      { title: 'Intégrales', data: [] },
      { title: 'Coffrets', data: [] },
      { title: 'Editions spéciales', data: [] },
    ];

    // Sort albums by type
    for (let i = 0; i < result.items.length; i++) {
      let section = 0;
      const serie = result.items[i];
      if (serie.FLG_TYPE_TOME == 1) {
        section = 2; // Coffret
      } else {
        if (serie.FLG_INT_TOME == 'O') {
          section = 1; // Intégrale
        } else {
          if (serie.TITRE_TOME.endsWith('TL') || serie.TITRE_TOME.endsWith('TT')) {
            section = 3; // Edition spéciale
          } else {
            section = 0; // Album
          }
        }
      }
      newdata[section].data.push(serie);
    }

    // Sort albums by tome number
    newdata.forEach(entry => {
      Helpers.sortByAscendingValue(entry.data);
    });

    setSerieAlbums(newdata);

    setErrortext(result.error);
    setLoading(false);
  }

  const renderAlbum = ({ item, index }) => {
    return AlbumItem({ navigation, item, index, dontShowSerieScreen: true });
  }

  const keyExtractor = useCallback(({ item }, index) => index);

  return (
    <View style={CommonStyles.screenStyle}>
      <View style={{ margin: 0, flexDirection: 'row', alignContent: "space-between" }}>
        <Text style={{ marginTop: 10, marginLeft: 10, width: '33%' }}>
          {Helpers.pluralWord(serie.NB_TOME, 'tome')}{'\n\n'}
          {serie.LIB_FLG_FINI_SERIE}
        </Text>
        <CoverImage source={APIManager.getSerieCoverURL(serie)} style={{ flexDirection: 'row', height: 75 }} />
        <Text style={{ marginTop: 10, flex:1, textAlign: 'right' }}>
          {serie.NB_USER_ALBUM} / {serie.NB_ALBUM}{'    '}
        </Text>
      </View>
      {errortext != '' ? (
        <Text style={CommonStyles.errorTextStyle}>
          {errortext}
        </Text>
      ) : null}
      {loading ? LoadingIndicator() : (
        <SectionList
          style={{ flex: 1 }}
          maxToRenderPerBatch={6}
          windowSize={10}
          sections={serieAlbums.filter(s => s.data.length > 0)}
          keyExtractor={keyExtractor}
          renderItem={renderAlbum}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[CommonStyles.sectionStyle, CommonStyles.bold, { paddingLeft: 10 }]}>{title}</Text>)}
          stickySectionHeadersEnabled={true}
          ItemSeparatorComponent={Helpers.renderSeparator}
        />
      )}
    </View >
  );
}

export default SerieScreen;
