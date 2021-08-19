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

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';
import { bdovorgray, CommonStyles, AlbumImageWidth } from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager';

import { CoverImage } from './CoverImage';
import { CollectionMarkers } from './CollectionMarkers';
import { RatingStars } from './RatingStars';


export function AlbumItem({ navigation, item, index, collectionMode, dontShowSerieScreen, showEditionDate }) {

  const onPressAlbum = () => {
    navigation.push('Album', { item, dontShowSerieScreen });
  }

  const convertDate = (date) => {
    //return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); // not supported on react
    return date.split('-').reverse().join('/');
  }

  return (
    <TouchableOpacity key={index} onPress={onPressAlbum}>
      <View style={{ flexDirection: 'row', }}>
        <View style={{ width: AlbumImageWidth, alignItems: 'center' }}>
          <CoverImage source={APIManager.getAlbumCoverURL(item)} />
        </View>
        <View style={CommonStyles.itemTextContent}>
          <Text style={[CommonStyles.largerText]} numberOfLines={1} textBreakStrategy='balanced'>
            {item.TITRE_TOME}
          </Text>
          <RatingStars note={item.MOYENNE_NOTE_TOME} style={{marginTop: 5}}/>
          <Text style={[CommonStyles.itemTextWidth, { color: bdovorgray, marginTop: 5 }]}>
            {item.NOM_SERIE} {(item.NUM_TOME !== null) ? "tome " + item.NUM_TOME : ''}{'\n'}
            {showEditionDate && item.DTE_PARUTION ? '\nA paraître le ' + convertDate(item.DTE_PARUTION) : '' }
          </Text>
          {collectionMode ? null :
            <CollectionMarkers item={item} style={styles.markersStyle} reduceMode={true} />
          }
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = EStyleSheet.create({
  markersStyle: {
    position: 'absolute',
    bottom: 0,
    right: 5,
  },
});
