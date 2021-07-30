import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, SectionList, Text, View } from 'react-native';
import { ButtonGroup } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager'
import { AlbumItem } from '../components/AlbumItem';
import { SmallLoadingIndicator } from '../components/SmallLoadingIndicator';
import CommonStyles from '../styles/CommonStyles';


let newsModeMap = {
  0: 'BD',
  1: 'Mangas',
  2: 'Comics'
};

function createUserNewsSection(data = []) {
  return { title: 'Mon actualité', data: data };
}

function createUserNewsToComeSection(data = []) {
  return { title: 'A paraître', data: data };
}

function createNewsSection(data = []) {
  return { title: 'Albums tendances', data: data };
}

function NewsScreen({ navigation }) {
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [userNewsDataArray, setUserNewsDataArray] = useState([]);
  const [userNewsToComeDataArray, setUserNewsToComeDataArray] = useState([]);
  const [filteredUserNewsDataArray, setFilteredUserNewsDataArray] = useState(createUserNewsSection());
  const [filteredUserNewsToComeDataArray, setFilteredUserNewsToComeDataArray] = useState(createUserNewsToComeSection());
  const [newsDataArray, setNewsDataArray] = useState(createNewsSection());
  const [newsMode, setNewsMode] = useState(0);
  let [cachedToken, setCachedToken] = useState('');

  Helpers.checkForToken(navigation);

  const refreshDataIfNeeded = async () => {
    AsyncStorage.getItem('token').then((token) => {
      if (token !== cachedToken) {
        setCachedToken(token);
        cachedToken = token;
        console.log("refresh news data");
        fetchUserNewsData(newsMode);
        fetchNewsData(newsMode);
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

  useEffect(() => {
    // Filter the user news according the current news mode
    setFilteredUserNewsDataArray(
      createUserNewsSection(Helpers.stripNewsByOrigin(userNewsDataArray.slice(), newsModeMap[newsMode])));

    // Filter the user news to come according the current news mode
    setFilteredUserNewsToComeDataArray(
      createUserNewsToComeSection(Helpers.stripNewsByOrigin(userNewsToComeDataArray.slice(), newsModeMap[newsMode])));
  }, [newsMode]);

  const fetchUserNewsData = async (newsMode) => {
    setLoading(true);

    setFilteredUserNewsDataArray(createUserNewsSection());
    APIManager.fetchUserNews({ navigation: navigation }, onUserNewsFetched, { nb_mois: '12'})
    .then().catch((error) => console.log(error));

    setFilteredUserNewsToComeDataArray(createUserNewsToComeSection());
    APIManager.fetchUserNews({ navigation: navigation }, onUserNewsToComeFetched, { nb_mois: '-1' })
      .then().catch((error) => console.log(error));
  }

  const fetchNewsData = async (newsMode) => {
    setLoading(true);
    setNewsDataArray(createNewsSection());
    APIManager.fetchNews(newsModeMap[newsMode], { navigation: navigation }, onNewsFetched)
      .then().catch((error) => console.log(error));
  }

  const onUserNewsFetched = async (result) => {
    console.log('user news fetched!');
    setUserNewsDataArray(result.items);
    setFilteredUserNewsDataArray(
      createUserNewsSection(Helpers.stripNewsByOrigin(result.items, newsModeMap[newsMode])));
    setErrortext(result.error);
    setLoading(false);
  }

  const onUserNewsToComeFetched = async (result) => {
    console.log('user news to come fetched!');
    setUserNewsToComeDataArray(result.items);
    setFilteredUserNewsToComeDataArray(
      createUserNewsToComeSection(Helpers.stripNewsByOrigin(result.items, newsModeMap[newsMode])));
    setErrortext(result.error);
    setLoading(false);
  }

  const onNewsFetched = async (result) => {
    console.log('news fetched!');
    setNewsDataArray(createNewsSection(result.items));
    setErrortext(result.error);
    setLoading(false);
  }

  const onPressNewsMode = (selectedIndex) => {
    setNewsMode(selectedIndex);
    fetchNewsData(selectedIndex);
  };

  const renderAlbum = ({ item, index }) => {
    return AlbumItem({ navigation, item, index });
  }

  const keyExtractor = useCallback(({ item }, index) => index);

  return (
    <SafeAreaView style={CommonStyles.screenStyle}>
      <View style={{marginLeft:-10, marginRight:-10, marginTop:-5, marginBottom:-5}}>
        <ButtonGroup
          onPress={onPressNewsMode}
          selectedIndex={newsMode}
          buttons={[
            { element: () => <Text>{newsModeMap[0]}</Text> },
            { element: () => <Text>{newsModeMap[1]}</Text> },
            { element: () => <Text>{newsModeMap[2]}</Text> }]}
          containerStyle={{ height: 40, margin: 0, backgroundColor: 'lightgrey' }}
          buttonStyle={{ borderRadius: 10, backgroundColor: 'lightgrey' }}
        />
      </View>
      <View>
        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        {loading ? <SmallLoadingIndicator/> : null}
        <SectionList
          maxToRenderPerBatch={8}
          windowSize={10}
          ItemSeparatorComponent={Helpers.renderSeparator}
          sections={[filteredUserNewsDataArray, filteredUserNewsToComeDataArray, newsDataArray]}
          keyExtractor={keyExtractor}
          renderItem={renderAlbum}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[CommonStyles.sectionStyle, CommonStyles.bold, CommonStyles.largerText, { paddingLeft: 10 }]}>{title}</Text>)}
          stickySectionHeadersEnabled={true}
        />
      </View>
    </SafeAreaView>
  );
}

export default NewsScreen;
