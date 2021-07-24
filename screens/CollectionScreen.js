import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { ButtonGroup, SearchBar } from 'react-native-elements';

import * as APIManager from '../api/APIManager.js'
import { AlbumItem } from '../components/AlbumItem.js';
import { SerieItem } from '../components/SerieItem.js';

function CollectionScreen({ navigation }) {
  const [keywords, setKeywords] = useState('');
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [nbSeries, setNbSeries] = useState(0);
  const [nbAlbums, setNbAlbums] = useState(0);
  const [collecMode, setCollecMode] = useState('series');
  const [searchMode, setSearchMode] = useState(0);

  useEffect(() => {
    getElementsCount();
    getData(collecMode);
    // Make sure data is refreshed when login/token changed
    const willFocusSubscription = navigation.addListener('focus', () => {
      console.log(collecMode);
      getData(collecMode);
    });
    return willFocusSubscription;
  }, []);

  // const tesst= (x) => {
  //   x[0] = x[0] * 2;
  // }

  // let x = [2];
  // tesst(x);
  // console.log(x[0]);

  // Move to login page if no token available
  APIManager.checkForToken(navigation);

  const getSeries = () => {
    return getData('series');
  }

  const getAlbums = () => {
    return getData('albums');
  }

  const getElementsCount = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('Token');
    //console.log("Token: " + token);
    if (token == null) {
      navigation.push('Login');
      return;
    }
    const url1 = 'https://www.bdovore.com/getjson?data=Userserie&API_TOKEN=' + encodeURI(token) + '&mode=2&length=0';
    fetch(url1)
      .then((response) => response.json())
      .then((json) => { setNbSeries(json.nbserie); })
      .catch((error) => {})
      .finally(() => { setLoading(false); });

    const url2 = 'https://www.bdovore.com/getjson?data=Useralbum&API_TOKEN=' + encodeURI(token) + '&mode=2&length=0';
    fetch(url2)
      .then((response) => response.json())
      .then((json) => { setNbAlbums(json.nbTotal); })
      .catch((error) => {})
      .finally(() => { setLoading(false); });
  };

  const getData = async (cMode) => {
    setLoading(true);
    setErrortext('');
    const token = await AsyncStorage.getItem('Token');
    //console.log("Token: " + token);
    if (token == null) {
      navigation.push('Login');
      return;
    }
    setCollecMode(cMode);
    console.log("set " + cMode);
    let dataMode = '';
    if (cMode === 'series') {
      dataMode = 'Userserie';
    }
    else if (cMode === 'albums') {
      dataMode = 'Useralbum';
    }
    else {
      setLoading(false);
      return;
    }
    const url = 'https://www.bdovore.com/getjson?data=' + dataMode + '&API_TOKEN=' + encodeURI(token) + '&mode=2&page=1&length=999';
    console.log(url);
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        //console.log(json);
        if (cMode === 'series') {
          setNbSeries(json.nbserie);
        }
        else {
          setNbAlbums(json.nbTotal);
        }
        setData(json.data);
      })
      .catch((error) => {
        setData([]);
        //setErrortext(error);
        console.error("Error: " + error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onPressSearchMode = (selectedIndex) => {
    setSearchMode(selectedIndex);
    if (selectedIndex === 0) {
      getSeries();
    } else {
      getAlbums();
    }
  };

  const renderItem = ({ item, index }) => {
    if (collecMode === 'series') {
      return SerieItem({ navigation, item, index });
    }
    if (collecMode === 'albums') {
      return AlbumItem({ navigation, item, index });
    }
  }

  const onSearchChanged = (searchText) => {
    setKeywords(searchText);
    let filteredData = data.filter(function (item) {
      let title = collecMode === 'series' ? item.NOM_SERIE : item.TITRE_TOME;
      title = title.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accents
      return title ? title.toLowerCase().includes(searchText.toLowerCase()): false;
    });
    setFilteredData(filteredData);
  }

  return (
    <SafeAreaView style={{ backgroundColor: '#fff' }}>
      <ButtonGroup
        onPress={onPressSearchMode}
        selectedIndex={searchMode}
        buttons={[
          { element: () => <Text>{nbSeries} série{nbSeries > 1 ? 's' : ''}</Text> },
          { element: () => <Text>{nbAlbums} album{nbAlbums > 1 ? 's' : ''}</Text> }]}
        containerStyle={{ height: 30 }}
      />
      <SearchBar
        placeholder={'Rechercher dans mes ' + collecMode + '...'}
        onChangeText={onSearchChanged}
        value={keywords}
        platform='ios'
        autoCapitalize='none'
        autoCorrect={false}
        inputContainerStyle={{height:20,}}
        inputStyle={{fontSize: 13 }}
      />
      <View>
        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        {loading ? <ActivityIndicator size="large" color="#f00f0f" /> : (
          <FlatList
            maxToRenderPerBatch={20}
            windowSize={12}
            data={keywords && keywords !== '' ? filteredData : data}
            keyExtractor={({ item }, index) => index}
            renderItem={renderItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default CollectionScreen;
