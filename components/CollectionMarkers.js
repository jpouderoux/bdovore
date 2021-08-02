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

import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';


export function CollectionMarkers({ item, style, reduceMode }) {

  const [gotIt, setGotIt] = useState(false);
  const [wantIt, setWantIt] = useState(false);
  const [readIt, setReadIt] = useState(false);
  const [lendIt, setLendIt] = useState(false);
  const [numEd, setNumEd] = useState(false);
  const [gift, setGift] = useState(false);
  const [showAllMarks, setShowAllMarks] = useState(false);
  const [album, setAlbum] = useState(null);
  const [idTome, setIdTome] = useState(0);
  let cachedIdTome = 0;

  useEffect(() => {
    if (cachedIdTome != item.ID_TOME) {
      //console.log("NEW TOME");
      //console.log(item);
      cachedIdTome = item.ID_TOME;
      setIdTome(item.ID_TOME);
    }
    const isInCollec = Helpers.getAlbumIdxInArray(item, global.collectionAlbumsDict) >= 0;
    setGotIt(isInCollec);
    setShowAllMarks(reduceMode ? false : isInCollec);
  }, []);

  useEffect(() => {
    let alb = item;
    let isInCollec = false;
    const idx = Helpers.getAlbumIdxInArray(item, global.wishlistAlbumsDict);
    if (idx >= 0) {
      alb = global.wishlistAlbums[idx];
      console.log("Album found in wishlist");
    } //else
    {
      const idx = Helpers.getAlbumIdxInArray(item, global.collectionAlbumsDict);
      if (idx >= 0) {
        isInCollec = true;
        alb = global.collectionAlbums[idx];
        console.log("Album found in collection");
      }
    }
    if (!alb) { alb = item; }
    //console.log(alb);
    setGotIt(isInCollec);
    setWantIt(alb.FLG_ACHAT === 'O');
    setReadIt(alb.FLG_LU ==='O');
    setLendIt(alb.FLG_PRET === 'O');
    setNumEd(alb.FLG_NUM === 'O');
    setGift(alb.FLG_CADEAU === 'O');
    setAlbum(alb);
  }, [idTome]);

  const onGotIt = async () => {
    const idxCol = Helpers.getAlbumIdxInArray(album, global.collectionAlbumsDict);
    if (!idxCol) {
      // If album is in not collection yet, let's add it
      setGotIt(true);
      setShowAllMarks(reduceMode ? false : true);
      APIManager.updateAlbumInCollection(album.ID_TOME, () => { }, {
        'id_edition': album.ID_EDITION,
        'flg_achat': 'N'
      });
      // Add album to collection & remove it from the wishlist
      Helpers.addAlbumToArrayAndDict(album, global.collectionAlbums, global.collectionAlbumsDict);
      Helpers.removeAlbumFromArrayAndDict(album, global.wishlistAlbums, global.wishlistAlbumsDict);
      console.log("album remove " + album.TOME + " from wishlist");
      console.log(wishlistAlbums);
    }
    else {
      setGotIt(false);
      setShowAllMarks(false);
      // If album is marked "I want" it wishlist, do not remove it from the collection
      const idx = Helpers.getAlbumIdxInArray(album, global.wishlistAlbumsDict);
      if (!idx || (global.wishlistAlbums[idx].FLG_ACHAT != 'N')) {
        APIManager.deleteAlbumInCollection(album.ID_EDITION, () => { });
      }
      // Remove the album from the collection
      Helpers.removeAlbumFromArrayAndDict(album, global.collectionAlbums, global.collectionAlbumsDict);
    }
  };

  const onWantIt = async () => {
    // Switch the want it flag
    const wantIt = !(album.FLG_ACHAT && album.FLG_ACHAT != 'N');
    album.FLG_ACHAT = wantIt ? 'O' : 'N';
    setWantIt(wantIt);
    if (wantIt) {
      APIManager.updateAlbumInCollection(album.ID_TOME, () => { }, {
        'id_edition': album.ID_EDITION,
        'flg_achat': 'O',
      });

      console.log(Helpers.getNowDateString());
      album.DATE_AJOUT = Helpers.getNowDateString();

      // Add the album to the wishlist with the FLG_ACHAT flag
      Helpers.addAlbumToArrayAndDict(album, global.wishlistAlbums, global.wishlistAlbumsDict);
    }
    else {
      // Mark the album as not wanted (FLG_ACHAT='N')
      const idx = Helpers.getAlbumIdxInArray(album, global.wishlistAlbumsDict);
      if (idx) {
        global.wishlistAlbums[idx].FLG_ACHAT = 'N';
      }
      // Delete the album from the server collection if it is in our client side collection copy
      const idxCol = Helpers.getAlbumIdxInArray(album, global.collectionAlbumsDict);
      if (!idxCol) {
        APIManager.deleteAlbumInCollection(album.ID_EDITION, () => { });
      }
      // Remove the album from the collection
      Helpers.removeAlbumFromArrayAndDict(album, global.wishlistAlbums, global.wishlistAlbumsDict);
    }
  };

  const onReadIt = async () => {
    const readIt = !(album.FLG_LU && album.FLG_LU != 'N');
    album.FLG_LU = readIt ? 'O' : 'N';
    setReadIt(readIt);
    updateAlbumEdition(album);
  };

  const onLendIt = async () => {
    const lendIt = !(album.FLG_PRET && album.FLG_PRET != 'N');
    album.FLG_PRET = lendIt ? 'O' : 'N';
    setLendIt(lendIt);
    updateAlbumEdition(album);
  };

  const onNumEd = async () => {
    const numEd = !(album.FLG_NUM && album.FLG_NUM != 'N');
    album.FLG_NUM = numEd ? 'O' : 'N';
    setNumEd(numEd);
    updateAlbumEdition(album);
  };

  const onGift = async () => {
    const gift = !(album.FLG_CADEAU && album.FLG_CADEAU != 'N');
    album.FLG_CADEAU = gift ? 'O' : 'N';
    setGift(gift);
    updateAlbumEdition(album);
  };

  const updateAlbumEdition = () => {
    APIManager.updateAlbumInCollection(album.ID_TOME, () => { }, {
      'id_edition': album.ID_EDITION,
      'flg_achat': 'N',
      'flg_lu': album.FLG_LU,
      'flg_cadeau': album.FLG_CADEAU,
      'flg_pret': album.FLG_PRET,
      'flg_num': album.FLG_NUM,
    });
  }

  return (
    <View style={[styles.viewStyle, style]}>

      <TouchableOpacity onPress={onGotIt} title="" style={styles.markerStyle}>
        <MaterialCommunityIcons name={gotIt ? 'check-bold' : 'check'} size={25} color={gotIt ? 'green' : 'black'} style={styles.iconStyle} />
        <Text style={[styles.textStyle, { color: (gotIt ? 'green' : 'black') }]}>J'ai</Text>
      </TouchableOpacity>

      {!gotIt ?
        <TouchableOpacity onPress={onWantIt} title="" style={styles.markerStyle}>
          <MaterialCommunityIcons name={wantIt ? 'heart' : 'heart-outline'} size={25} color={wantIt ? 'red' : 'black'} style={styles.iconStyle} />
          <Text style={[styles.textStyle, { color: (wantIt ? 'red' : 'black') }]}>Je veux</Text>
        </TouchableOpacity> : null}

      {showAllMarks ?
        <TouchableOpacity onPress={onReadIt} title="" style={styles.markerStyle}>
          <MaterialCommunityIcons name={readIt ? 'book' : 'book-outline'} size={25} color={readIt ? 'green' : 'black'} style={styles.iconStyle} />
          <Text style={[styles.textStyle, { color: (readIt ? 'green' : 'black') }]}>Lu</Text>
        </TouchableOpacity> : null}

      {showAllMarks ?
        <TouchableOpacity onPress={onLendIt} title="" style={styles.markerStyle}>
          <Ionicons name={lendIt ? 'ios-person-add' : 'ios-person-add-outline'} size={25} color={lendIt ? 'green' : 'black'} style={styles.iconStyle} />
          <Text style={[styles.textStyle, { color: (lendIt ? 'green' : 'black') }]}>Prêt</Text>
        </TouchableOpacity> : null}

      {showAllMarks ?
        <TouchableOpacity onPress={onNumEd} title="" style={styles.markerStyle}>
          <MaterialIcons name={numEd ? 'devices' : 'devices'} size={25} color={numEd ? 'green' : 'black'} style={styles.iconStyle} />
          <Text style={[styles.textStyle, { color: (numEd ? 'green' : 'black') }]}>Ed. Num.</Text>
        </TouchableOpacity> : null}

      {showAllMarks ?
        <TouchableOpacity onPress={onGift} title="" style={styles.markerStyle}>
          <MaterialCommunityIcons name={gift ? 'gift' : 'gift-outline'} size={25} color={gift ? 'green' : 'black'} style={styles.iconStyle} />
          <Text style={[styles.textStyle, { color: (gift ? 'green' : 'black') }]}>Cadeau</Text>
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