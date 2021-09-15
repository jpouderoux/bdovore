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
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

import { CommonStyles, bdovored } from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager'
import * as Helpers from '../api/Helpers';
import CollectionManager from '../api/CollectionManager';
import { Icon } from '../components/Icon';

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
    if (!Helpers.checkConnection()) { return; }

    if (!CollectionManager.isAlbumInCollection(album)) {
      setProcessingBit('own', true);
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
      return;
    }

    const removeCb = () => {
      setProcessingBit('own', true);
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
    };

    if (global.confirmDeletion) {
      Alert.alert(
        album.TITRE_TOME,
        "Voulez-vous vraiment retirer cet album de votre collection ?",
        [{
          text: "Oui",
          onPress: () => removeCb()
        }, {
          text: "Annuler",
          onPress: () => { },
          style: "cancel"
        }],
        { cancelable: true });
    }
    else {
      removeCb();
    }
  };

  const onWantIt = async () => {
    if (!Helpers.checkConnection()) { return; }

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
    if (!Helpers.checkConnection()) { return; }

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
    if (!Helpers.checkConnection()) { return; }

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
    if (!Helpers.checkConnection()) { return; }

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
    if (!Helpers.checkConnection()) { return; }

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
    if (!Helpers.checkConnection()) { return; }

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
    <View style={[CommonStyles.markerStyle]}>
      <ActivityIndicator size="small" color={bdovored} style={CommonStyles.markerIconStyle}/>
      <Text style={CommonStyles.markerTextStyle}>{' '}</Text>
    </View>);

  const Marker = ({ name, iconEnabled, iconDisabled, iconStyle, text, onPressCb, isCheckedCb = () => { }, enabledColor = CommonStyles.markIconEnabled,
    iconCollection = 'MaterialCommunityIcons' }) => {
    return (
      isProcessing(name) ? <MarkerLoadingIndicator /> :
        <TouchableOpacity onPress={onPressCb} title={text} style={CommonStyles.markerStyle}>
          <Icon collection={iconCollection} name={isCheckedCb() ? iconEnabled : iconDisabled} size={25}
            color={isCheckedCb() ? enabledColor.color : CommonStyles.markIconDisabled.color}
            style={[CommonStyles.markerIconStyle, isCheckedCb() ? iconStyle : null]} />
          <Text style={[CommonStyles.markerTextStyle, isCheckedCb() ?
            enabledColor : CommonStyles.markIconDisabled]}>{text}</Text>
        </TouchableOpacity>);
  }

  return (
    <View style={[{ flexDirection: 'row' }, style]}>

      <Marker name='own' iconEnabled='check-bold' iconDisabled='check' text="J'ai" onPressCb={onGotIt}
        isCheckedCb={() => CollectionManager.isAlbumInCollection(album)} />

      {!CollectionManager.isAlbumInCollection(album) ?
      <Marker name='wish' iconEnabled='heart' iconDisabled='heart-outline' text='Je veux' onPressCb={onWantIt}
        isCheckedCb={() => album.FLG_ACHAT == 'O'} enabledColor={CommonStyles.markWishIconEnabled} /> : null}

      {(!CollectionManager.isAlbumInCollection(album) && !CollectionManager.isAlbumInWishlist(album) && showExclude) ?
        <Marker name='excluded' iconEnabled='cancel' iconDisabled='cancel' iconStyle={{ fontWeight: 'bold' }} text='Ignorer' onPressCb={onExcludeIt}
          isCheckedCb={() => CollectionManager.isAlbumExcluded(album)} enabledColor={CommonStyles.markWishIconEnabled} /> : null}

      {showAllMarks ? <View style={[{ flexDirection: 'row' }]}>
        <Marker name='read' iconEnabled='book' iconDisabled='book-outline' text='Lu' onPressCb={onReadIt}
          isCheckedCb={() => album.FLG_LU == 'O'} />

        <Marker name='loan' iconEnabled='ios-person-add' iconDisabled='ios-person-add-outline' text='Prêt' onPressCb={onLendIt}
          isCheckedCb={() => album.FLG_PRET == 'O'} iconCollection='Ionicons' />

        <Marker name='num' iconEnabled='devices' iconDisabled='devices' text='Ed. Num.' onPressCb={onNumEd}
          isCheckedCb={() => album.FLG_NUM == 'O'} />

        <Marker name='gift' iconEnabled='gift' iconDisabled='gift-outline' text='Cadeau' onPressCb={onGift}
          isCheckedCb={() => album.FLG_CADEAU == 'O'} />
      </View> : null}

    </View>);
}
