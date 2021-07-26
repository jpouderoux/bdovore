import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, SectionList, Text, View } from 'react-native';
import { ButtonGroup } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager'
import { AlbumItem } from '../components/AlbumItem';
import { LoadingIndicator } from '../components/LoadingIndicator';
import CommonStyles from '../styles/CommonStyles';

function NewsScreen({ navigation }) {
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [newsData, setNewsData] = useState([{ title: 'Mon actualité', data: []}, { title: 'Albums tendances', data: [] }]);
  const [newsMode, setNewsMode] = useState(0);
  const [dataFetched, setDataFetched] = useState(false);
  let [cachedToken, setCachedToken] = useState('');

  // Move to login page if no token available
  APIManager.checkForToken(navigation);

  const refreshDataIfNeeded = async () => {
    AsyncStorage.getItem('token').then((token) => {
      if (token !== cachedToken) {
        setCachedToken(token);
        cachedToken = token;
        console.log("refresh news data");
        fetchData(newsMode);
      }/* else if (!dataFetched) {
        console.log("refresh news data first");
        fetchData(newsMode);
      }*/
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

  const fetchData = async (newsMode) => {
    setLoading(true);
    let mode = '';
    if (newsMode === 0) mode = 'BD';
    else if (newsMode === 1) mode = 'Mangas';
    else if (newsMode === 2) mode = 'Comics';
    APIManager.fetchNews(mode, { navigation: navigation }, onNewsFetched)
      .then().catch((error) => console.log(error));
    APIManager.fetchUserNews({ navigation: navigation }, onUserNewsFetched)
      .then().catch((error) => console.log(error));
  }

  const onNewsFetched = async (data) => {
    let nd = newsData;
    nd[1].data = data.items;
    setNewsData(nd);
    setErrortext(data.error);
    if (data.error === '') {
      setDataFetched(true);
      console.log('news fetched!');
    }
    setLoading(false);
  }

  const onUserNewsFetched = async (data) => {
    let nd = newsData;
    nd[0].data = data.items;
    //setNewsData(nd);
    setErrortext(data.error);
    if (data.error === '') {
      setDataFetched(true);
      console.log('user news fetched!');
    }
    setLoading(false);
  }


  const onPressNewsMode = (selectedIndex) => {
    setNewsMode(selectedIndex);
    fetchData(selectedIndex);
  };

  const renderAlbum = ({ item, index }) => {
    return AlbumItem({ navigation, item, index });
  }

  const keyExtractor = useCallback(({ item }, index) =>
    /*item ? parseInt(item.ID_TOME) : */index);

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', height: '100%' }}>
      <ButtonGroup
        onPress={onPressNewsMode}
        selectedIndex={newsMode}
        buttons={[
          { element: () => <Text>BD</Text> },
          { element: () => <Text>Mangas</Text> },
          { element: () => <Text>Comics</Text> }]}
        containerStyle={{ height: 30 }}
      />
      <View>
        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        {loading ? LoadingIndicator() : (
          <SectionList
            maxToRenderPerBatch={8}
            windowSize={10}
            ItemSeparatorComponent={Helpers.renderSeparator}
            sections={newsData}
            keyExtractor={keyExtractor}
            renderItem={renderAlbum}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={[CommonStyles.sectionStyle, CommonStyles.bold, { paddingLeft: 10 }]}>{title}</Text>)}
            stickySectionHeadersEnabled={true}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default NewsScreen;
