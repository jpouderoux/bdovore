import React, { useEffect, useState } from 'react';
import { FlatList, Text, SafeAreaView, TouchableOpacity, View } from 'react-native';
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
  const [keywords, setKeywords] = useState("");
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchMode, setSearchMode] = useState(0);

  useEffect(() => {
    onSearch();
  }, [searchMode]);

  const onSearch = () => {
    if (keywords == '') {
      return;
    }

    setLoading(true);
    if (searchMode == 0) {
      APIManager.fetchJSON('Serie', null, onSearchFetched, {
        mode: 1,
        term: keywords
      });
    }
    else if (searchMode == 1) {
      APIManager.fetchAlbum(onSearchFetched,
        {
          term: keywords
        });
    }
    else if (searchMode == 2) {
      APIManager.fetchJSON('Auteur', null, onSearchFetched, {
        mode: 2,
        term: keywords
      });
    }
  };

  const onSearchFetched = async (data) => {
    setData(data.items);
    setErrortext(data.error);
    setLoading(false);
  }

  const onSearchChanged = (searchText) => {
    setKeywords(searchText);
    /*setLoading(true);
    APIManager.fetchAlbum(onSearchFetched,
      {
        term: searchText
      });*/
  }

  const onPressTypeButton = (selectedIndex) => {
    setSearchMode(selectedIndex);
  };

  const renderItem = ({ item, index }) => {
    if (searchMode == 0) {
      return SerieItem({ navigation, item, index });
    } else if (searchMode == 1) {
      return AlbumItem({ navigation, item, index });
    } else if (searchMode == 2) {
      return AuteurItem({ navigation, item, index });
    }
  }

  return (
    <SafeAreaView style={CommonStyles.screenStyle}>
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
            onPress={onSearch}
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
      <View>
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
          />)}
      </View>
    </SafeAreaView>
  );
}

export default SearchScreen;
