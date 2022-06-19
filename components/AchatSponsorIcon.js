/* Copyright 2021-2022 Joachim Pouderoux & Association BDovore
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
import { Image, Linking, TouchableOpacity, View } from 'react-native';

import { CommonStyles } from '../styles/CommonStyles';


export function AchatSponsorIcon({ album, style }) {
  return (
    (global.hideSponsoredLinks || !global.isConnected) ? null : // Sponsored links are disabled on iOS according AppStore rules.
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        {album.EAN_EDITION ? <TouchableOpacity
          onPress={() => { Linking.openURL('https://www.bdfugue.com/a/?ean=' + album.EAN_EDITION + "&ref=295"); }}
          title="Acheter sur BDFugue" >
          <Image source={require('../assets/bdfugue.png')} style={CommonStyles.bdfugueIcon} />
        </TouchableOpacity> : null}
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(album.ISBN_EDITION ?
              ('https://www.amazon.fr/exec/obidos/ASIN/' + album.ISBN_EDITION + "/bdovorecom-21/") :
              encodeURI('https://www.amazon.fr/exec/obidos/external-search?tag=bdovorecom-21&mode=books-fr&keyword=' + album.TITRE_TOME));
          }}
          title="Acheter sur Amazon" >
          <Image source={require('../assets/amazon.png')} style={CommonStyles.amazonIcon} />
        </TouchableOpacity>
      </View>);
}

