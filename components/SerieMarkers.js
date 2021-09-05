/* Copyright 2021 Joachim Pouderoux & Association BDovore
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

import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as APIManager from '../api/APIManager';
import CollectionManager from '../api/CollectionManager';
import { CommonStyles } from '../styles/CommonStyles';


export function SerieMarkers({ item, serieAlbums, style, showExclude }) {

  const [serie, setSerie] = useState(item);
  const [isExcluded, setIsExcluded] = useState(false);

  const isFocused = useIsFocused(); // Needed to make sure the component is refreshed on focus get back!

  const refresh = () => {
    setIsExcluded(CollectionManager.isSerieExcluded(serie));
  }

  useEffect(() => {
    refresh();
  }, []);

  const onHaveAll = () => {
    Alert.alert(
      serie.NOM_SERIE,
      "Que souhaitez-vous ajouter à votre collection ?",
      [{
        text: "Tout",
        onPress: () => { CollectionManager.addSerieToCollection(serie, serieAlbums); }
      }, {
        text: "Que les albums",
        onPress: () => { CollectionManager.addSerieAlbumsToCollection(serie, serieAlbums); }
      }, {
        text: "Annuler",
        onPress: () => { },
        style: "cancel"
      }],
      { cancelable: true });
  }

  const onExcludeIt = async () => {
    const exclude = !(serie.IS_EXCLU == 1);
    const callback = (result) => {
      if (!result.error) {
        global.db.write(() => {
          serie.IS_EXCLU = exclude ? 1 : 0;
        });
        setIsExcluded(exclude == 1);
      }};
    if (exclude) {
      APIManager.excludeSerie(serie, callback);
      CollectionManager.setSerieExcludeFlag(serie, true);
    } else {
      APIManager.includeSerie(serie, callback);
      CollectionManager.setSerieExcludeFlag(serie, false);
    }
  }

  const nbOfUserAlbums = CollectionManager.getNbOfUserAlbumsInSerie(serie);

  return (
    <View style={[{ flexDirection: 'row' }, style]}>

      {nbOfUserAlbums == 0 && serieAlbums.length > 0 ?
        <TouchableOpacity onPress={onHaveAll} title="" style={CommonStyles.markerStyle}>
          <MaterialCommunityIcons name={CollectionManager.isSerieComplete(serie) ? 'check-bold' : 'check'} size={25} color={CollectionManager.isSerieComplete(serie) ? CommonStyles.markIconEnabled.color : CommonStyles.markIconDisabled.color} style={[CommonStyles.markerIconStyle, { width: 30 }]} />
          <Text style={[CommonStyles.markerTextStyle, CollectionManager.isSerieComplete(serie) ? CommonStyles.markIconEnabled : CommonStyles.markIconDisabled]}>J'ai tout !</Text>
        </TouchableOpacity> : null}

      {nbOfUserAlbums > 0 && showExclude ?
        <TouchableOpacity onPress={onExcludeIt} title="" style={CommonStyles.markerStyle}>
          <MaterialCommunityIcons name='cancel' size={25} color={serie.IS_EXCLU == 1 ? CommonStyles.markWishIconEnabled.color : CommonStyles.markIconDisabled.color} style={[CommonStyles.markerIconStyle, serie.IS_EXCLU == '1' ? { fontWeight: 'bold' } : null]} />
          <Text style={[CommonStyles.markerTextStyle, serie.IS_EXCLU == 1 ? CommonStyles.markWishIconEnabled : CommonStyles.markIconDisabled]}>Ignorer</Text>
        </TouchableOpacity> : null}

    </View>);
}
