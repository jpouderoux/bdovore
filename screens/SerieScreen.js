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
import { SectionList, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager';
import CollectionManager from '../api/CollectionManager';

import { CommonStyles } from '../styles/CommonStyles';
import { AlbumItem } from '../components/AlbumItem';
import { CoverImage } from '../components/CoverImage';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { SerieMarkers } from '../components/SerieMarkers';

function SerieScreen({ route, navigation }) {

  const [errortext, setErrortext] = useState('');
  const [serie, setSerie] = useState(route.params.item);
  const [loading, setLoading] = useState(false);
  const [serieAlbums, setSerieAlbums] = useState([]);
  const [filteredSerieAlbums, setFilteredSerieAlbums] = useState([]);
  const [serieAlbumsLoaded, setSerieAlbumsLoaded] = useState(false);
  const [showExcludedAlbums, setShowExcludedAlbums] = useState(global.showExcludedAlbums);

  useFocusEffect(() => {
    CollectionManager.refreshAlbumSeries(serieAlbums);
    refreshFilteredAlbums();
  });

  const refreshDataIfNeeded = async () => {
    console.debug("refresh data serie " + serie.ID_SERIE);
    if (!serieAlbumsLoaded) {
      setSerieAlbumsLoaded(true);
      fetchData();
    }
  }

  useEffect(() => {
    AsyncStorage.getItem('showExcludedAlbums').then((value) => {
      setShowExcludedAlbums(value != 0);
    }).catch(() => { });
    refreshDataIfNeeded();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setErrortext('');
    setSerieAlbums([]);
    APIManager.fetchSerieAlbums(serie.ID_SERIE, onSerieAlbumsFetched);
  }

  const onSerieAlbumsFetched = async (result) => {
    console.debug("serie albums fetched");

    let newdata = [
      { title: 'Albums', data: [] },
      { title: 'Intégrales', data: [] },
      { title: 'Coffrets', data: [] },
      { title: 'Editions spéciales', data: [] },
    ];

    let filtereddata = [
      { title: 'Albums', data: [] },
      { title: 'Intégrales', data: [] },
      { title: 'Coffrets', data: [] },
      { title: 'Editions spéciales', data: [] },
    ];

    // Sort/split albums by type
    for (let i = 0; i < result.items.length; i++) {
      let section = 0;
      const album = result.items[i];
      if (album.FLG_TYPE_TOME == 1 || album.TITRE_TOME.startsWith('Pack ')) {
        section = 2; // Coffret
      } else {
        if (album.FLG_INT_TOME == 'O') {
          section = 1; // Intégrale
        } else {
          if (album.TITRE_TOME.endsWith('TL') || album.TITRE_TOME.endsWith('TT')
            || album.TITRE_TOME.includes('(TL)') || album.TITRE_TOME.includes('(TT)')) {
            section = 3; // Edition spéciale
          } else {
            section = 0; // Album
          }
        }
      }
      album = CollectionManager.getFirstAlbumEditionOfSerieInCollection(album);
      newdata[section].data.push(album);
    }

    // Sort albums by ascending tome number
    newdata.forEach(entry => {
      Helpers.sortByAscendingValue(entry.data);
    });

    setSerieAlbums(newdata);
    setErrortext(result.error);
    setLoading(false);

    // Now fetch the exclude status of the albums of the serie
    APIManager.fetchExcludeStatusOfSerieAlbums(serie.ID_SERIE, (result) => {
      if (!result.error) {
        // Transform the result array into a dictionary for fast&easy access
        let dict = result.items.reduce((a, x) => ({...a, [parseInt(x)]: 1}), {});
        // Check all albums in all sections and set their exclude flag
        newdata.forEach(section => {
          section.data.forEach(album => {
            album.IS_EXCLU = (dict[parseInt(album.ID_TOME)] == 1);
          })
        });
        for (let i = 0; i < newdata.length; i++) {
          filtereddata[i].data = newdata[i].data.filter(album => album.IS_EXCLU != true);
        }
        setFilteredSerieAlbums(filtereddata);
      } else {
        setFilteredSerieAlbums(newdata);
      }
    });
  }

  const refreshFilteredAlbums = () => {
    for (let i = 0; i < filteredSerieAlbums.length; i++) {
      filteredSerieAlbums[i].data = serieAlbums[i].data.filter(album => album.IS_EXCLU != true);
    }
  }

  const renderAlbum = ({ item, index }) => {
    return AlbumItem({ navigation, item, index, dontShowSerieScreen: true, showExclude: true});
  }

  const getCounterText = () => {
    const nbTomes = Math.max(serie.NB_TOME, serie.NB_ALBUM);
    if (nbTomes > 0) {
      return Helpers.pluralWord(nbTomes, 'tome');
    }
    return Helpers.pluralWord(serie.NB_ALBUM, 'album');
  }

  const onToggleShowExcludedAlbums = () => {
    AsyncStorage.setItem('showExcludedAlbums', !showExcludedAlbums ? '1' : '0');
    global.showExcludedAlbums = !showExcludedAlbums;
    setShowExcludedAlbums(showExcludedAlbums => !showExcludedAlbums);
    refreshFilteredAlbums();
  }

  const keyExtractor = useCallback(({ item }, index) => index);

  const nbOfUserAlbums = CollectionManager.getNbOfUserAlbumsInSerie(serie);

  const ignoredSwitch = () => {
    return (
      <View style={{ flex: 1, flexDirection: 'row', position: 'absolute', right: 5 }}>
        <Text style={[{ textAlignVertical: 'center' }]}>Voir ignorés</Text>
        <Switch value={showExcludedAlbums} onValueChange={onToggleShowExcludedAlbums}
          thumbColor={CommonStyles.switchStyle.color}
          trackColor={{ false: CommonStyles.switchStyle.borderColor, true: CommonStyles.switchStyle.backgroundColor }}
          style={{ /*transform: [{ scaleX: .5 }, { scaleY: .5 }] */ }} />
      </View >);
  }

  return (
    <View style={CommonStyles.screenStyle}>
      <View style={{ marginHorizontal: 10, flexDirection: 'row' }}>
        <Text style={{ marginTop: 10, flex: 1, width: '33%' }}>
          {getCounterText()}{' '}
          ({nbOfUserAlbums} / {Math.max(serie.NB_TOME, serie.NB_ALBUM)})
          {'\n\n'}
          {serie.LIB_FLG_FINI_SERIE}
        </Text>
        <CoverImage source={APIManager.getSerieCoverURL(serie)} style={{ height: 75 }} noResize={true} />
        <View style={{ flexDirection: 'column', width: '33%', height: 75 }}>
          {nbOfUserAlbums > 0 ?
            <SerieMarkers item={serie} style={[CommonStyles.markersSerieViewStyle, { right: 0, top: null, bottom: 0 }]} reduceMode={true} showExclude={true} />
            : null}
        </View>
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
          sections={(showExcludedAlbums || nbOfUserAlbums == 0 ?
            serieAlbums.filter(s => s.data.length > 0) :
            filteredSerieAlbums.filter(s => s.data.length > 0)).map((section, index) => ({ ...section, index }))}
          keyExtractor={keyExtractor}
          renderItem={renderAlbum}
          renderSectionHeader={({ section: { title, index } }) => (
            <View style={{ width: '100%', flex:1,flexDirection: 'row', height: 25, backgroundColor: CommonStyles.sectionStyle.backgroundColor }}>
              <Text style={[CommonStyles.sectionStyle, CommonStyles.bold, CommonStyles.largerText, { width: null, paddingLeft: 10 }]}>{title}</Text>
              {index == 0 ? ignoredSwitch() : null}
            </View>)}
          stickySectionHeadersEnabled={true}
          ItemSeparatorComponent={Helpers.renderSeparator}
        />
      )}
    </View >
  );
}

export default SerieScreen;
