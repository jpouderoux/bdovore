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

import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { ButtonGroup, SearchBar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager';
import CommonStyles from '../styles/CommonStyles';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { AlbumItem } from '../components/AlbumItem';
import { SerieItem } from '../components/SerieItem';
import { AuteurItem } from '../components/AuteurItem';


function SearchScreen({ navigation }) {

  const [data, setData] = useState([]);
  const [errortext, setErrortext] = useState('');
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(0);
  const [refresh, setRefresh] = useState(1);

  useEffect(() => {
    const willFocusSubscription = navigation.addListener('focus', () => {
      setRefresh(refresh + 1);
    });
    return willFocusSubscription;
  }, []);

  useEffect(() => {
    onSearch();
  }, [searchMode]);

  const onSearch = () => {
    if (keywords == '') {
      return;
    }

    setLoading(true);
    switch (parseInt(searchMode)) {
      case 0:
        APIManager.fetchJSON('Serie', null, onSearchFetched, { term: keywords, mode: 1, });
        break;
      case 1:
        APIManager.fetchAlbum(onSearchFetched, { term: keywords });
        break;
      case 2:
        APIManager.fetchJSON('Auteur', null, onSearchFetched, { term: keywords, mode: 2, });
        break;
    }
  };

  const onSearchFetched = async (result) => {
    setData(result.items);
    setErrortext(result.error);
    setLoading(false);
  }

  const onSearchChanged = (searchText) => {
    setKeywords(searchText);
  }

  const onPressTypeButton = (selectedIndex) => {
    setSearchMode(selectedIndex);
  };

  const onBarcodeSearch = () => {
    navigation.push('BarcodeScanner', { onGoBack: (ean) => { onSearchWithEAN(ean); }});
  }

  const onSearchWithEAN = async (ean) => {
    if (ean) {
      let params = (ean.length > 10) ? { EAN: ean } : { ISBN: ean };
      APIManager.fetchAlbum((result) => {
        if (result.error == '') {
          navigation.push('Album', { item: result.items[0] })
        } else {
          Alert.alert("Aucun album trouvé avec ce code. Essayez la recherche textuelle avec le nom de la série ou de l'album.");
        }
      }, params);
    }
  }

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
        <View style={{ flexDirection: 'row', margin: 0 }}>
          <View style={{ width:'85%' }}>
            <SearchBar
              placeholder={'Rechercher...'}
              onChangeText={onSearchChanged}
              onSubmitEditing={onSearch}
              value={keywords}
              platform='ios'
              autoCapitalize='none'
              autoCorrect={false}
              inputContainerStyle={{ height: 20 }}
              cancelButtonTitle='Annuler'
            />
            </View>
          <TouchableOpacity
            onPress={onBarcodeSearch}
            title="Search"
            style={{marginLeft:8}}>
            <Icon
              name='barcode-scan'
              size={45}
              color='black' />
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
          containerStyle={{ height: 40, margin: 0, backgroundColor: 'lightgrey' }}
          buttonStyle={{ borderRadius: 10, backgroundColor: 'lightgrey' }}
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
            keyExtractor={({ id }, index) => index}
            renderItem={renderItem}
            ItemSeparatorComponent={Helpers.renderSeparator}
            extraData={refresh}
          />)}
      </View>
    </View>
  );
}

export default SearchScreen;
