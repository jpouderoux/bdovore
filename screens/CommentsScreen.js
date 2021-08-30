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
import { FlatList, Text, View } from 'react-native'

import * as Helpers from '../api/Helpers';
import { CommonStyles } from '../styles/CommonStyles';
import { RatingStars } from '../components/RatingStars';


function CommentsScreen({ route, navigation }) {

  const [comments, setComments] = useState(route.params.comments);

  const renderComment = ({ index, item }) => {
    return (
      item.NOTE > 0 ?
        <View style={{ margin: 10 }}>
          <RatingStars note={item.NOTE} />
          <Text style={CommonStyles.commentsTextStyle}>{item.username}</Text>
          <Text style={CommonStyles.defaultText}>{item.COMMENT}</Text>
        </View> : null);
  }

  return (
    <View style={CommonStyles.screenStyle}>
      <View style={{ marginTop: 10, marginBottom: 10, alignItems: 'center' }}>
        <FlatList
          legacyImplementation={false}
          data={comments}
          renderItem={renderComment}
          keyExtractor={({ item }, index) => index}
          ItemSeparatorComponent={Helpers.renderSeparator}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}

export default CommentsScreen;
