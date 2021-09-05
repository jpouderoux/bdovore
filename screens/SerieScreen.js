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
import { SectionList, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager';
import CollectionManager from '../api/CollectionManager';

import { AlbumItem } from '../components/AlbumItem';
import { CollapsableSection } from '../components/CollapsableSection';
import { CommonStyles } from '../styles/CommonStyles';
import { CoverImage } from '../components/CoverImage';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { RatingStars } from '../components/RatingStars';
import { SerieMarkers } from '../components/SerieMarkers';

let serieAlbumsLoaded = 0;

function SerieScreen({ route, navigation }) {

  const [errortext, setErrortext] = useState('');
  const [filteredSerieAlbums, setFilteredSerieAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serie, setSerie] = useState(route.params.item);
  const [serieAlbums, setSerieAlbums] = useState([]);
  const [showExcludedAlbums, setShowExcludedAlbums] = useState(global.showExcludedAlbums);
  const [showMoreInfos, setShowMoreInfos] = useState(false);

  console.log(serie);

  useFocusEffect(() => {
    refreshAlbums();
  });

  const refreshDataIfNeeded = () => {
    if (serieAlbumsLoaded != serie.ID_SERIE) {
      console.debug("refresh data serie " + serie.ID_SERIE);
      serieAlbumsLoaded = serie.ID_SERIE;
      fetchData();
    }
    refreshAlbums();
  }

  useEffect(() => {
    AsyncStorage.getItem('showExcludedAlbums').then((value) => {
      setShowExcludedAlbums(value != 0);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    // Make sure data is refreshed when login/token changed
    const willFocusSubscription = navigation.addListener('focus', () => {
      refreshDataIfNeeded();
    });
    return willFocusSubscription;
  }, []);

  const fetchData = () => {
    setSerieAlbums([]);
    if (global.verbose) {
      Helpers.showToast(false, 'Téléchargement de la série...');
    }
    if (global.isConnected) {
      setLoading(true);
      setErrortext('');
      APIManager.fetchSerieAlbums(serie.ID_SERIE, onSerieAlbumsFetched);
    } else {
      onSerieAlbumsFetched({items: CollectionManager.getAlbumsInSerie(serie.ID_SERIE), error: ''});
    }
  }

  const onSerieAlbumsFetched = async (result) => {
    console.debug("serie albums fetched");
    console.log('loaded:' + serieAlbumsLoaded);

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
      if (newdata[section].data.findIndex((it) => (it.ID_EDITION == album.ID_EDITION)) == -1) {
        newdata[section].data.push(album);
      }
    }

    // Sort albums by ascending tome number
    newdata.forEach(entry => {
      Helpers.sortByAscendingValue(entry.data);
    });

    setSerieAlbums(newdata);
    setErrortext(result.error);
    setLoading(false);

    if (global.isConnected) {
      // Now fetch the exclude status of the albums of the serie
      APIManager.fetchExcludeStatusOfSerieAlbums(serie.ID_SERIE, (result) => {
        if (!result.error) {
          // Transform the result array into a dictionary for fast&easy access
          let dict = result.items.reduce((a, x) => ({ ...a, [parseInt(x)]: 1 }), {});
          // Check all albums in all sections and set their exclude flag
          global.db.write(() => {
            newdata.forEach(section => {
              section.data.forEach(album => {
                album.IS_EXCLU = (dict[parseInt(album.ID_TOME)] == 1) ? 1 : 0;
              })
            })
          });
          for (let i = 0; i < newdata.length; i++) {
            filtereddata[i].data = newdata[i].data.filter(album => !album.IS_EXCLU);
          }
          setFilteredSerieAlbums(filtereddata);
        } else {
          setFilteredSerieAlbums(newdata);
        }
      });
    }
  }

  const refreshAlbums = () => {
    if (!showExcludedAlbums) {
      for (let i = 0; i < filteredSerieAlbums.length; i++) {
        filteredSerieAlbums[i].data = filteredSerieAlbums[i].data.filter(album => !album.IS_EXCLU);
      }
    }
    CollectionManager.refreshAlbumSeries(serieAlbums);
    CollectionManager.refreshAlbumSeries(filteredSerieAlbums);
  }

  const renderAlbum = ({ item, index }) =>
    Helpers.isValid(item) ? AlbumItem({ navigation, item: Helpers.toDict(item), index, dontShowSerieScreen: true, showExclude: true }) : null;

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
    refreshAlbums();
  }

  const keyExtractor = useCallback((item, index) =>
    Helpers.isValid(item) ? Helpers.makeAlbumUID(item) : index);

  const nbOfUserAlbums = CollectionManager.getNbOfUserAlbumsInSerie(serie);

  const ignoredSwitch = () => {
    return (
      <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', position: 'absolute', right: 5 }}>
        <Text style={[{ textAlignVertical: 'center', color: 'white' }]}>Voir ignorés </Text>
        <Switch value={showExcludedAlbums} onValueChange={onToggleShowExcludedAlbums}
          thumbColor={CommonStyles.switchStyle.color}
          trackColor={{ false: CommonStyles.switchStyle.borderColor, true: CommonStyles.switchStyle.backgroundColor }}
          style={{ /*transform: [{ scaleX: .5 }, { scaleY: .5 }] */ }} />
      </View >);
  }

  return (
    <View style={CommonStyles.screenStyle}>
      <View style={{ marginHorizontal: 10 }}>
        <View style={{ flexDirection: 'row', marginHorizontal: 10 }} >
        <Text style={[{ marginTop: 0, flex: 1, width: '33%', alignSelf: 'center' }, CommonStyles.defaultText]}>
            {getCounterText()}{' '}
            ({nbOfUserAlbums} / {Math.max(serie.NB_TOME, serie.NB_ALBUM)})
            {'\n\n'}
            {serie.LIB_FLG_FINI_SERIE}
          </Text>
          <TouchableOpacity onPress={() => showMoreInfos ? navigation.push('Image', { source: APIManager.getSerieCoverURL(serie) }) : setShowMoreInfos(true)}>
            <CoverImage source={APIManager.getSerieCoverURL(serie)} style={{ height: 122 }} noResize={false} />
          </TouchableOpacity>
          <View style={{ width: '33%', alignSelf: 'center',  alignItems: 'flex-end',}}>
            {nbOfUserAlbums > 0 ?
              <SerieMarkers item={serie} style={[CommonStyles.markersSerieViewStyle,]} reduceMode={true} showExclude={true} />
              : null}
          </View>
        </View>
      </View>
      <CollapsableSection sectionName='Infos Série' isCollapsed={true} style={{ marginBottom: 10 }}>
        {serie.NOTE_SERIE ?
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <RatingStars note={serie.NOTE_SERIE} />
          </View> : null
        }
        {serie.NOM_GENRE ? <Text style={CommonStyles.defaultText}>Genre : {serie.NOM_GENRE} {serie.ORIGINE ? '(' + serie.ORIGINE + ')' : null}</Text> : null}
        <Text style={CommonStyles.defaultText}>Id BDovore : {serie.ID_SERIE}</Text>
        {serie.HISTOIRE_SERIE ? <Text style={CommonStyles.defaultText}>{Helpers.removeHTMLTags(serie.HISTOIRE_SERIE)}</Text> : null}
      </CollapsableSection>
      {errortext ? (
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
            <View style={[CommonStyles.sectionStyle, { alignItems: 'center', flex: 1, flexDirection: 'row', height: 30, backgroundColor: CommonStyles.sectionStyle.backgroundColor }]}>
              <Text style={[CommonStyles.sectionStyle, CommonStyles.bold, CommonStyles.largerText, { width: null, paddingLeft: 10 }]}>{title}</Text>
              {index == 0 && nbOfUserAlbums > 0 ? ignoredSwitch() : null}
            </View>)}
          stickySectionHeadersEnabled={true}
          ItemSeparatorComponent={Helpers.renderSeparator}
        />
      )}
    </View >
  );
}

export default SerieScreen;
