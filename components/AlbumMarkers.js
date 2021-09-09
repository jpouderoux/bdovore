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
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { CommonStyles, bdovored } from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager'
import * as Helpers from '../api/Helpers';
import CollectionManager from '../api/CollectionManager';


const pBits = {
  'own': 1,
  'wish': 2,
  'read': 4,
  'loan': 8,
  'num': 16,
  'gift': 32,
  'excluded': 64
};

export function AlbumMarkers({ item, style, reduceMode, showExclude, refreshCallback = () => { } }) {

  const [album, setAlbum] = useState(item);
  const [initAlbum, setInitAlbum] = useState({});
  const [isExcluded, setIsExcluded] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [isLoan, setIsLoan] = useState(false);
  const [isNum, setIsNum] = useState(false);
  const [isOwn, setIsOwn] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isWanted, setIsWanted] = useState(false);
  const [processingState, setProcessingState] = useState(0);
  const [showAllMarks, setShowAllMarks] = useState(false);

  const setProcessingBit = (flag, value) => {
    if (value) {
      setProcessingState(processingState => processingState | pBits[flag]);
    } else {
      setProcessingState(processingState => processingState & ~pBits[flag]);
    }
  }

  const isProcessing = (flag) => {
    return processingState & pBits[flag];
  }

  const refresh = () => {
    if (!item) { return; }
    //console.debug("REFRESH MARKERS FOR ALBUM: " + item.ID_TOME + " EDITION " + item.ID_EDITION + " SERIE " + item.ID_SERIE);
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

    setAlbum(Helpers.toDict(alb));
  }

  useEffect(() => {
    setInitAlbum(item);
    refresh();
  }, [item]);

  useEffect(() => {
    //console.log('album ' + album.ID_TOME + 'refresh');
    setIsWanted(album.FLG_ACHAT && album.FLG_ACHAT == 'O');
    setIsRead(album.FLG_LU && album.FLG_LU == 'O');
    setIsLoan(album.FLG_PRET && album.FLG_PRET == 'O');
    setIsNum(album.FLG_NUM && album.FLG_NUM == 'O');
    setIsGift(album.FLG_CADEAU && album.FLG_CADEAU == 'O');
    setIsExcluded(CollectionManager.isAlbumExcluded(album));
  }, [album]);

  const onGotIt = async () => {
    setProcessingBit('own', true);
    if (!CollectionManager.isAlbumInCollection(album)) {
      // Add album to collection & remove it from the wishlist
      CollectionManager.addAlbumToCollection(album, (result) => {
        if (!result.error) {
          // If album was not collection and has been added
          CollectionManager.setAlbumExcludedFlag(album, false);
          setIsOwn(true);
          setIsWanted(false);
          setShowAllMarks(reduceMode ? false : true);
          refreshCallback();
        }
        setProcessingBit('own', false);
      });
    }
    else {
      CollectionManager.removeAlbumFromCollection(album, (result) => {
        if (!result.error) {
          CollectionManager.setAlbumExcludedFlag(album, false);
          // Album was in collection and has been removed
          setIsOwn(false);
          setIsWanted(false);
          setShowAllMarks(false);
          refreshCallback();
        }
        setProcessingBit('own', false);
      });
    }
  };

  const onWantIt = async () => {
    // Switch the want it flag
    const wantIt = !(album.FLG_ACHAT == 'O');
    setProcessingBit('wish', true);
    if (wantIt) {
      CollectionManager.addAlbumToWishlist(album, (result) => {
        if (!result.error) {
          CollectionManager.setAlbumExcludedFlag(album, false);
          setIsWanted(wantIt);
          refreshCallback();
        }
        setProcessingBit('wish', false);
      });
    }
    else {
      CollectionManager.removeAlbumFromWishlist(album, (result) => {
        if (!result.error) {
          CollectionManager.setAlbumExcludedFlag(album, false);
          setIsWanted(wantIt);
          refreshCallback();
        }
        setProcessingBit('wish', false);
      });
    }
  };

  const onReadIt = async () => {
    const readIt = !(album.FLG_LU == 'O');
    setProcessingBit('read', true);
    CollectionManager.setAlbumReadFlag(album, readIt, (result) => {
      if (!result.error) {
        setIsRead(readIt);
        refreshCallback();
      }
      setProcessingBit('read', false);
    });
  };

  const onLendIt = async () => {
    const lendIt = !(album.FLG_PRET == 'O');
    setProcessingBit('loan', true);
    CollectionManager.setAlbumLendFlag(album, lendIt, (result) => {
      if (!result.error) {
        setIsLoan(lendIt);
        refreshCallback();
      }
      setProcessingBit('loan', false);
    });
  };

  const onNumEd = async () => {
    const numEd = !(album.FLG_NUM == 'O');
    setProcessingBit('num', true);
    CollectionManager.setAlbumNumEdFlag(album, numEd, (result) => {
      if (!result.error) {
        setIsNum(numEd);
        refreshCallback();
      }
      setProcessingBit('num', false);
    });
  };

  const onGift = async () => {
    const gift = !(album.FLG_CADEAU == 'O');
    setProcessingBit('gift', true);
    CollectionManager.setAlbumGiftFlag(album, gift, (result) => {
      if (!result.error) {
        setIsGift(gift);
        refreshCallback();
      }
      setProcessingBit('gift', false);
    });
  };

  const onExcludeIt = async () => {
    const exclude = !CollectionManager.isAlbumExcluded(album);
    setProcessingBit('excluded', true);
    const callback = (result) => {
      if (!result.error) {
        global.db.write(() => {
          initAlbum.IS_EXCLU = exclude ? 1 : 0;
          album.IS_EXCLU = exclude ? 1 : 0;
        });
        CollectionManager.setAlbumExcludedFlag(album, exclude);
        setIsExcluded(exclude);
        refreshCallback();
        setProcessingBit('excluded', false);
      }
    };
    if (exclude) {
      APIManager.excludeAlbum(album, callback);
    } else {
      APIManager.includeAlbum(album, callback);
    }
  }

  const MarkerLoadingIndicator = () => (
    <View style={[CommonStyles.markerIconStyle, { margin: 8 }]}>
      <ActivityIndicator size="small" color={bdovored} />
    </View>);

  return (
    <View style={[{ flexDirection: 'row' }, style]}>

      {isProcessing('own') ? <MarkerLoadingIndicator /> :
        <TouchableOpacity onPress={onGotIt} title="" style={CommonStyles.markerStyle}>
          <MaterialCommunityIcons name={CollectionManager.isAlbumInCollection(album) ? 'check-bold' : 'check'} size={25} color={CollectionManager.isAlbumInCollection(album) ? CommonStyles.markIconEnabled.color : CommonStyles.markIconDisabled.color} style={CommonStyles.markerIconStyle} />
          <Text style={[CommonStyles.markerTextStyle, CollectionManager.isAlbumInCollection(album) ? CommonStyles.markIconEnabled : CommonStyles.markIconDisabled]}>J'ai</Text>
        </TouchableOpacity>
      }

      {isProcessing('wish') ? <MarkerLoadingIndicator /> :
        (!CollectionManager.isAlbumInCollection(album) ?
          <TouchableOpacity onPress={onWantIt} title="" style={CommonStyles.markerStyle}>
            <MaterialCommunityIcons name={(album.FLG_ACHAT == 'O') ? 'heart' : 'heart-outline'} size={25} color={(album.FLG_ACHAT == 'O') ? CommonStyles.markWishIconEnabled.color : CommonStyles.markIconDisabled.color} style={CommonStyles.markerIconStyle} />
            <Text style={[CommonStyles.markerTextStyle, (album.FLG_ACHAT == 'O') ? CommonStyles.markWishIconEnabled : CommonStyles.markIconDisabled]}>Je veux</Text>
          </TouchableOpacity> : null)}

      {isProcessing('excluded') ? <MarkerLoadingIndicator /> :
        ((!CollectionManager.isAlbumInCollection(album) && !CollectionManager.isAlbumInWishlist(album) && showExclude) ?
          <TouchableOpacity onPress={onExcludeIt} title="" style={CommonStyles.markerStyle}>
            <MaterialCommunityIcons name='cancel' size={25} color={CollectionManager.isAlbumExcluded(album) ? CommonStyles.markWishIconEnabled.color : CommonStyles.markIconDisabled.color} style={[CommonStyles.markerIconStyle, CollectionManager.isAlbumExcluded(album) ? { fontWeight: 'bold' } : null]} />
            <Text style={[CommonStyles.markerTextStyle, CollectionManager.isAlbumExcluded(album) ? CommonStyles.markWishIconEnabled : CommonStyles.markIconDisabled]}>Ignorer</Text>
          </TouchableOpacity> : null)}

      {isProcessing('read') ? <MarkerLoadingIndicator /> :
        (showAllMarks ?
          <TouchableOpacity onPress={onReadIt} title="" style={CommonStyles.markerStyle}>
            <MaterialCommunityIcons name={(album.FLG_LU == 'O') ? 'book' : 'book-outline'} size={25} color={(album.FLG_LU == 'O') ? CommonStyles.markIconEnabled.color : CommonStyles.markIconDisabled.color} style={CommonStyles.markerIconStyle} />
            <Text style={[CommonStyles.markerTextStyle, (album.FLG_LU == 'O') ? CommonStyles.markIconEnabled : CommonStyles.markIconDisabled]}>Lu</Text>
          </TouchableOpacity> : null)}

      {isProcessing('loan') ? <MarkerLoadingIndicator /> :
        (showAllMarks ?
          <TouchableOpacity onPress={onLendIt} title="" style={CommonStyles.markerStyle}>
            <Ionicons name={(album.FLG_PRET == 'O') ? 'ios-person-add' : 'ios-person-add-outline'} size={25} color={(album.FLG_PRET == 'O') ? CommonStyles.markIconEnabled.color : CommonStyles.markIconDisabled.color} style={CommonStyles.markerIconStyle} />
            <Text style={[CommonStyles.markerTextStyle, (album.FLG_PRET == 'O') ? CommonStyles.markIconEnabled : CommonStyles.markIconDisabled]}>Prêt</Text>
          </TouchableOpacity> : null)}

      {isProcessing('num') ? <MarkerLoadingIndicator /> :
        (showAllMarks ?
          <TouchableOpacity onPress={onNumEd} title="" style={CommonStyles.markerStyle}>
            <MaterialIcons name={(album.FLG_NUM == 'O') ? 'devices' : 'devices'} size={25} color={(album.FLG_NUM == 'O') ? CommonStyles.markIconEnabled.color : CommonStyles.markIconDisabled.color} style={CommonStyles.markerIconStyle} />
            <Text style={[CommonStyles.markerTextStyle, (album.FLG_NUM == 'O') ? CommonStyles.markIconEnabled : CommonStyles.markIconDisabled]}>Ed. Num.</Text>
          </TouchableOpacity> : null)}

      {isProcessing('gift') ? <MarkerLoadingIndicator /> :
        (showAllMarks ?
          <TouchableOpacity onPress={onGift} title="" style={CommonStyles.markerStyle}>
            <MaterialCommunityIcons name={(album.FLG_CADEAU == 'O') ? 'gift' : 'gift-outline'} size={25} color={(album.FLG_CADEAU == 'O') ? CommonStyles.markIconEnabled.color : CommonStyles.markIconDisabled.color} style={CommonStyles.markerIconStyle} />
            <Text style={[CommonStyles.markerTextStyle, (album.FLG_CADEAU == 'O') ? CommonStyles.markIconEnabled : CommonStyles.markIconDisabled]}>Cadeau</Text>
          </TouchableOpacity> : null)}

    </View>);
}
