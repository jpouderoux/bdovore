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
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ButtonGroup, SearchBar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager';
import CollectionManager from '../api/CollectionManager';
import { CommonStyles } from '../styles/CommonStyles';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { AlbumItem } from '../components/AlbumItem';
import { SerieItem } from '../components/SerieItem';
import { AuteurItem } from '../components/AuteurItem';


let lastKeywords = '';

function SearchScreen({ navigation }) {

  const [data, setData] = useState([]);
  const [errortext, setErrortext] = useState('');
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(0);

  useFocusEffect(() => {
    if (searchMode == 1) {
      CollectionManager.selectOwnAlbum(data);
    }
  });

  useEffect(() => {
    onSearch(keywords);
  }, [searchMode]);

  const onSearchFetched = async (searchedText, result) => {
    // As many requests are sent to the server while typing the keywords,
    // it may happen that answers are not received in order. So we make
    // sure to only take into account the result of the request for
    // the last provided keywords.
    if (searchedText == lastKeywords) {
      if (!result.error && searchMode == 1) {
        CollectionManager.selectOwnAlbum(result.items);
      }
      setData(result.items);
      console.debug(result.items);
      setErrortext(result.error);
      setLoading(false);
    }
  }

  const onSearch = (searchText) => {
    setKeywords(searchText);
    lastKeywords = searchText;
    if (searchText == '') {
      setData([]);
      return;
    }

    setLoading(true);
    switch (parseInt(searchMode)) {
      case 0:
        APIManager.fetchJSON('Serie', null, (result) => onSearchFetched(searchText, result), { term: searchText, mode: 1, });
        break;
      case 1:
        APIManager.fetchAlbum((result) => onSearchFetched(searchText, result), { term: searchText });
        break;
      case 2:
        APIManager.fetchAuteur(searchText, (result) => onSearchFetched(searchText, result));
        break;
    }
  }

  const onSearchCancel = () => {
    setKeywords('');
    setData([]);
  }

  const onPressTypeButton = (selectedIndex) => {
    if (selectedIndex != searchMode) {
      setSearchMode(selectedIndex);
      setData([]);
    }
  }

  const onBarcodeSearch = () => {
    navigation.push('BarcodeScanner', { onGoBack: (ean) => { onSearchWithEAN(ean); } });
  }

  const onSearchWithEAN = async (ean) => {
    if (ean) {
      let params = (ean.length > 10) ? { EAN: ean } : { ISBN: ean };
      APIManager.fetchAlbum((result) => {
        if (result.error == '' && result.items.length > 0) {
          navigation.push('Album', { item: result.items[0] })
        } else {
          Alert.alert(
            "Aucun album trouvé",
            "Aucun album trouvé avec ce code. Essayez la recherche textuelle avec le nom de la série ou de l'album.");
        }
      }, params);
    }
  }

  const keyExtractor = useCallback((item, index) => {
    switch (parseInt(searchMode)) {
      case 0: return parseInt(item.ID_SERIE);
      case 1: return Helpers.makeAlbumUID(item);
      case 2: return parseInt(item.ID_AUTEUR);
    }});

  const renderItem = ({ item, index }) => {
    switch (parseInt(searchMode)) {
      case 0: return SerieItem({ navigation, item, index });
      case 1: return AlbumItem({ navigation, item, index });
      case 2: return AuteurItem({ navigation, item, index });
    }
  }

  return (
    <View style={CommonStyles.screenStyle}>
      <View>
        <View style={[{ flexDirection: 'row', margin: 0 }, CommonStyles.screenStyle, {flex:0}]}>
          <View style={{ width: '85%', flex: 0 }}>
            <SearchBar
              placeholder={'Rechercher...'}
              onChangeText={onSearch}
              onCancel={onSearchCancel}
              onClear={onSearchCancel}
              value={keywords}
              platform='ios'
              autoCapitalize='none'
              autoCorrect={false}
              inputContainerStyle={[{ height: 20 }, CommonStyles.searchContainerStyle]}
              containerStyle={[CommonStyles.screenStyle]}
              cancelButtonTitle='Annuler'
            />
          </View>
          <TouchableOpacity
            onPress={onBarcodeSearch}
            title="Search"
            style={{ marginLeft: 8 }}>
            <Icon
              name='barcode-scan'
              size={45}
              color={CommonStyles.iconStyle.color}/>
          </TouchableOpacity>
        </View>
        <View style={{ marginLeft: -10, marginRight: -10, marginTop: -5, marginBottom: -5 }}>
          <ButtonGroup
            onPress={onPressTypeButton}
            selectedIndex={searchMode}
            buttons={[
              { element: () => <Text>Série</Text> },
              { element: () => <Text>Album</Text> },
              { element: () => <Text>Auteur</Text> }]}
            containerStyle={CommonStyles.buttonGroupContainerStyle}
            buttonStyle={CommonStyles.buttonGroupButtonStyle}
            selectedButtonStyle={CommonStyles.buttonGroupSelectedButtonStyle}
            innerBorderStyle={CommonStyles.buttonGroupInnerBorderStyle}
          />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        {loading ? LoadingIndicator() : (
          <FlatList
            maxToRenderPerBatch={6}
            windowSize={10}
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={Helpers.renderSeparator}
            extraData={keywords, searchMode}
          />)}
      </View>
    </View>
  );
}

export default SearchScreen;
