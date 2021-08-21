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

import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native'

import * as APIManager from '../api/APIManager';
import { bdovorgray, CommonStyles } from '../styles/CommonStyles';
import { SmallLoadingIndicator } from '../components/SmallLoadingIndicator';
import { RatingStars } from '../components/RatingStars';


function UserCommentScreen({ route, navigation }) {

  const [errortext, setErrortext] = useState('');
  const [album, setAlbum] = useState(route.params.album);
  const [loading, setLoading] = useState(false);
  const [rate, setRate] = useState(route.params.rate / 2.);
  const [comment, setComment] = useState(route.params.comment);

  const tome = ((album.NUM_TOME !== null) ? 'T' + album.NUM_TOME + ' - ' : '') + album.TITRE_TOME;

  const onSaveComment = () => {
    setLoading(true);
    setErrortext('');
    APIManager.sendAlbumComment(album.ID_TOME, onCommentSaved, rate * 2., comment).then(() => { }).catch(() => { });
  }

  const onCommentSaved = (result) => {
    setErrortext(result.error);
    setLoading(false);
    if (result.error == '') {
      navigation.goBack();
    }
  }

  return (
    <View style={[CommonStyles.screenStyle, { padding: 10 }]}>
      <View style={{ margin: 10 }}>
        <View style={{ margin: 0, alignItems: 'center' }}>
          <Text style={[CommonStyles.bold, CommonStyles.largerText, { textAlign: 'center' }]}>{tome}</Text>
          <View style={{ marginVertical: 10 }}>
            <RatingStars note={rate} editable={true} callback={setRate} />
          </View>
          <TextInput multiline={true}
            numberOfLines={10}
            editable
            textContentType={'none'}
            style={CommonStyles.commentsTextInputStyle}
            onChangeText={(comment) => setComment(comment)}
            value={comment}
            autoFocus={true}
          />
          <Text style={[CommonStyles.linkTextStyle, { marginTop: 10, marginBottom: 10 }]}
            onPress={onSaveComment}>
            Enregistrer votre avis
          </Text>
        </View>
        {loading ? <SmallLoadingIndicator /> : null}
        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default UserCommentScreen;
