import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Switch, Divider, Rating } from 'react-native-elements';

import AsyncStorage from '@react-native-community/async-storage';


function Wishlist({ navigation }) {
  const [keywords, setKeywords] = useState('');
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [nbAlbums, setNbAlbums] = useState(0);

  // Move to login page if no token available
  AsyncStorage.getItem('Token').then((value) => {
    if (value === null) {
      navigation.navigate('Login');
    }
  }, () => { }
  );

  useEffect(() => {
    getData();
    // Make sure data is refreshed when login/token changed
    const willFocusSubscription = navigation.addListener('focus', () => {
      getData();
    });
    return willFocusSubscription;
  }, []);

  const getData = async () => {
    setLoading(true);
    setErrortext('');
    const token = await AsyncStorage.getItem('Token');
    if (token == null) {
      navigation.navigate('Login');
      return;
    }
    const url = 'https://www.bdovore.com/getjson?data=Useralbum&API_TOKEN=' + encodeURI(token) + '&mode=2&page=1&length=999&flg_achat=0';
    console.log(url);
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setNbAlbums(json.nbTotal);
        setData(json.data);
      })
      .catch((error) => {
        setData([]);
        setErrortext(error);
        console.error("Error: " + error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderAlbum = ({ item, index }) => {
    const tome = (item.NUM_TOME !== null) ? "Tome " + item.NUM_TOME : '';
    return (
      <TouchableOpacity key={index} onPress={() => onPressAlbum(item)}>
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

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', height: '100%' }}>
      <View>
        <View style={{ flexDirection: 'row'}}>
          <Text style={{ flex:1, margin: 5, fontSize: 16}}>{nbAlbums} album{nbAlbums>1?'s':''}</Text>
          <View></View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ margin: 5, fontSize: 16 }}>Tri par ajout</Text>
            <Switch value={false} />
          </View>
        </View>
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
            renderItem={renderAlbum}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  albumImageStyle: {
    width: 90,
    height: 122,
  },
});

export default Wishlist;
