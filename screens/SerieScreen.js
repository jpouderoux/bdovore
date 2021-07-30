import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, SectionList, Text, View } from 'react-native';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager';

import CommonStyles from '../styles/CommonStyles';
import { AlbumItem } from '../components/AlbumItem';
import { CoverImage } from '../components/CoverImage';
import { LoadingIndicator } from '../components/LoadingIndicator';


function SerieScreen({ route, navigation }) {

  const [errortext, setErrortext] = useState('');
  const [item, setItem] = useState(route.params.item);
  const [loading, setLoading] = useState(false);
  const [serieAlbums, setSerieAlbums] = useState([]);

  const refreshDataIfNeeded = async () => {
    console.log("refresh data wishlist");
    fetchData();
  }

  useEffect(() => {
    refreshDataIfNeeded();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setErrortext('');
    setSerieAlbums([]);
    APIManager.fetchSerieAlbums(item.ID_SERIE, {}, onSerieAlbumsFetched);
  }

  const onSerieAlbumsFetched = async (result) => {
    console.log("serie albums fetched");

    let newdata = [
      { title: 'Intégrales', data: [] },
      { title: 'Coffrets', data: [] },
      { title: 'Album', data: [] },
      { title: 'Editions spéciales', data: [] },
    ];

    // Sort albums by type
    for (let i = 0; i < result.items.length; i++) {
      let section = 0;
      const item = result.items[i];
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
    Helpers.sortByAscendingValue(newdata[2].data);

    setSerieAlbums(newdata);

    setErrortext(result.error);
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
    <SafeAreaView style={CommonStyles.screenStyle}>
      <View style={{ margin: 0, alignItems: 'center', flexDirection: 'row', alignContent: "space-between" }}>
        <Text style={{ marginLeft: 10, width: '33%' }}>
          {tome}
          {item.LIB_FLG_FINI_SERIE}
        </Text>
        <CoverImage source={APIManager.getSerieCoverURL(item)} style={{ flexDirection: 'row', height: 75 }} />
      </View>
      {errortext != '' ? (
        <Text style={CommonStyles.errorTextStyle}>
          {errortext}
        </Text>
      ) : null}
      {loading ? LoadingIndicator() : (
        <SectionList
          maxToRenderPerBatch={6}
          windowSize={10}
          sections={serieAlbums.filter(s => s.data.length > 0)}
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
