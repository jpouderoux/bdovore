import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Rating } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager';
import CommonStyles from '../styles/CommonStyles';

function ToCompleteScreen({ navigation }) {
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [nbAlbums, setNbAlbums] = useState(0);
  const [dataFetched, setDataFetched] = useState(false);
  const [cachedToken, setCachedToken] = useState('');

  // Move to login page if no token available
  APIManager.checkForToken(navigation);

  const refreshDataIfNeeded = async () => {
    AsyncStorage.getItem('token').then((token) => {
      if (token !== cachedToken) {
        setCachedToken(token);
        fetchData();
      } else if (!dataFetched) {
        fetchData();
      }
    }).catch(() => { });
  }

  useEffect(() => {
    refreshDataIfNeeded();
    // Make sure data is refreshed when login/token changed
    const willFocusSubscription = navigation.addListener('focus', () => {
      refreshDataIfNeeded();
    });
    return willFocusSubscription;
  }, [cachedToken]);

  const onPressAlbum = (item) => {
    navigation.navigate('Album', { item });
  }

  const onIWantIt = () => {
  }

  const onDataFetched = (data) => {
    setNbAlbums(data.nbItems);
    setData(data.items);
    setErrortext(data.error);
    if (data.error === '') {
      setDataFetched(true);
      console.log('fetched!');
    }
    setLoading(false);
  }

  const fetchData = async () => {
    setLoading(true);
    APIManager.fetchAlbumsManquants({ navigation: navigation}, onDataFetched)
    .then().catch((error) => console.log(error));
  }

  const renderAlbum = ({ item, index }) => {
    const tome = (item.NUM_TOME !== null) ? "tome " + item.NUM_TOME : '';
    return (
      <TouchableOpacity key={index} onPress={() => onPressAlbum(item)}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ margin: 5 }}>
            <Image source={{ uri: APIManager.getAlbumCoverURL(item) }} style={CommonStyles.albumImageStyle} />
          </View>
          <View style={{ margin: 5, flexDirection: "column", flexGrow: 3 }}>
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
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginRight: 10 }}>
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
        {loading ? null :
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ flex: 1, margin: 5, fontSize: 16 }}>{nbAlbums} album{nbAlbums > 1 ? 's' : ''}</Text>
        </View>}
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
            ItemSeparatorComponent={Helpers.renderSeparator}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

export default ToCompleteScreen;
