import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, View } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

import { ButtonGroup, Divider, Rating, SearchBar } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function MyCollection({ navigation }) {
  const [keywords, setKeywords] = useState('');
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [nbSeries, setNbSeries] = useState(0);
  const [nbAlbums, setNbAlbums] = useState(0);
  const [collecMode, setCollecMode] = useState('series');
  const [searchMode, setSearchMode] = useState(0);

  // Move to login page if no token available
  AsyncStorage.getItem('Token').then((value) => {
    if (value === null) {
      navigation.navigate('Login');
    }
  }, () => {}
  );

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
        console.log(json);
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

  //let rowColors = ['#ddd', '#eee'];
  let rowColors = ['#fff', '#fff'];

  const onPressSearchMode = (selectedIndex) => {
    setSearchMode(selectedIndex);
    if (selectedIndex === 0) {
      getSeries();
    } else {
      getAlbums();
    }
  };

  const onPressSerie = (item) => {
    navigation.push('Serie', { item });
  }

  const onPressAlbum = (item) => {
    navigation.push('Album', { item });
  }

  const renderItem = ({ item, index }) => {
    if (collecMode === 'series') {
      return renderSerie({ item, index });
    }
    if (collecMode === 'albums') {
      return renderAlbum({ item, index });
    }
  }

  const renderSerie = ({ item, index }) => {
    return (
      <TouchableOpacity key={index} onPress={()=> onPressSerie(item)}>
        <View style={{ flexDirection: 'row', backgroundColor: rowColors[index % rowColors.length] }}>
          <View style={{ margin: 5 }}>
            <Image source={{ uri: encodeURI('https://www.bdovore.com/images/couv/' + item.IMG_COUV_SERIE), }} style={styles.albumImageStyle} />
          </View>
          <View style={{ margin: 5, flexDirection: "column" }}>
            <Text style={styles.bold}>{item.TITRE_TOME}</Text>
            <Text style={styles.bold}>{item.NOM_SERIE}</Text>
            <Text>{item.NOM_GENRE}</Text>
            <Text style={styles.italic}>{item.NB_USER_ALBUM} album{item.NB_USER_ALBUM > 1 ? 's' : ''} sur {item.NB_ALBUM} dans la base</Text>
            <Text style={styles.italic}>{item.LIB_FLG_FINI_SERIE}</Text>
            {(item.NOTE_SERIE) !== null ?
              <View style={{ marginTop: 5, height: 20, alignItems: 'baseline' }}>
                <Rating
                  ratingCount={5}
                  imageSize={20}
                  startingValue={(item.NOTE_SERIE) / 2}
                  tintColor={rowColors[index % rowColors.length]}
                  readonly={true}
                />
              </View>
              : null}
          </View>
        </View>
        <View style={{ borderBottomColor: '#eee', borderBottomWidth: StyleSheet.hairlineWidth*2, }} />
      </TouchableOpacity >
    );
}

  const renderAlbum = ({ item, index }) => {
    const tome = (item.NUM_TOME !== null) ? "Tome " + item.NUM_TOME : '';
    return (
      <TouchableOpacity key={index} onPress={()=> onPressAlbum(item)}>
        <View style={{ flexDirection: 'row', backgroundColor: rowColors[index % rowColors.length] }}>
          <View style={{ margin: 5 }}>
            <Image source={{ uri: encodeURI('https://www.bdovore.com/images/couv/' + item.IMG_COUV), }} style={styles.albumImageStyle} />
          </View>
          <View style={{ margin: 5, justifyContent: "center", flexDirection: "column" }}>
            <Text style={styles.bold}>{item.TITRE_TOME}</Text>
            <Text>{item.NOM_SERIE}</Text>
            <Text>{tome}</Text>
            <Text>{item.NOM_GENRE}</Text>
            {(item.MOYENNE_NOTE_TOME) !== null ?
              <View style={{ marginTop: 5, height: 20, alignItems: 'baseline' }}>
                <Rating
                  ratingCount={5}
                  imageSize={20}
                  startingValue={(item.MOYENNE_NOTE_TOME) / 2}
                  tintColor={rowColors[index % rowColors.length]}
                  readonly={true}
                />
              </View>
              : null}
          </View>
        </View>
        <View style={{ borderBottomColor: '#eee', borderBottomWidth: StyleSheet.hairlineWidth * 2, }} />
      </TouchableOpacity>
    );
  }

  const onSearchChanged = (searchText) => {
    setKeywords(searchText);
    let filteredData = data.filter(function (item) {
      let title = collecMode === 'series' ? item.NOM_SERIE : item.TITRE_TOME;
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
          <Text style={styles.errorTextStyle}>
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

const styles = EStyleSheet.create({
  searchInput: {
    flex: 1,
    margin: 12,
    color: 'black',
    fontSize: '0.7rem',
    height: 32,
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: '#dadae8',
  },
  starStyle: {
    color: 'yellow',
    backgroundColor: 'transparent',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptyStarStyle: {
    color: 'white',
  },
  albumImageStyle: {
    width: 90,
    height: 122,
  },
  italic: {
    fontStyle: 'italic'
  },
  bold: {
    fontWeight: 'bold'
  }
});

export default MyCollection;
