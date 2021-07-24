import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, View } from 'react-native';
import { Switch } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';

import { AlbumItem } from '../components/AlbumItem';
import * as APIManager from '../api/APIManager'

function WishlistScren({ navigation }) {
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [nbAlbums, setNbAlbums] = useState(0);

  // Move to login page if no token available
  APIManager.checkForToken(navigation);

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

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', height: '100%' }}>
      <View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ flex: 1, margin: 5, fontSize: 16 }}>{nbAlbums} album{nbAlbums > 1 ? 's' : ''}</Text>
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
            data={data}
            keyExtractor={({ item }, index) => index}
            renderItem={AlbumItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default WishlistScren;
