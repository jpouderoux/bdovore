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

import React, { useCallback, useState, useEffect } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { BottomSheet, ListItem } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';

import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';
import { CommonStyles } from '../styles/CommonStyles';
import { AchatSponsorIcon } from '../components/AchatSponsorIcon';
import { AlbumMarkers } from '../components/AlbumMarkers';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { RatingStars } from '../components/RatingStars';
import CollectionManager from '../api/CollectionManager';
import { CoverImage } from '../components/CoverImage';
import { SmallLoadingIndicator } from '../components/SmallLoadingIndicator';


function AlbumScreen({ route, navigation }) {

  const [albumEditionsData, setAlbumEditionsData] = useState([]);
  const [editionIndex, setEditionIndex] = useState(0);
  const [editionsLoaded, setEditionsLoaded] = useState(false);
  const [errortext, setErrortext] = useState('');
  const [album, setAlbum] = useState(route.params.item);
  const [loading, setLoading] = useState(false);
  const [showEditionsChooser, setShowEditionsChooser] = useState(0);
  const [similAlbums, setSimilAlbums] = useState([]);
  const [comments, setComments] = useState([]);
  const [dontShowSerieScreen, setDontShowSerieScreen] = useState(route.params.dontShowSerieScreen);
  const [showComments, setShowComments] = useState(false);
  const [showUserComment, setShowUserComment] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [userRate, setUserRate] = useState(5);

  const tome = ((album.NUM_TOME > 0) ? 'T' + album.NUM_TOME + ' - ' : '') + album.TITRE_TOME;

  useEffect(() => {
    getAlbumEditions();
    getAlbumIsExclude();
  }, []);

  const getAlbumEditions = () => {
    if (!editionsLoaded && global.isConnected) {
      setLoading(true);
      setEditionsLoaded(true);
      setSimilAlbums([]);
      CollectionManager.fetchAlbumEditions(album, onAlbumEditionsFetched);
      APIManager.fetchSimilAlbums(album.ID_TOME, onSimilFetched);
      APIManager.fetchAlbumComments(album.ID_TOME, onCommentsFetched);
    }
    if (!global.isConnected) {
      onAlbumEditionsFetched({ items: CollectionManager.getAlbumEditionsInCollection(album.ID_TOME, album.ID_SERIE), error: ''});
    }
  }

  const getAlbumIsExclude = () => {
    if (album.IS_EXCLU == undefined && global.isConnected) {
      APIManager.fetchIsAlbumExcluded(album, (result) => {
        if (!result.error) {
          album.IS_EXCLU = result.items != 0;
        }
      });
    }
  }

  const onAlbumEditionsFetched = (result) => {
    setAlbumEditionsData(result.items);
    setErrortext(result.error);
    setLoading(false);

    // Initialize the edition index with the current album edition
    for (let i = 0; i < result.items.length; i++) {
      if (result.items[i].ID_EDITION == album.ID_EDITION) {
        setEditionIndex(i);
        break;
      }
    }
  }

  const onSimilFetched = (result) => {
    setSimilAlbums(result.items);
    setErrortext(result.error);
    setLoading(false);
  }

  const onCommentsFetched = (result) => {
    // strip empty comments
    const coms = result.items.filter((comment) => comment.NOTE != null && comment.COMMENT != '');
    setComments(coms);
    setErrortext(result.error);
    setLoading(false);
  }

  const onShowEditionsChooser = () => {
    setShowEditionsChooser(albumEditionsData.length > 1);
  }

  const onChooseEdition = (index) => {
    setShowEditionsChooser(false);
    setEditionIndex(index);
    setAlbum(Helpers.toDict(albumEditionsData[index]));
  }

  const onSimilPress = (item) => {
    navigation.push('Album', { item });
  }

  const onUserComment = async () => {
    if (global.isConnected) {
      AsyncStorage.getItem('pseudo').then(pseudo => {
        let comment = '';
        let rate = 5;
        comments.forEach(entry => {
          if (entry.username == pseudo) {
            comment = entry.COMMENT;
            rate = entry.NOTE;
          }
        });
        setUserComment(comment);
        setUserRate(rate);
        setShowUserComment(true);
      }).catch(error => { });
    }
  }

  const onShowSerieScreen = async () => {
    if (global.isConnected) {
      setLoading(true);
      APIManager.fetchSerie(album.ID_SERIE, (result) => {
        setLoading(false);
        if (result.error == '') {
          navigation.push('Serie', { item: result.items[0] });
        }
      });
    }
  }

  const getAuteursLabel = () => {
    const auteurs = Helpers.getAuteurs(album);
    let len = auteurs.length;
    if (len == 1 && auteurs.name == 'Collectif') len++;
    return Helpers.pluralize(len, 'Auteur')
  }

  const onPressAuteur = (auteur) => {
    if (auteur != 'Collectif' && global.isConnected) {
      APIManager.fetchAuteur(auteur.id, (result) => {
        if (!result.error && result.items.length > 0) {
          navigation.push('Auteur', { item: result.items[0] });
        }
      });
    }
  }

  const keyExtractor = useCallback((item, index) => Helpers.makeAlbumUID(item));

  const renderSimil = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => onSimilPress(item)} title={item.TITRE_TOME}>
        <View style={{ flexDirection: 'column', width: 110 }}>
          <CoverImage source={APIManager.getAlbumCoverURL(item)} />
          <Text numberOfLines={1} textBreakStrategy='balanced' style={{ width: 110, fontSize: 12, paddingLeft: 4, paddingRight: 4 }}>{item.TITRE_TOME}</Text>
        </View>
      </TouchableOpacity>);
  }

  const renderComment = ({ index, item }) => {
    return (
      item.NOTE > 0 ?
        <View style={{ margin: 10 }}>
          <RatingStars note={item.NOTE} />
          <Text style={CommonStyles.commentsTextStyle}>{item.username}</Text>
          <Text style={CommonStyles.defaultText}>{item.COMMENT}</Text>
        </View> : null);
  }

  const onShowComments = () => {
    if (comments.length > 0) {
      setShowComments(true);
    }
  }

  const onSaveComment = () => {
    setLoading(true);
    setErrortext('');
    APIManager.sendAlbumComment(album.ID_TOME, onCommentSaved, userRate * 2., userComment).then(() => { }).catch(() => { });
  }

  const onCommentSaved = (result) => {
    setErrortext(result.error);
    setLoading(false);
    setShowUserComment(false);
  }

  return (
    <View style={CommonStyles.screenStyle}>
      <ScrollView style={{ margin: 10 }}>
        <View style={{ margin: 10, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.push('Image', { source: APIManager.getAlbumCoverURL(album) })}>
            <CoverImage source={APIManager.getAlbumCoverURL(album)} style={CommonStyles.fullAlbumImageStyle} />
          </TouchableOpacity>
        </View>
        <View style={{ margin: 0, alignItems: 'center' }}>
          <Text h4 style={[CommonStyles.bold, CommonStyles.defaultText, { fontWeight: 'bold', textAlign: 'center' }]}>{tome}</Text>
          <View style={{ marginTop: 10 }}>
            <RatingStars note={album.MOYENNE_NOTE_TOME} />
          </View>
          {loading ? LoadingIndicator() : null}
          {comments.length > 0 ?
            <Text style={[CommonStyles.linkTextStyle, { marginTop: 10, marginBottom: 10 }]}
              onPress={onShowComments}>
              Lire les avis
            </Text> : null}
        </View>
        <View style={{ marginTop: 10, marginBottom: 10, alignItems: 'center' }}>
          <Text style={[CommonStyles.sectionAlbumStyle, CommonStyles.center, CommonStyles.largerText]}>Collection</Text>
          <AlbumMarkers item={album} reduceMode={false} showExclude={(CollectionManager.getNbOfUserAlbumsInSerie(album) > 0)} />
          <Text style={[CommonStyles.sectionAlbumStyle, CommonStyles.center, CommonStyles.largerText]}>Info Album</Text>
        </View>

        <View>
          <Text style={[CommonStyles.largerText, CommonStyles.defaultText, { marginBottom: 5 }, dontShowSerieScreen ? null : CommonStyles.linkTextStyle]}
            onPress={dontShowSerieScreen ? () => { } : onShowSerieScreen}>{album.NOM_SERIE}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={CommonStyles.defaultText}>{getAuteursLabel()} : </Text>
            {
              Helpers.getAuteurs(album).map((auteur, index, array) => {
                return (index == 0 && auteur.name == 'Collectif') ?
                  <Text key={index}>{auteur.name}</Text> :
                  <View key={index} style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => onPressAuteur(auteur)}>
                      <Text style={CommonStyles.linkTextStyle}>{Helpers.reverseAuteurName(auteur.name)}</Text>
                    </TouchableOpacity>
                    <Text>{index != (array.length - 1) ? ' / ' : ''}</Text>
                  </View>
              })
            }
            {
              Helpers.isAlbumBW(album) ? <Text> - N&B</Text> : null
            }
          </View>
          <Text>Genre : {album.NOM_GENRE}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={CommonStyles.defaultText}>Edition{Helpers.plural(albumEditionsData.length, 'Edition')} : </Text>
            <TouchableOpacity
              onPress={onShowEditionsChooser}
              title="Editions">
              {albumEditionsData.length > 1 ?
                <Text style={CommonStyles.albumEditionButtonStyle}>
                  {' '}{album.NOM_EDITION}{' '}
                </Text> : <Text style={CommonStyles.defaultText}>{album.NOM_EDITION}</Text>}
            </TouchableOpacity>
          </View>
          {Helpers.getDateParutionAlbum(album) != '' ?
            <Text>Date de parution : {Helpers.getDateParutionAlbum(album)}</Text>
            : null}
          <AchatSponsorIcon album={album} />
          <Text style={[CommonStyles.defaultText, { marginTop: 10 }]}>{Helpers.removeHTMLTags(album.HISTOIRE_TOME)}</Text>
          {CollectionManager.isAlbumInCollection(album) && global.isConnected ?
            <Text style={[CommonStyles.linkTextStyle, { marginTop: 10, marginBottom: 10 }]}
              onPress={onUserComment}>
              Noter / commenter cet album
            </Text> : null}
        </View>

        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        {similAlbums.length > 0 ?
          <View style={{ marginTop: 10, marginBottom: 10, alignItems: 'center' }}>
            <Text style={[CommonStyles.sectionAlbumStyle, CommonStyles.center, CommonStyles.largerText, { marginBottom: 10 }]}>A voir aussi</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              legacyImplementation={false}
              data={similAlbums}
              renderItem={renderSimil}
              keyExtractor={keyExtractor}
              style={{ height: 170 }}
            />
          </View> : null}

        {/* Editions chooser */}
        <BottomSheet
          isVisible={showEditionsChooser}
          containerStyle={CommonStyles.bottomSheetContainerStyle}>
          <ListItem key='0' containerStyle={CommonStyles.bottomSheetTitleStyle}>
            <ListItem.Content>
              <ListItem.Title style={[CommonStyles.bottomSheetItemTextStyle, CommonStyles.defaultText]}>Editions</ListItem.Title>
            </ListItem.Content>
          </ListItem>
          {albumEditionsData.map((item, index) => (
            <ListItem key={index + 1}
              containerStyle={
                (index == editionIndex ? CommonStyles.bottomSheetSelectedItemContainerStyle : CommonStyles.bottomSheetItemContainerStyle)}
              onPress={() => {
                onChooseEdition(index);
              }}>
              <ListItem.Content>
                <ListItem.Title style={
                  (index == editionIndex ? CommonStyles.bottomSheetSelectedItemTextStyle : CommonStyles.bottomSheetItemTextStyle)}>
                  {item.NOM_EDITION}
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))}
        </BottomSheet>

      </ScrollView>

      {/* Comments */}
      <Modal
        animationType='slide'
        transparent={true}
        isVisible={showComments}
        onBackdropPress={() => setShowComments(false)}
        onRequestClose={() => setShowComments(false)}
        onSwipeComplete={() => setShowComments(false)}
        swipeDirection={['down']}
        useNativeDriver={false}
        propagateSwipe>
        <View style={CommonStyles.modalViewStyle}>
          <FlatList
            legacyImplementation={false}
            data={comments}
            renderItem={renderComment}
            keyExtractor={({ item }, index) => index}
            ItemSeparatorComponent={Helpers.renderSeparator}
            style={{ width: '100%' }}
          />
        </View>
      </Modal>

      {/* Comments */}
      <Modal
        animationType='slide'
        transparent={true}
        isVisible={showUserComment}
        onBackdropPress={() => setShowUserComment(false)}
        onRequestClose={() => setShowUserComment(false)}
        onSwipeComplete={() => setShowUserComment(false)}
        swipeDirection={['down']}
        useNativeDriver={false}
        propagateSwipe>
        <View style={CommonStyles.modalViewStyle}>
          <View style={{ marginTop: 10, width: '80%' }}>
            <View style={{ margin: 0, alignItems: 'center' }}>
              <Text style={[CommonStyles.defaultText, CommonStyles.bold, CommonStyles.largerText, { textAlign: 'center' }]}>{tome}</Text>
              <View style={{ marginVertical: 10 }}>
                <RatingStars note={userRate} editable={true} callback={setUserRate} />
              </View>
              <TextInput
                multiline={true}
                numberOfLines={10}
                editable
                textContentType={'none'}
                style={[CommonStyles.commentsTextInputStyle, { flex: 0, width: '100%', margin: 0 }]}
                onChangeText={(comment) => setUserComment(comment)}
                value={userComment}
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
      </Modal>
    </View>
  );
}

export default AlbumScreen;
