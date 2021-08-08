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

import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Helpers from '../api/Helpers';
import CollectionManager from '../api/CollectionManager';


export function CollectionMarkers({ item, style, reduceMode }) {

  const [showAllMarks, setShowAllMarks] = useState(false);
  const [album, setAlbum] = useState(item);
  const [isOwn, setIsOwn] = useState(false);
  const [isWanted, setIsWanted] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isLoan, setIsLoan] = useState(false);
  const [isNum, setIsNum] = useState(false);
  const [isGift, setIsGift] = useState(false);

  const refresh = () => {

    const isInCollec = CollectionManager.isAlbumInCollection(album);
    setShowAllMarks(reduceMode ? false : isInCollec);
    const idx = Helpers.getAlbumIdxInArray(album, global.wishlistAlbumsDict);
    let alb;
    if (idx >= 0) {
      alb = global.wishlistAlbums[idx];
      setIsOwn(false);
      console.log('Album ' + alb.ID_TOME + ' série ' + alb.ID_SERIE + ' edition ' + alb.ID_EDITION + ' found in wishlist');
      console.log(' with flag: ' + alb.FLG_ACHAT);
    } else {
      const idx = Helpers.getAlbumIdxInArray(album, global.collectionAlbumsDict);
      if (idx >= 0) {
        alb = global.collectionAlbums[idx];
        setIsOwn(true);
        console.log('Album ' + alb.ID_TOME + ' série ' + alb.ID_SERIE + ' edition ' + alb.ID_EDITION + ' found in collection');
      } else {
        alb = item;
        setIsOwn(false);
        console.log('Album ' + alb.ID_TOME + ' série ' + alb.ID_SERIE + ' edition ' + alb.ID_EDITION + ' not found in collection or wishlist');
        CollectionManager.resetAlbumFlags(alb);
      }
    }
    setIsWanted(alb.FLG_ACHAT == 'O');
    setIsRead(alb.FLG_LU == 'O');
    setIsLoan(alb.FLG_PRET == 'O');
    setIsNum(alb.FLG_NUM == 'O');
    setIsGift(alb.FLG_CADEAU == 'O');
    setAlbum(alb);
  }

  useEffect(() => {
    refresh();
  }, []);

  const onGotIt = async () => {
    if (!CollectionManager.isAlbumInCollection(album)) {
      // If album is not collection yet, let's add it
      setIsOwn(true);
      setIsWanted(false);
      setShowAllMarks(reduceMode ? false : true);

      // Add album to collection & remove it from the wishlist
      CollectionManager.addAlbumToCollection(album);
    }
    else {
      // Album is in collection, let's remove it
      setIsOwn(false);
      setIsWanted(false);
      setShowAllMarks(false);

      CollectionManager.removeAlbumFromCollection(album);
    }
  };

  const onWantIt = async () => {
    // Switch the want it flag
    const wantIt = !(album.FLG_ACHAT === 'O');
    setIsWanted(wantIt);
    album.FLG_ACHAT = wantIt ? 'O' : 'N';
    console.log("flag: "  + album.FLG_ACHAT);
    if (wantIt) {
      CollectionManager.addAlbumToWishlist(album);
    }
    else {
      CollectionManager.removeAlbumFromWishlist(album);
    }
  };

  const onReadIt = async () => {
    const readIt = !(album.FLG_LU == 'O');
    setIsRead(readIt);
    CollectionManager.setAlbumReadFlag(album, readIt);
  };

  const onLendIt = async () => {
    const lendIt = !(album.FLG_PRET == 'O');
    setIsLoan(lendIt);
    CollectionManager.setAlbumLendFlag(album, lendIt);
  };

  const onNumEd = async () => {
    const numEd = !(album.FLG_NUM == 'O');
    CollectionManager.setAlbumNumEdFlag(album, numEd);
  };

  const onGift = async () => {
    const gift = !(album.FLG_CADEAU == 'O');
    setIsGift(gift);
    CollectionManager.setAlbumGiftFlag(album, gift);
  };

  return (
    <View style={[styles.viewStyle, style]}>

      <TouchableOpacity onPress={onGotIt} title="" style={styles.markerStyle}>
        <MaterialCommunityIcons name={CollectionManager.isAlbumInCollection(album) ? 'check-bold' : 'check'} size={25} color={CollectionManager.isAlbumInCollection(album) ? 'green' : 'black'} style={styles.iconStyle} />
        <Text style={[styles.textStyle, { color: ((isOwn || CollectionManager.isAlbumInCollection(album)) ? 'green' : 'black') }]}>J'ai</Text>
      </TouchableOpacity>

      {!CollectionManager.isAlbumInCollection(album) ?
        <TouchableOpacity onPress={onWantIt} title="" style={styles.markerStyle}>
          <MaterialCommunityIcons name={(isWanted || album.FLG_ACHAT === 'O') ? 'heart' : 'heart-outline'} size={25} color={album.FLG_ACHAT === 'O' ? 'red' : 'black'} style={styles.iconStyle} />
          <Text style={[styles.textStyle, { color: (album.FLG_ACHAT === 'O' ? 'red' : 'black') }]}>Je veux</Text>
        </TouchableOpacity> : null}

      {showAllMarks ?
        <TouchableOpacity onPress={onReadIt} title="" style={styles.markerStyle}>
          <MaterialCommunityIcons name={isRead || album.FLG_LU == 'O' ? 'book' : 'book-outline'} size={25} color={album.FLG_LU == 'O' ? 'green' : 'black'} style={styles.iconStyle} />
          <Text style={[styles.textStyle, { color: (album.FLG_LU == 'O' ? 'green' : 'black') }]}>Lu</Text>
        </TouchableOpacity> : null}

      {showAllMarks ?
        <TouchableOpacity onPress={onLendIt} title="" style={styles.markerStyle}>
          <Ionicons name={isLoan || album.FLG_PRET == 'O' ? 'ios-person-add' : 'ios-person-add-outline'} size={25} color={album.FLG_PRET == 'O' ? 'green' : 'black'} style={styles.iconStyle} />
          <Text style={[styles.textStyle, { color: (album.FLG_PRET == 'O' ? 'green' : 'black') }]}>Prêt</Text>
        </TouchableOpacity> : null}

      {showAllMarks ?
        <TouchableOpacity onPress={onNumEd} title="" style={styles.markerStyle}>
          <MaterialIcons name={isNum && album.FLG_NUM == 'O' ? 'devices' : 'devices'} size={25} color={album.FLG_NUM == 'O' ? 'green' : 'black'} style={styles.iconStyle} />
          <Text style={[styles.textStyle, { color: (album.FLG_NUM == 'O' ? 'green' : 'black') }]}>Ed. Num.</Text>
        </TouchableOpacity> : null}

      {showAllMarks ?
        <TouchableOpacity onPress={onGift} title="" style={styles.markerStyle}>
          <MaterialCommunityIcons name={isGift && album.FLG_CADEAU == 'O' ? 'gift' : 'gift-outline'} size={25} color={album.FLG_CADEAU == 'O' ? 'green' : 'black'} style={styles.iconStyle} />
          <Text style={[styles.textStyle, { color: (album.FLG_CADEAU == 'O' ? 'green' : 'black') }]}>Cadeau</Text>
        </TouchableOpacity> : null}

    </View>);
}

const styles = EStyleSheet.create({
  viewStyle: {
    flexDirection: 'row',
  },
  markerStyle: {
    alignItems: 'center',
    alignContent: 'center',
    padding: 8,
  },
  iconStyle: {
    textAlign: 'center',
    paddingTop: 3,
    borderWidth: 0.5,
    borderColor: 'lightgrey',
    paddingLeft: 2,
    width: 32,
    height: 32
  },
  textStyle: {
    fontSize: 9,
  }
});
