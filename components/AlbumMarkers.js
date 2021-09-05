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
import { Text, TouchableOpacity, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as APIManager from '../api/APIManager'
import CollectionManager from '../api/CollectionManager';
import { CommonStyles } from '../styles/CommonStyles';
import * as Helpers from '../api/Helpers';

export function AlbumMarkers({ item, style, reduceMode, showExclude, refreshCallback = ()=>{} }) {

  const [showAllMarks, setShowAllMarks] = useState(false);
  const [initAlbum, setInitAlbum] = useState({});
  const [album, setAlbum] = useState(item);
  const [isOwn, setIsOwn] = useState(false);
  const [isWanted, setIsWanted] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isLoan, setIsLoan] = useState(false);
  const [isNum, setIsNum] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [isExcluded, setIsExcluded] = useState(false);

  const isFocused = useIsFocused(); // Needed to make sure the component is refreshed on focus get back!

  const refresh = () => {
    setInitAlbum(item);
    if (!item) { return; }
    //console.debug("REFRESH MARKERS FOR ALBUM: " + item.ID_TOME + " EDITION " + item.ID_EDITION + " SERIE " + item.ID_SERIE);
    //console.debug(item);
    let alb = null;
    alb = CollectionManager.getAlbumInWishlist(item);
    if (alb) {
      setShowAllMarks(false);
      setIsOwn(false);
      //console.debug('Album ' + alb.ID_TOME + ' série ' + alb.ID_SERIE + ' edition ' + alb.ID_EDITION + ' found in wishlist with flag: ' + alb.FLG_ACHAT);
    } else {
      alb = CollectionManager.getAlbumInCollection(item);
      if (alb) {
        setShowAllMarks(!reduceMode);
        setIsOwn(true);
        //console.debug('Album ' + alb.ID_TOME + ' série ' + alb.ID_SERIE + ' edition ' + alb.ID_EDITION + ' found in collection');
      }
    }
    if (!alb) {
      alb = item;
      setShowAllMarks(false);
      setIsOwn(false);
      //console.debug('Album ' + alb.ID_TOME + ' série ' + alb.ID_SERIE + ' edition ' + alb.ID_EDITION + ' not found in collection or wishlist');
      CollectionManager.resetAlbumFlags(alb);
    }

    //console.debug(alb);
    setIsWanted(alb.FLG_ACHAT && alb.FLG_ACHAT == 'O');
    setIsRead(alb.FLG_LU && alb.FLG_LU == 'O');
    setIsLoan(alb.FLG_PRET && alb.FLG_PRET == 'O');
    setIsNum(alb.FLG_NUM && alb.FLG_NUM == 'O');
    setIsGift(alb.FLG_CADEAU && alb.FLG_CADEAU == 'O');
    setIsExcluded(alb.IS_EXCLU);
    alb = Helpers.toDict(alb);
    setAlbum(alb);
  }

  useEffect(() => {
    refresh();
  }, [item]);

  const onGotIt = async () => {
    if (!CollectionManager.isAlbumInCollection(album)) {
      // Add album to collection & remove it from the wishlist
      CollectionManager.addAlbumToCollection(album, (result) => {
        if (!result.error) {
          // If album was not collection and has been added
          setIsOwn(true);
          setIsWanted(false);
          setShowAllMarks(reduceMode ? false : true);
          refreshCallback();
        }
      });
    }
    else {
      CollectionManager.removeAlbumFromCollection(album, (result) => {
        if (!result.error) {
          // Album was in collection and has been removed
          setIsOwn(false);
          setIsWanted(false);
          setShowAllMarks(false);
          refreshCallback();
        }
      });
    }
  };

  const onWantIt = async () => {
    // Switch the want it flag
    const wantIt = !(album.FLG_ACHAT == 'O');
    if (wantIt) {
      CollectionManager.addAlbumToWishlist(album, (result) => {
        if (!result.error) {
          setIsWanted(wantIt);
          refreshCallback();
        }
      });
    }
    else {
      CollectionManager.removeAlbumFromWishlist(album, (result) => {
        if (!result.error) {
          setIsWanted(wantIt);
          refreshCallback();
        }
      });
    }
  };

  const onReadIt = async () => {
    const readIt = !(album.FLG_LU == 'O');
    CollectionManager.setAlbumReadFlag(album, readIt, (result) => {
      if (!result.error) {
        setIsRead(readIt);
        refreshCallback();
      }
    });
  };

  const onLendIt = async () => {
    const lendIt = !(album.FLG_PRET == 'O');
    CollectionManager.setAlbumLendFlag(album, lendIt, (result) => {
      if (!result.error) {
        setIsLoan(lendIt);
        refreshCallback();
      }
    });
  };

  const onNumEd = async () => {
    const numEd = !(album.FLG_NUM == 'O');
    CollectionManager.setAlbumNumEdFlag(album, numEd, (result) => {
      if (!result.error) {
        setIsNum(numEd);
        refreshCallback();
      }
    });
  };

  const onGift = async () => {
    const gift = !(album.FLG_CADEAU == 'O');
    CollectionManager.setAlbumGiftFlag(album, gift, (result) => {
      if (!result.error) {
        setIsGift(gift);
        refreshCallback();
      }
    });
  };

  const onExcludeIt = async () => {
    const exclude = !(album.IS_EXCLU == 1);
    const callback = (result) => {
      if (!result.error) {
        album.IS_EXCLU = exclude ? 1 : 0;
        setIsExcluded(exclude);
        refreshCallback();
      }};
    if (exclude) {
      APIManager.excludeAlbum(album, callback);
    } else {
      APIManager.includeAlbum(album, callback);
    }
  }

  return (
    <View style={[{ flexDirection: 'row' }, style]}>

      <TouchableOpacity onPress={onGotIt} title="" style={CommonStyles.markerStyle}>
        <MaterialCommunityIcons name={CollectionManager.isAlbumInCollection(album) ? 'check-bold' : 'check'} size={25} color={CollectionManager.isAlbumInCollection(album) ? CommonStyles.markIconEnabled.color : CommonStyles.markIconDisabled.color} style={CommonStyles.markerIconStyle} />
        <Text style={[CommonStyles.markerTextStyle, CollectionManager.isAlbumInCollection(album) ? CommonStyles.markIconEnabled : CommonStyles.markIconDisabled]}>J'ai</Text>
      </TouchableOpacity>

      {!CollectionManager.isAlbumInCollection(album) ?
        <TouchableOpacity onPress={onWantIt} title="" style={CommonStyles.markerStyle}>
          <MaterialCommunityIcons name={(album.FLG_ACHAT == 'O') ? 'heart' : 'heart-outline'} size={25} color={(album.FLG_ACHAT == 'O') ? CommonStyles.markWishIconEnabled.color : CommonStyles.markIconDisabled.color} style={CommonStyles.markerIconStyle} />
          <Text style={[CommonStyles.markerTextStyle, (album.FLG_ACHAT == 'O') ? CommonStyles.markWishIconEnabled : CommonStyles.markIconDisabled]}>Je veux</Text>
        </TouchableOpacity> : null}

      {(!CollectionManager.isAlbumInCollection(album) && !CollectionManager.isAlbumInWishlist(album) && showExclude) ?
        <TouchableOpacity onPress={onExcludeIt} title="" style={CommonStyles.markerStyle}>
          <MaterialCommunityIcons name='cancel' size={25} color={album.IS_EXCLU ? CommonStyles.markWishIconEnabled.color : CommonStyles.markIconDisabled.color} style={[CommonStyles.markerIconStyle, album.IS_EXCLU ? {fontWeight: 'bold'} : null]} />
          <Text style={[CommonStyles.markerTextStyle, album.IS_EXCLU ? CommonStyles.markWishIconEnabled : CommonStyles.markIconDisabled]}>Ignorer</Text>
        </TouchableOpacity> : null}

      {showAllMarks ?
        <TouchableOpacity onPress={onReadIt} title="" style={CommonStyles.markerStyle}>
          <MaterialCommunityIcons name={(album.FLG_LU == 'O') ? 'book' : 'book-outline'} size={25} color={(album.FLG_LU == 'O') ? CommonStyles.markIconEnabled.color : CommonStyles.markIconDisabled.color} style={CommonStyles.markerIconStyle} />
          <Text style={[CommonStyles.markerTextStyle, (album.FLG_LU == 'O') ? CommonStyles.markIconEnabled : CommonStyles.markIconDisabled]}>Lu</Text>
        </TouchableOpacity> : null}

      {showAllMarks ?
        <TouchableOpacity onPress={onLendIt} title="" style={CommonStyles.markerStyle}>
          <Ionicons name={(album.FLG_PRET == 'O') ? 'ios-person-add' : 'ios-person-add-outline'} size={25} color={(album.FLG_PRET == 'O') ? CommonStyles.markIconEnabled.color : CommonStyles.markIconDisabled.color} style={CommonStyles.markerIconStyle} />
          <Text style={[CommonStyles.markerTextStyle, (album.FLG_PRET == 'O') ? CommonStyles.markIconEnabled : CommonStyles.markIconDisabled]}>Prêt</Text>
        </TouchableOpacity> : null}

      {showAllMarks ?
        <TouchableOpacity onPress={onNumEd} title="" style={CommonStyles.markerStyle}>
          <MaterialIcons name={(album.FLG_NUM == 'O') ? 'devices' : 'devices'} size={25} color={(album.FLG_NUM == 'O') ? CommonStyles.markIconEnabled.color : CommonStyles.markIconDisabled.color} style={CommonStyles.markerIconStyle} />
          <Text style={[CommonStyles.markerTextStyle, (album.FLG_NUM == 'O') ? CommonStyles.markIconEnabled : CommonStyles.markIconDisabled]}>Ed. Num.</Text>
        </TouchableOpacity> : null}

      {showAllMarks ?
        <TouchableOpacity onPress={onGift} title="" style={CommonStyles.markerStyle}>
          <MaterialCommunityIcons name={(album.FLG_CADEAU == 'O') ? 'gift' : 'gift-outline'} size={25} color={(album.FLG_CADEAU == 'O') ? CommonStyles.markIconEnabled.color : CommonStyles.markIconDisabled.color} style={CommonStyles.markerIconStyle} />
          <Text style={[CommonStyles.markerTextStyle, (album.FLG_CADEAU == 'O') ? CommonStyles.markIconEnabled : CommonStyles.markIconDisabled]}>Cadeau</Text>
        </TouchableOpacity> : null}

    </View>);
}
