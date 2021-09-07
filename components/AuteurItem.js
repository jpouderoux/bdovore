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

import { CommonStyles } from '../styles/CommonStyles';
import { CoverImage } from './CoverImage';
import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';


export function AuteurItem({ navigation, item, nbAlbums, nbSeries, noPressAction, index, canViewFullscreenImage }) {

  const onPressAuteur = (navigation, item) => {
    navigation.push('Auteur', { item });
  }

  const fonction = [];

  if (item.FLG_SCENAR) { fonction.push('Scénariste'); }
  if (item.FLG_DESSIN) { fonction.push('Dessinateur'); }
  if (item.FLG_COLOR) { fonction.push('Coloriste'); }
  const fonctionString = fonction.join(', ');

  return (
    <TouchableOpacity key={index} disabled={noPressAction ? true : false} onPress={() => onPressAuteur(navigation, item)}>
      <View style={{ flexDirection: 'row' }}>
        {canViewFullscreenImage ?
          <TouchableOpacity onPress={() => navigation.push('Image', { source: APIManager.getAuteurCoverURL(item) })}>
            <CoverImage source={APIManager.getAuteurCoverURL(item)} />
          </TouchableOpacity> :
          <CoverImage source={APIManager.getAuteurCoverURL(item)} />
        }
        <View style={[CommonStyles.itemTextContent, { marginTop: 15 }]}>
          <Text style={[CommonStyles.itemTextWidth, CommonStyles.largerText, CommonStyles.itemTitleText]} numberOfLines={1} textBreakStrategy='balanced'>{Helpers.reverseAuteurName(item.PSEUDO)}</Text>
          <Text style={[CommonStyles.itemTextWidth, CommonStyles.itemText, { fontSize: 16, marginTop: 10 }]}>{fonctionString}</Text>
          {nbSeries && nbSeries > 0 ?
            <Text style={[CommonStyles.itemTextWidth, CommonStyles.itemText, { fontSize: 16, marginTop: 10 }]}>
              {Helpers.pluralWord(nbAlbums, 'album')} pour {Helpers.pluralWord(nbSeries, 'série')}
            </Text> : null}
        </View>
      </View>
    </TouchableOpacity >
  );
}
