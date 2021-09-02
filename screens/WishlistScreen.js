/* Copyright 2021 Joachim Pouderoux & Association Bdovore
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Switch, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ButtonGroup } from 'react-native-elements';

import * as Helpers from '../api/Helpers';
import { AlbumItemHeight, CommonStyles } from '../styles/CommonStyles';
import { AlbumItem } from '../components/AlbumItem';
import CollectionManager from '../api/CollectionManager';

let collectionGenre = 0;

function WishlistScreen({ route, navigation }) {

  const [filterByDate, setFilterByDate] = useState(true);
  const [filteredData, setFilteredData] = useState(null);
  const [collectionType, setCollectionType] = useState(0);

  collectionGenre = route.params.collectionGenre;

  const isFocused = useIsFocused();

  Helpers.checkForToken(navigation);

  useEffect(() => {
    // Make sure data is refreshed when screen get focus again
    const willFocusSubscription = navigation.addListener('focus', () => {
      refreshData();
    });
    return willFocusSubscription;
  }, []);

  useEffect(() => {
    refreshData();
  }, [filterByDate]);

  useEffect(() => {
    navigation.setOptions({
      title: ('Mes envies' + (collectionGenre > 0 ? (' - ' + CollectionManager.CollectionGenres[collectionGenre][0]) : '')),
    });
    refreshData();
  }, [collectionGenre]);

  const refreshData = () => {
    const collec = CollectionManager.getWishes(collectionGenre);
    setFilteredData(filterByDate ?  Helpers.sliceSortByDate(collec) : collec);
  }

  const toggleFilterByDate = () => {
    setFilterByDate(previousState => !previousState);
  }

  const renderItem = ({ item, index }) =>
    Helpers.isValid(item) ? AlbumItem({ navigation, item: Helpers.toDict(item), index }) : null;

  const keyExtractor = useCallback((item, index) =>
    Helpers.isValid(item) ? Helpers.makeAlbumUID(item) : index);

  return (
    <View style={CommonStyles.screenStyle}>
      <View style={{ flexDirection: 'row' }}>
        <ButtonGroup
          onPress={()=>{}}
          selectedIndex={collectionType}
          buttons={[{
            element: () => <Text style={CommonStyles.defaultText}>
              {Helpers.pluralWord(filteredData ? filteredData.length : CollectionManager.numberOfWishAlbums(collectionGenre > 0 ? CollectionManager.CollectionGenres[collectionGenre][0] : null), 'album')}</Text>
          }]}
          containerStyle={[{ marginLeft: 8, flex: 1 }, CommonStyles.buttonGroupContainerStyle]}
          buttonStyle={CommonStyles.buttonGroupButtonStyle}
          selectedButtonStyle={CommonStyles.buttonGroupSelectedButtonStyle}
          innerBorderStyle={CommonStyles.buttonGroupInnerBorderStyle}
        />
        <View style={{ flexDirection: 'row' }}>
          <Text style={[CommonStyles.defaultText, { margin: 5, marginTop: 10 }]}>Tri par ajout</Text>
          <Switch value={filterByDate} onValueChange={toggleFilterByDate}
            thumbColor={CommonStyles.switchStyle.color}
            trackColor={{ false: CommonStyles.switchStyle.borderColor, true: CommonStyles.switchStyle.backgroundColor }}/>
        </View>
      </View>
      {CollectionManager.numberOfWishAlbums(collectionGenre > 0 ? CollectionManager.CollectionGenres[collectionGenre][0] : null) == 0 ?
        <View style={[CommonStyles.screenStyle, { alignItems: 'center', height: '50%', flexDirection: 'column' }]}>
          <View style={{ flex: 1 }}></View>
          <Text style={CommonStyles.defaultText}>Aucun album{CollectionManager.CollectionGenres[collectionGenre][1]} dans la wishlist.{'\n'}</Text>
          <Text style={CommonStyles.defaultText}>Ajoutez les albums que vous souhaitez</Text>
          <Text style={CommonStyles.defaultText}>acquérir via les boutons</Text>
          <View style={{ flexDirection: 'column' }}>
            <MaterialCommunityIcons name='heart-outline' size={25} color={CommonStyles.markIconDisabled.color} style={CommonStyles.markerIconStyle} />
            <Text style={[CommonStyles.markerTextStyle, CommonStyles.markIconDisabled]}>Je veux</Text>
          </View>
          <View style={{ flex: 1 }}></View>
        </View>
        :
        <FlatList
          style={{ flex: 1 }}
          maxToRenderPerBatch={6}
          windowSize={10}
          data={filteredData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={Helpers.renderSeparator}
          getItemLayout={(data, index) => ({
            length: AlbumItemHeight,
            offset: AlbumItemHeight * index,
            index
          })}
        />
      }
    </View>
  );
}

export default WishlistScreen;
