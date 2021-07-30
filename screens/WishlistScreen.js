import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Switch, Text, View } from 'react-native';

import * as Helpers from '../api/Helpers';
import CommonStyles from '../styles/CommonStyles';

import { AlbumItem } from '../components/AlbumItem';

function WishlistScreen({ navigation }) {
  const [filterByDate, setFilterByDate] = useState(false);
  const [filteredData, setFilteredData] = useState(null);

  Helpers.checkForToken(navigation);

  useEffect(() => {
    // Make sure data is refreshed when screen get focus again
    const willFocusSubscription = navigation.addListener('focus', () => {
      if (!filterByDate) {
        setFilteredData(null);
      } else {
        console.log(global.wishlistAlbums);
        setFilteredData(Helpers.sliceSortByDate(global.wishlistAlbums));
      }
    });
    return willFocusSubscription;
  }, []);

  useEffect(() => {
    if (!filterByDate) {
      setFilteredData(null);
    } else {
      setFilteredData(Helpers.sliceSortByDate(global.wishlistAlbums));
    }
  }, [filterByDate]);

  const renderItem = ({ item, index }) => {
    return AlbumItem({ navigation, item, index });
  }

  const toggleFilterByDate = () => {
    setFilterByDate(previousState => !previousState);
  }

  const keyExtractor = useCallback((item, index) =>
    Helpers.makeAlbumUID(item));

  return (
    <SafeAreaView style={CommonStyles.screenStyle}>
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
          <Text style={{ flex: 1, margin: 5, fontSize: 16 }}>
            {Helpers.pluralWord(filteredData ? filteredData.length : global.wishlistAlbums.length, 'album')}
          </Text>
          <View></View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ margin: 5, fontSize: 16 }}>Tri par ajout</Text>
            <Switch value={filterByDate}
              onValueChange={toggleFilterByDate} />
          </View>
        </View>
        <FlatList
          maxToRenderPerBatch={20}
          windowSize={12}
          data={filteredData ? filteredData : global.wishlistAlbums}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={Helpers.renderSeparator}
        />
      </View>
    </SafeAreaView>
  );
}

export default WishlistScreen;
