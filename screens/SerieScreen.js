import React, { useCallback, useEffect, useState } from 'react';
import { Image, SafeAreaView, SectionList, Text, View } from 'react-native';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager';

import CommonStyles from '../styles/CommonStyles';
import { AlbumItem } from '../components/AlbumItem';
import { LoadingIndicator } from '../components/LoadingIndicator';


function SerieScreen({ route, navigation }) {

  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [serieAlbums, setSerieAlbums] = useState([]);

  const item = route.params.item;

  const refreshDataIfNeeded = async () => {
    console.log("refresh data wishlist");
    fetchData();
  }

  useEffect(() => {
    refreshDataIfNeeded();
    // Make sure data is refreshed when login/token changed
    const willFocusSubscription = navigation.addListener('focus', () => {
      refreshDataIfNeeded();
    });
    return willFocusSubscription;
  }, []);

  const fetchData = () => {
    console.log(item);
    setLoading(true);
    APIManager.fetchSerieAlbums(item.ID_SERIE, {}, onSerieAlbumsFetched);
    //APIManager.fetchSerie(item.ID_SERIE, {}, onSerieFetched);
  }

  const onSerieFetched = async (data) => {
    console.log("serie fetched");

  }

  const onSerieAlbumsFetched = async (data) => {
    console.log("serie albums fetched");

    let newdata = [
      { title: 'Intégrales', data: [] },
      { title: 'Coffrets', data: [] },
      { title: 'Album',  data: [] },
      { title: 'Editions spéciales', data: [] },
    ];

    // Sort albums by type
    for (let i = 0; i < data.items.length; i++) {
      let section = 0;
      const item = data.items[i];
      if (item.FLG_TYPE_TOME == 1) {
        section = 1; // Coffret
      } else {
        if (item.FLG_INT_TOME == 'O') {
          section = 0; // Intégrale
        } else {
          if (item.TITRE_TOME.endsWith('TL') || item.TITRE_TOME.endsWith('TT')) {
            section = 3; // Edition spéciale
          } else {
            section = 2; // Album
          }
        }
      }
      newdata[section].data.push(item);
    }

    // Sort albums by tome number
    newdata[2].data = newdata[2].data.sort((item1, item2) => (item1.NUM_TOME - item2.NUM_TOME));

    // Strip empty sections
    newdata = newdata.filter(item => item.data.length > 0);

    setSerieAlbums(newdata);

    if (data.error === '') {
      setErrortext('');
    } else {
      setErrortext(data.error);
    }
    setLoading(false);
  }

  const renderAlbum = ({ item, index }) => {
    return AlbumItem({ navigation, item, index });
  }

  const keyExtractor = useCallback(({ item }, index) =>
    /*item ? parseInt(item.ID_TOME) : */index);

  let tome = '';
  if (item.NB_TOME) {
    tome = item.NB_TOME + ' tome' + Helpers.plural(item.NB_TOME) + '\n\n';
  }

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', height: '100%' }}>
      <View style={{ margin: 0, alignItems: 'center', flexDirection: 'row', alignContent: "space-between" }}>
        <Text style={{ marginLeft: 10, width: '33%' }}>
          {tome}
          {item.LIB_FLG_FINI_SERIE}
        </Text>
        <Image source={{ uri: APIManager.getSerieCoverURL(item), }} style={[CommonStyles.albumImageStyle, { flexDirection: 'row', height: 75 }]} />
      </View>
      {loading ? LoadingIndicator() : (
        <SectionList
          maxToRenderPerBatch={6}
          windowSize={10}
          sections={serieAlbums}
          keyExtractor={keyExtractor}
          renderItem={renderAlbum}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[CommonStyles.sectionStyle, CommonStyles.bold, { paddingLeft: 10 }]}>{title}</Text>)}
          stickySectionHeadersEnabled={true}
        />
      )}
    </SafeAreaView >
  );
}

export default SerieScreen;
