import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, SectionList, Text, View } from 'react-native';

import * as Helpers from '../api/Helpers';
import * as APIManager from '../api/APIManager';

import CommonStyles from '../styles/CommonStyles';
import { AlbumItem } from '../components/AlbumItem';
import { AuteurItem } from '../components/AuteurItem';
import { SmallLoadingIndicator } from '../components/SmallLoadingIndicator';


function AuteurScreen({ route, navigation }) {

  const [auteurAlbums, setAuteurAlbums] = useState([]);
  const [errortext, setErrortext] = useState('');
  const [item, setItem] = useState(route.params.item);
  const [loading, setLoading] = useState(false);
  const [nbAlbums, setNbAlbums] = useState(-1);
  const [nbSeries, setNbSeries] = useState(-1);

  useEffect(() => {
    refreshDataIfNeeded();
  }, []);

  const refreshDataIfNeeded = async () => {
    console.log("refresh auteur data");
    fetchData();
  }

  const fetchData = () => {
    setLoading(true);
    setAuteurAlbums([]);
    setNbSeries(-1);
    setNbAlbums(-1);
    setErrortext('');
    APIManager.fetchAlbum(onAuteurAlbumsFetched, { id_auteur: item.ID_AUTEUR});
  }

  const onAuteurAlbumsFetched = async (result) => {
    console.log("auteur albums fetched");

    // Sort the albums by serie by putting them in a dictionnary of series
    let data = result.items;
    let albums = {};
    data.forEach(album => {
      var key = album.NOM_SERIE;
      if (key in albums) {
        albums[key].data.push(album);
      } else {
        albums[key] = { title: album.NOM_SERIE, data: [album] };
      }
    });

    // Sort the series dictionnary by name
    const sortObjectByKeys = (o) => {
      return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
    }
    albums = sortObjectByKeys(albums);

    // Sort each series by tome number
    const albumsArray = Object.values(albums);
    albumsArray.forEach(album => {
      Helpers.sortByAscendingValue(album.data, 'NUM_TOME');
    });

    setAuteurAlbums(albumsArray);
    setNbSeries(albumsArray.length);
    setNbAlbums(result.totalItems);
    setErrortext(result.error);
    setLoading(false);
  }

  const renderAlbum = ({ item, index }) => {
    return AlbumItem({ navigation, item, index });
  }

  const keyExtractor = useCallback(({ item }, index) => index);

  return (
    <SafeAreaView style={CommonStyles.screenStyle}>
      <View>
        <AuteurItem item={item} nbAlbums={nbAlbums} nbSeries={nbSeries} noPressAction={true}/>
        {loading ? <SmallLoadingIndicator /> : null}
      </View>
      {errortext != '' ? (
        <Text style={CommonStyles.errorTextStyle}>
          {errortext}
        </Text>
      ) : null}
      <SectionList
        maxToRenderPerBatch={6}
        windowSize={10}
        sections={auteurAlbums}
        keyExtractor={keyExtractor}
        renderItem={renderAlbum}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[CommonStyles.sectionStyle, CommonStyles.bold, { paddingLeft: 10 }]}>{title}</Text>)}
        stickySectionHeadersEnabled={true}
      />
    </SafeAreaView >
  );
}

export default AuteurScreen;
