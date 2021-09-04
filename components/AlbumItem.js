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

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { CommonStyles, AlbumImageWidth } from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';
import { CoverImage } from './CoverImage';
import { AlbumMarkers } from './AlbumMarkers';
import { RatingStars } from './RatingStars';
import CollectionManager from '../api/CollectionManager';

export function AlbumItem({ navigation, item, index, collectionMode, dontShowSerieScreen, showEditionDate, showExclude }) {

  const onPressAlbum = () => {
    navigation.push('Album', { item: Helpers.toDict(item), dontShowSerieScreen });
  }

  return (
    <TouchableOpacity key={index} onPress={onPressAlbum}>
      <View style={{ flexDirection: 'row', }}>
        <View style={{ width: AlbumImageWidth, alignItems: 'center' }}>
          <CoverImage source={APIManager.getAlbumCoverURL(item)} />
        </View>
        <View style={CommonStyles.itemTextContent}>
          <Text style={[CommonStyles.largerText, CommonStyles.itemTitleText]} numberOfLines={1} textBreakStrategy='balanced'>
            {item.TITRE_TOME}
          </Text>
          <RatingStars note={item.MOYENNE_NOTE_TOME} style={{marginTop: 5}}/>
          <Text style={[CommonStyles.itemTextWidth, CommonStyles.itemText, { marginTop: 5 }]}>
            {(dontShowSerieScreen || !item.NUM_TOME || item.NUM_TOME == 0) ? '' : (item.NOM_SERIE + ' ')}{(item.NUM_TOME > 0) ? "tome " + item.NUM_TOME : ''}{'\n'}
            {showEditionDate && item.DTE_PARUTION ? '\nA paraître le ' + Helpers.convertDate(item.DTE_PARUTION) : '' }
          </Text>
          {collectionMode ? null :
            <AlbumMarkers item={item} style={CommonStyles.markersViewStyle} reduceMode={true} showExclude={showExclude && CollectionManager.getNbOfUserAlbumsInSerie(item) > 0 ? true : false}/>
          }
        </View>
      </View>
    </TouchableOpacity>
  );
}
