import React, { useState } from 'react';
import { FlatList, Text, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { ButtonGroup, SearchBar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Helpers from '../api/Helpers';
import { LoadingIndicator } from '../components/LoadingIndicator';

function SearchScreen({ navigation }) {
  const [keywords, setKeywords] = useState("");
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchMode, setSearchMode] = useState(0);

  const onSearch = () => {
    setLoading(true);
  };

  const onSearchChanged = (searchText) => {
    setKeywords(searchText);
  }

  const onPressTypeButton = (selectedIndex) => {
    setSearchMode(selectedIndex);
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', height: '100%' }}>
      <View>
        <View style={{ flexDirection: 'row', margin: 12 }}>
          <View style={{ width:'85%' }}>
            <SearchBar
              placeholder={'Rechercher...'}
              onChangeText={onSearchChanged}
              value={keywords}
              platform='ios'
              autoCapitalize='none'
              autoCorrect={false}
              inputContainerStyle={{ height: 20 }}
            />
            </View>
          <TouchableOpacity
            onPress={onSearch}
            title="Search"
            style={{marginLeft:10}}>
            <Icon
              name='barcode-scan'
              size={45}
              color='#042' />
          </TouchableOpacity>
        </View>
        <ButtonGroup
          onPress={onPressTypeButton}
          selectedIndex={searchMode}
          buttons={[
            { element: () => <Text>Série</Text> },
            { element: () => <Text>Album</Text> },
            { element: () => <Text>Auteur</Text> }]}
          containerStyle={{ height: 30 }}
        />
      </View>
      <View>
        {loading ? LoadingIndicator() : (
          <FlatList
            data={data}
            keyExtractor={({ id }, index) => id}
            renderItem={({ item }) =>
              <View style={{ borderWidth: 1 }}>
                <Text>{item.serie}</Text>
                <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
              </View>}
            ItemSeparatorComponent={Helpers.renderSeparator}
          />)}
      </View>
    </SafeAreaView>
  );
}

export default SearchScreen;
