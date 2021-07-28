import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, SectionList, Text, View } from 'react-native';
import { ButtonGroup } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager'
import { AlbumItem } from '../components/AlbumItem';
import { LoadingIndicator } from '../components/LoadingIndicator';
import CommonStyles from '../styles/CommonStyles';


let newsModeMap = {
  0: 'BD',
  1: 'Mangas',
  2: 'Comics'
};

function createNewsSection(data = []) {
  return { title: 'Albums tendances', data: data };
}
function createUserNewsSection(data = []) {
  return { title: 'Mon actualité', data: data };
}

function NewsScreen({ navigation }) {
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [newsDataArray, setNewsDataArray] = useState(createUserNewsSection());
  const [userNewsDataArray, setUserNewsDataArray] = useState(createNewsSection());
  const [newsMode, setNewsMode] = useState(0);
  let [cachedToken, setCachedToken] = useState('');

  Helpers.checkForToken(navigation);

  const refreshDataIfNeeded = async () => {
    AsyncStorage.getItem('token').then((token) => {
      if (token !== cachedToken) {
        setCachedToken(token);
        cachedToken = token;
        console.log("refresh news data");
        fetchData(newsMode);
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

  const fetchData = async (newsMode) => {
    setLoading(true);

    setUserNewsDataArray(createUserNewsSection());
    APIManager.fetchUserNews({ navigation: navigation }, onUserNewsFetched)
    .then().catch((error) => console.log(error));

    setNewsDataArray(createNewsSection());
    APIManager.fetchNews(newsModeMap[newsMode], { navigation: navigation }, onNewsFetched)
      .then().catch((error) => console.log(error));
  }

  const onNewsFetched = async (result) => {
    console.log('news fetched!');
    setNewsDataArray(createNewsSection(result.items));
    setErrortext(result.error);
    setLoading(false);
  }

  const onUserNewsFetched = async (result) => {
    console.log('user news fetched!');
    setUserNewsDataArray(createUserNewsSection(result.items));
    setErrortext(result.error);
    setLoading(false);
  }

  const onPressNewsMode = (selectedIndex) => {
    setNewsMode(selectedIndex);
    fetchData(selectedIndex);
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
          buttonStyle={{ borderRadius: 10, backgroundColor: 'lightgrey'}}
        />
      </View>
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
            sections={[userNewsDataArray, newsDataArray]}
            keyExtractor={keyExtractor}
            renderItem={renderAlbum}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={[CommonStyles.sectionStyle, CommonStyles.bold, CommonStyles.largerText, { paddingLeft: 10 }]}>{title}</Text>)}
            stickySectionHeadersEnabled={true}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default NewsScreen;
