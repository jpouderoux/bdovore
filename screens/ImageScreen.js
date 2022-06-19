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
import { ActivityIndicator, Dimensions, Image, Text, TouchableWithoutFeedback, View } from 'react-native';

import { CommonStyles } from '../styles/CommonStyles';


function ImageScreen({ route, navigation }) {
  return (
    <View style={{ backgroundColor: 'black', height: '100%', width: '100%' }}>
      <TouchableWithoutFeedback onPress={() => { navigation.goBack(); }}>
        <Image
          source={{ uri: route.params.source }}
          style={[{ resizeMode: 'contain', width: Dimensions.get('window').width, height: Dimensions.get('window').height }]}
          PlaceholderContent={<ActivityIndicator size='small' color='white' />} />
      </TouchableWithoutFeedback>
        {route.params.copyright ?
          <Text style={[CommonStyles.smallerText, { color: 'gray', position: 'absolute', bottom: 4, left: 4 }]}>© {route.params.copyright}</Text> :
          null}
    </View>
  );
}

export default ImageScreen;
