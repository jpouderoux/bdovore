import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Switch, Divider, Rating } from 'react-native-elements';

import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import * as APIManager from '../api/APIManager'
import CommonStyles from '../styles/CommonStyles';

function ToCompleteScreen({navigation}) {
  const [keywords, setKeywords] = useState('');
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [nbAlbums, setNbAlbums] = useState(0);

  // Move to login page if no token available
  APIManager.checkForToken(navigation);

  useEffect(() => {
    fetchData();
    // Make sure data is refreshed when login/token changed
    // const willFocusSubscription = navigation.addListener('focus', () => {
      //   //getData();
      // });
      // return willFocusSubscription;
    }, []);

    const onPressAlbum = (item) => {
      navigation.navigate('Album', { item });
    }

    const onIWantIt = () => {
    }

  const fetchData = async () => {
    setLoading(true);
    setErrortext('');
    const token = await AsyncStorage.getItem('Token');
    if (token == null) {
      navigation.push('Login');
      return;
    }
    const url = 'https://www.bdovore.com/getjson?data=Albummanquant&API_TOKEN=' + encodeURI(token) + '&mode=all&page=1&length=999';
    console.log(url);
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        //console.log(json);
        setNbAlbums(json.nbmanquant);
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
    const tome = (item.NUM_TOME !== null) ? "tome " + item.NUM_TOME : '';
    return (
      <TouchableOpacity key={index} onPress={() => onPressAlbum(item)}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ margin: 5 }}>
            <Image source={{ uri: encodeURI('https://www.bdovore.com/images/couv/' + item.IMG_COUV), }} style={CommonStyles.albumImageStyle} />
          </View>
          <View style={{ margin: 5, flexDirection: "column", flexGrow: 3}}>
            <Text style={CommonStyles.bold}>{item.TITRE_TOME}</Text>
            <Text>{item.NOM_SERIE} {tome}</Text>
            {(item.MOYENNE_NOTE_TOME) !== null ?
              <View style={{ marginTop: 5, height: 20, alignItems: 'baseline' }}>
                <Rating
                  ratingCount={5}
                  imageSize={20}
                  startingValue={(item.MOYENNE_NOTE_TOME) / 2}
                  tintColor='#fff'
                  readonly={true}
                />
              </View>
              : null}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginRight: 10}}>
              <TouchableOpacity onPress={onIWantIt} title="" >
                <Icon name='check-bold' size={25} color='#f22' />
              </TouchableOpacity>
              <TouchableOpacity onPress={onIWantIt} title="" >
                <Icon name='heart' size={25} color='#f22' />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{ borderBottomColor: '#eee', borderBottomWidth: StyleSheet.hairlineWidth * 2, }} />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', height: '100%' }}>
      <View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ flex: 1, margin: 5, fontSize: 16 }}>{nbAlbums} album{nbAlbums > 1 ? 's' : ''}</Text>
        </View>
        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        {loading ? <ActivityIndicator size="large" color="#f00f0f" /> : (
          <FlatList
            maxToRenderPerBatch={20}
            windowSize={12}
            data={data}
            keyExtractor={({ item }, index) => index}
            renderItem={renderAlbum}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

export default ToCompleteScreen;
