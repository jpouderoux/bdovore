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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SectionList, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout';

import { AlbumItem } from '../components/AlbumItem';
import { CollapsableSection } from '../components/CollapsableSection';
import { CommonStyles, AlbumItemHeight } from '../styles/CommonStyles';
import { CoverImage } from '../components/CoverImage';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { RatingStars } from '../components/RatingStars';
import { SerieMarkers } from '../components/SerieMarkers';
import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';
import CollectionManager from '../api/CollectionManager';


let serieAlbumsLoaded = 0;

function SerieScreen({ route, navigation }) {

  const [errortext, setErrortext] = useState('');
  const [filteredSerieAlbums, setFilteredSerieAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serie, setSerie] = useState(route.params.item);
  const [defaultSerieAlbums, setDefaultSerieAlbums] = useState([]);
  const [serieAlbums, setSerieAlbums] = useState([]);
  const [showExcludedAlbums, setShowExcludedAlbums] = useState(global.showExcludedAlbums);
  const sectionListRef = useRef();
  const [toggleElement, setToggleElement] = useState(false);

  const toggle = () => {
    setToggleElement(v => !v);
  }

  useFocusEffect(() => {
    refreshAlbums();
  });

  const refreshDataIfNeeded = (force = false) => {
    if (serieAlbumsLoaded != serie.ID_SERIE || force) {
      console.debug("refresh data serie " + serie.ID_SERIE);
      serieAlbumsLoaded = serie.ID_SERIE;
      fetchData();
    }
    refreshAlbums();
  }

  useEffect(() => {
    serieAlbumsLoaded = 0;
    refreshDataIfNeeded();
  }, [serie]);

  useEffect(() => {
    refreshAlbums();
  }, [defaultSerieAlbums, toggle]);

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
    setDefaultSerieAlbums([]);
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

    if (!result.error) {

      setDefaultSerieAlbums(result.items);

      const CreateSerieSections = () => {
        return [
          { title: 'Album', data: [] },
          { title: 'Intégrale', data: [] },
          { title: 'Coffret', data: [] },
          { title: 'Edition spéciale', data: [] },
        ]
      }
      let newdata = CreateSerieSections();

      // Sort/split albums by type
      for (let i = 0; i < result.items.length; i++) {
        let album = result.items[i];//Helpers.toDict(result.items[i]);
        const section = CollectionManager.getAlbumType(album);
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

      if (global.isConnected) {
        // Now fetch the exclude status of the albums of the serie
        APIManager.fetchExcludeStatusOfSerieAlbums(serie.ID_SERIE, (result) => {
          if (!result.error) {
            let filtereddata = CreateSerieSections();
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

    setErrortext(result.error);
    setLoading(false);
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
    Helpers.isValid(item) &&
      <AlbumItem navigation={navigation}
        item={Helpers.toDict(item)}
        index={index}
        dontShowSerieScreen={true}
        showExclude={true}
        refreshCallback={() => toggle()}/>;

  const getCounterText = () => {
    /*const nbTomes = Math.max(serie.NB_TOME, serie.NB_ALBUM);
    if (nbTomes > 0) {
      return Helpers.pluralWord(nbTomes, 'tome');
    }*/
    return serie.NB_TOME > 0 ?
      Helpers.pluralWord(serie.NB_TOME, 'tome') :
      Helpers.pluralWord(serie.NB_ALBUM, 'album');
  }

  const onToggleShowExcludedAlbums = () => {
    AsyncStorage.setItem('showExcludedAlbums', !showExcludedAlbums ? '1' : '0');
    global.showExcludedAlbums = !showExcludedAlbums;
    setShowExcludedAlbums(showExcludedAlbums => !showExcludedAlbums);
    refreshAlbums();
  }

  const onShowSerieImage = () => {
    navigation.push('Image', { source: APIManager.getSerieCoverURL(serie) });
  }

  const getAuteursLabel = () => {
    const auteurs = Helpers.getAuteurs(defaultSerieAlbums);
    let len = auteurs.length;
    if (len == 1 && auteurs.name == 'Collectif') len++;
    return Helpers.pluralize(len, 'Auteur')
  }

  const onPressAuteur = (auteur) => {
    if (auteur != 'Collectif' && global.isConnected) {
      APIManager.fetchAuteur(auteur.id, (result) => {
        if (!result.error && result.items.length > 0) {
          navigation.push('Auteur', { item: result.items[0] });
        }
      });
    }
  }

  const keyExtractor = useCallback((item, index) =>
    Helpers.isValid(item) ? Helpers.makeAlbumUID(item) : index);

  const getItemLayout = sectionListGetItemLayout({
    // The height of the row with rowData at the given sectionIndex and rowIndex
    getItemHeight: (rowData, sectionIndex, rowIndex) => AlbumItemHeight,
    // These four properties are optional
    getSeparatorHeight: () => 1, // The height of your separators
    getSectionHeaderHeight: () => 15, // The height of your section headers
    getSectionFooterHeight: () => 0, // The height of your section footers
    listHeaderHeight: 0, // The height of your list header
  });

  const nbOfUserAlbums = CollectionManager.getNbOfUserAlbumsInSerie(serie);

  const ignoredSwitch = () => {
    return (
      <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', position: 'absolute', right: 5 }}>
        <Text style={CommonStyles.sectionTextStyle}>Voir ignorés</Text>
        <Switch value={showExcludedAlbums} onValueChange={onToggleShowExcludedAlbums}
          thumbColor={CommonStyles.switchStyle.color}
          trackColor={{ false: CommonStyles.switchStyle.borderColor, true: CommonStyles.switchStyle.backgroundColor }}
          style={{ marginTop: 2, transform: [{ scaleX: .7 }, { scaleY: .7 }]  }} />
      </View >);
  }
  console.log(serie);

  return (
    <View style={CommonStyles.screenStyle}>
      <View style={{ marginHorizontal: 10 }}>
        <View style={{ flexDirection: 'row', marginHorizontal: 10 }} >
          <Text style={[{ flex: 1, width: '33%', alignSelf: 'flex-start', marginTop: 20 }, CommonStyles.defaultText]}>
            {getCounterText()}
            {'\n\n'}
            {serie.LIB_FLG_FINI_SERIE}
          </Text>
          <TouchableOpacity onPress={onShowSerieImage}>
            <CoverImage source={APIManager.getSerieCoverURL(serie)} style={{ height: 122 }} noResize={false} />
          </TouchableOpacity>
          <View style={{ width: '33%', alignItems: 'flex-end', }}>
            {nbOfUserAlbums > 0 ? <Text style={[{ flex: 1, marginTop: 20, textAlign: 'right' }, CommonStyles.defaultText]}>
              {Helpers.pluralWord(nbOfUserAlbums, 'album')} sur {Math.max(serie.NB_TOME, serie.NB_ALBUM)}</Text> :
              <Text style={[{ flex: 1, marginTop: 20, textAlign: 'right' }, CommonStyles.defaultText]}/>}
            <SerieMarkers item={serie}
              style={CommonStyles.markersSerieViewStyle}
              reduceMode={true}
              showExclude={true}
              serieAlbums={defaultSerieAlbums}
              refreshCallback={() => { toggle(); refreshDataIfNeeded(true)} } />
          </View>
        </View>
      </View>
      <CollapsableSection sectionName='Infos Série' isCollapsed={false} style={{ marginTop: 2 }}>
        {serie.NOTE_SERIE > 0 &&
          <View style={{ alignItems: 'center', marginVertical: 5 }}>
            <RatingStars note={serie.NOTE_SERIE} showRate />
          </View>}
        {serie.NOM_GENRE ? <Text style={CommonStyles.defaultText}>Genre : {serie.NOM_GENRE} {serie.ORIGINE ? '(' + serie.ORIGINE + ')' : null}</Text> : null}
        <Text style={CommonStyles.defaultText}>{getAuteursLabel()} :{' '}
          {
            Helpers.getAuteurs(defaultSerieAlbums).map((auteur, index, array) => {
              return (index == 0 && auteur.name == 'Collectif') ?
                <Text key={index} style={CommonStyles.defaultText}>{auteur.name}</Text> :
                <Text key={index} style={CommonStyles.defaultText}>
                  <Text onPress={() => onPressAuteur(auteur)} style={global.isConnected ? CommonStyles.linkTextStyle : CommonStyles.defaultText}>{Helpers.reverseAuteurName(auteur.name)}</Text>
                  {index != (array.length - 1) ? ' / ' : ''}
                </Text>
            })
          }
        </Text>
        <Text style={CommonStyles.defaultText}>Id BDovore : {serie.ID_SERIE}</Text>
        {serie.HISTOIRE_SERIE ? <Text style={CommonStyles.defaultText}>{Helpers.removeHTMLTags(serie.HISTOIRE_SERIE)}</Text> : null}
      </CollapsableSection>
      {errortext ? (
        <Text style={CommonStyles.errorTextStyle}>
          {errortext}
        </Text>
      ) : null}
      {loading ? <LoadingIndicator/> : (
        <SectionList
          style={{ flex: 1, marginTop: 10, marginHorizontal: 1 }}
          ref={sectionListRef}
          maxToRenderPerBatch={6}
          windowSize={10}
          sections={(showExcludedAlbums || nbOfUserAlbums == 0 ?
            serieAlbums.filter(s => s.data.length > 0) :
            filteredSerieAlbums.filter(s => s.data.length > 0)).map((section, index) => ({ ...section, index }))}
          keyExtractor={keyExtractor}
          renderItem={renderAlbum}
          renderSectionHeader={({ section: { title, data, index } }) => (
            <View style={[CommonStyles.sectionStyle, { alignItems: 'center', flex: 1, flexDirection: 'row', backgroundColor: CommonStyles.sectionStyle.backgroundColor }]}>
              <Text style={[CommonStyles.sectionStyle, CommonStyles.sectionTextStyle]}
              >{Helpers.pluralWord(data.length, title)}</Text>
              {/*<Text style={[{ position: 'absolute', right: 10 }, CommonStyles.sectionTextStyle]}>
                {index > 0 && <MaterialCommunityIcons name='menu-up' size={16} color={CommonStyles.markerIconStyle} onPress={() => {
                  console.log(index + ' ... ' + (index - 1) % 4);
                  try {
                    sectionListRef.current.scrollToLocation({
                      animated: false,
                      itemIndex: -1,
                      sectionIndex: (index - 1) % 4,
                      viewPosition: 0
                    });
                  } catch (error) { }
                }}/>}
                {'   '}
                <MaterialCommunityIcons name='menu-down' size={16} color={CommonStyles.markerIconStyle} onPress={() => {
                  console.log(index + ' ... ' + (index + 1) % 4);
                  try {
                    sectionListRef.current.scrollToLocation({
                      animated: false,
                      itemIndex: -1,
                      sectionIndex: (index + 1) % 4,
                      viewPosition: 0
                    });
                  } catch (error) { }
                }}/>
              </Text>*/}
              {index == 0 && nbOfUserAlbums > 0 ? ignoredSwitch() : null}
            </View>)}
          extraData={[serieAlbums, filteredSerieAlbums]}
          stickySectionHeadersEnabled={true}
          ItemSeparatorComponent={Helpers.renderSeparator}
          getItemLayout={getItemLayout}
        />
      )}
    </View >
  );
}

export default SerieScreen;
