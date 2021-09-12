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
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ButtonGroup, SearchBar } from 'react-native-elements';

import { AlbumItem } from '../components/AlbumItem';
import { AuteurItem } from '../components/AuteurItem';
import { CommonStyles } from '../styles/CommonStyles';
import { Icon } from '../components/Icon';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { SerieItem } from '../components/SerieItem';
import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';
import CollectionManager from '../api/CollectionManager';


let lastKeywords = '';

function SearchScreen({ navigation }) {

  const [data, setData] = useState([]);
  const [errortext, setErrortext] = useState('');
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(0);
  const [toggleElement, setToggleElement] = useState(false);

  const toggle = () => {
    setToggleElement(!toggleElement);
  }

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
      setErrortext(result.error);
      setLoading(false);
    }
  }

  const onSearch = (searchText) => {
    if (!global.isConnected) { return; }
    setKeywords(searchText);
    lastKeywords = searchText;
    if (searchText == '') {
      setData([]);
      return;
    }

    const callback = (result) => onSearchFetched(searchText, result);
    setLoading(true);
    switch (parseInt(searchMode)) {
      case 0:
        APIManager.fetchSerieByTerm(searchText, callback);
        break;
      case 1:
        {
          if (searchText.length >= 8 && Helpers.isNumeric(searchText)) {
            let params = (searchText.length > 10) ? { EAN: searchText } : { ISBN: searchText };
            APIManager.fetchAlbum(callback, params);
          }
          APIManager.fetchAlbum(callback, { term: searchText });
        }
        break;
      case 2:
        APIManager.fetchAuteurByTerm(searchText, callback);
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
    if (global.isConnected) {
      navigation.push('BarcodeScanner', { onGoBack: (ean) => { onSearchWithEAN(ean); } });
    }
  }

  const onSearchWithEAN = async (ean) => {
    if (ean) {
      /*if (global.verbose) {
        Helpers.showToast(false, 'Code-barre trouvé : ' + ean);
      }*/
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
    if (Helpers.isValid(item)) {
      switch (parseInt(searchMode)) {
        case 0: return parseInt(item.ID_SERIE);
        case 1: return Helpers.makeAlbumUID(item);
        case 2: return parseInt(item.ID_AUTEUR);
      }
    }
    return index;
  });

  const renderItem = ({ item, index }) => {
    if (Helpers.isValid(item)) {
      switch (parseInt(searchMode)) {
        case 0: return (<SerieItem navigation={navigation} item={Helpers.toDict(item)} index={index} />);
        case 1: return (<AlbumItem navigation={navigation} item={Helpers.toDict(item)} index={index} refreshCallback={toggle}/>);
        case 2: return (<AuteurItem navigation={navigation} author={item} index={index} />);
      }
    }
    return null;
  }

  return (
    <View style={CommonStyles.screenStyle}>
      <View>
        <View style={[{ flexDirection: 'row', margin: 0 }, CommonStyles.screenStyle, { flex: 0 }]}>
          <View style={{ width: '85%', flex: 0 }}>
            <SearchBar
              placeholder={parseInt(searchMode) == 0 ? 'Nom de la série...' : parseInt(searchMode) == 1 ? "Nom de l'album ou ISBN..." : "Nom de l'auteur..."}
              onChangeText={onSearch}
              onCancel={onSearchCancel}
              onClear={onSearchCancel}
              value={keywords}
              platform='ios'
              autoCapitalize='none'
              autoCorrect={false}
              inputContainerStyle={[{ height: 30 }, CommonStyles.searchContainerStyle]}
              containerStyle={[CommonStyles.screenStyle]}
              cancelButtonTitle='Annuler'
              showLoading={loading}
              inputStyle={[CommonStyles.defaultText, { marginTop: 5 }]}
            />
          </View>
          <TouchableOpacity
            onPress={onBarcodeSearch}
            title="Search"
            style={{ marginLeft: 8, marginVertical: 0 }}>
            <Icon
              name='barcode-scan'
              size={36}
              color={CommonStyles.iconStyle.color} />
          </TouchableOpacity>
        </View>
        <View style={{ marginLeft: -2, marginRight: -2, marginTop: 0, marginBottom: 0 }}>
          <ButtonGroup
            onPress={onPressTypeButton}
            selectedIndex={searchMode}
            buttons={[
              { element: () => <Text style={CommonStyles.defaultText}>Séries</Text> },
              { element: () => <Text style={CommonStyles.defaultText}>Albums</Text> },
              { element: () => <Text style={CommonStyles.defaultText}>Auteurs</Text> }]}
            containerStyle={CommonStyles.buttonGroupContainerStyle}
            buttonStyle={CommonStyles.buttonGroupButtonStyle}
            selectedButtonStyle={CommonStyles.buttonGroupSelectedButtonStyle}
            innerBorderStyle={CommonStyles.buttonGroupInnerBorderStyle}
          />
        </View>
      </View>
      {global.isConnected ?
        <View style={{ flex: 1, marginHorizontal: 1 }}>
          {errortext ? (
            <Text style={CommonStyles.errorTextStyle}>
              {errortext}
            </Text>
          ) : null}
          {loading ? <LoadingIndicator style={{ height: '100%' }} /> : (
            <FlatList
              maxToRenderPerBatch={6}
              windowSize={10}
              data={data}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              ItemSeparatorComponent={Helpers.renderSeparator}
              extraData={toggleElement}
            />)}
        </View> :
        <View style={[CommonStyles.screenStyle, { alignItems: 'center', height: '50%', flexDirection: 'column' }]}>
          <View style={{ flex: 1 }}></View>
          <Text style={CommonStyles.defaultText}>Recherche indisponible en mode non-connecté.{'\n'}</Text>
          <Text style={CommonStyles.defaultText}>Rafraichissez cette page une fois connecté.</Text>
          <TouchableOpacity style={{ flexDirection: 'column', marginTop: 20 }} onPress={onSearch}>
            <Icon name='refresh' size={50} color={CommonStyles.markIconDisabled.color} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}></View>
        </View>}
    </View>
  );
}

export default SearchScreen;
