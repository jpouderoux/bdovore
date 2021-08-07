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

import AsyncStorage from '@react-native-community/async-storage';

import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';

class CCollectionManager {

  constructor() {
    console.log('init collection manager');
    global.collectionAlbums = [];
    global.collectionAlbumsDict = {};

    global.collectionSeries = [];
    global.collectionSeriesDict = {};

    global.wishlistAlbums = [];
    global.wishlistAlbumsDict = {};
  }

  numberOfSeries() {
    return global.collectionSeries.length;
  }

  numberOfAlbums() {
    return global.collectionAlbums.length;
  }

  numberOfWishAlbums() {
    return global.wishlistAlbums.length;
  }

  // Fetch all the series within the collection
  fetchSeries(navigation, callback) {

    global.collectionSeries = [];
    global.collectionSeriesDict = {};

    APIManager.fetchCollectionData('Userserie', { navigation: navigation },
      (result) => this.onSeriesFetched(result, callback))
      .then().catch((error) => console.log(error));
  }

  onSeriesFetched(result, callback) {

    console.log(result.items.length + ' series fetched');
    global.collectionSeries = result.items;
    global.collectionSeriesDict = {};
    Helpers.createSeriesDict(global.collectionSeries, global.collectionSeriesDict);

    callback(result);
  }

  // Fetch all the albums within the collection
  fetchAlbums(navigation, callback) {

    global.collectionAlbums = [];
    global.collectionAlbumsDict = {};

    APIManager.fetchCollectionData('Useralbum', { navigation: navigation },
      (result) => this.onAlbumsFetched(result, callback))
      .then().catch((error) => console.log(error));
  }

  onAlbumsFetched(result, callback) {

    console.log(result.items.length + ' albums fetched');

    // Save albums in global scope
    global.collectionAlbums = result.items;
    // Create an album dictionary [{ID_TOME, ID_EDITION}=>index_in_collection]
    global.collectionAlbumsDict = {};
    Helpers.createAlbumDict(global.collectionAlbums, global.collectionAlbumsDict);

    /*AsyncStorage.multiSet([
      [ 'collectionAlbums', JSON.stringify(result.items) ],
      [ 'collecFetched', (result.error === null) ? 'true' : 'false' ]], ()=>{});*/

    callback(result);
  }

  // Fetch the wishlist collection
  fetchWishlist(navigation, callback) {
    APIManager.fetchWishlist({ navigation: navigation }, (result) =>
      this.onWishlistFetched(result, callback))
      .then().catch((error) => console.log(error));
  }

  onWishlistFetched(result, callback) {

    console.log(result.items.length + ' albums in wishlist fetched');

    global.wishlistAlbums = result.items;
    global.wishlistAlbumsDict = {};
    Helpers.createAlbumDict(global.wishlistAlbums, global.wishlistAlbumsDict);

    callback(result);
  }

  // Fetch all editions from a given album
  fetchAlbumEditions(album, callback) {
    APIManager.fetchAlbumEditions(album.ID_TOME, (result) =>
      this.onAlbumEditionsFetched(result, callback));
  }

  onAlbumEditionsFetched(result, callback) {
    callback(result);
  }

  addAlbumToCollection(album) {
    // Inform server of the add
    APIManager.updateAlbumInCollection(album.ID_TOME, () => { }, {
      'id_edition': album.ID_EDITION,
      'flg_achat': 'N'
    });

    // Remove the album from the wishlist if needed
    Helpers.removeAlbumFromArrayAndDict(album, global.wishlistAlbums, global.wishlistAlbumsDict);
    console.log('album ' + album.ID_TOME + ' added to collection and removed from wishlist');
    album.FLG_ACHAT = 'N';

    // Add the album in local collection and increment the serie's counter
    Helpers.addAlbumToArrayAndDict(album, global.collectionAlbums, global.collectionAlbumsDict);
    album.DATE_AJOUT = Helpers.getNowDateString();

    let idx = Helpers.getSerieIdxInArray(album.ID_SERIE, global.collectionSeriesDict);
    if (idx === null || idx == undefined) {
      console.log('serie '+ album.ID_SERIE + ' not found in collection, let\'s add it');
      APIManager.fetchSerie(album.ID_SERIE, (result) => {
        if (result.error == '') {
          const serie = result.items[0];
          const idx = Helpers.addSerieToArrayAndDict(serie, global.collectionSeries, global.collectionSeriesDict);
          global.collectionSeries[idx].NB_USER_ALBUM = 1;
          console.log('serie ' + album.ID_SERIE + ' added to collection');
        }
      });
    } else {
      global.collectionSeries[idx].NB_USER_ALBUM++;
    }
  }

  removeAlbumFromCollection(album) {

    // Remove the album from the collection
    APIManager.deleteAlbumInCollection(album.ID_EDITION, () => { });

    Helpers.removeAlbumFromArrayAndDict(album, global.collectionAlbums, global.collectionAlbumsDict);
    console.log('album ' + album.ID_TOME + ' removed from the collection');

    let idx = Helpers.getSerieIdxInArray(album.ID_SERIE, global.collectionSeriesDict);
    if (idx >= 0) {
      global.collectionSeries[idx].NB_USER_ALBUM--;
      if (global.collectionSeries[idx].NB_USER_ALBUM == 0) {
        Helpers.removeSerieFromArrayAndDict(album.ID_SERIE, global.collectionSeries, global.collectionSeriesDict);
        console.log('serie ' + album.ID_SERIE + ' removed from collection because no more albums owned');
      }
    }
  }

  addAlbumToWishlist(album) {
    APIManager.updateAlbumInCollection(album.ID_TOME, () => { }, {
      'id_edition': album.ID_EDITION,
      'flg_achat': 'O',
    });

    album.DATE_AJOUT = Helpers.getNowDateString();
    album.FLG_ACHAT = 'O';

    // Add the album to the wishlist with the FLG_ACHAT flag
    Helpers.addAlbumToArrayAndDict(album, global.wishlistAlbums, global.wishlistAlbumsDict);

    console.log('album ' + album.ID_TOME + ' added to the wishlist');
  }

  removeAlbumFromWishlist(album) {

    album.FLG_ACHAT = 'N';

    // Delete the album from the server collection
    APIManager.deleteAlbumInCollection(album.ID_EDITION, () => { });

    // Remove the album from the collection
    Helpers.removeAlbumFromArrayAndDict(album, global.wishlistAlbums, global.wishlistAlbumsDict);

    console.log('album ' + album.ID_TOME + ' removed from the wishlist: ' + this.isAlbumInWishlist(album));
  }

  resetAlbumFlags(album) {
    album.FLG_ACHAT = 'N';
    album.FLG_LU = 'N';
    album.FLG_PRET = 'N';
    album.FLG_NUM = 'N';
    album.FLG_CADEAU = 'N';
  }

  setAlbumReadFlag(album, flag) {
    album.FLG_LU = flag ? 'O' : 'N';
    this.updateAlbumEdition(album);
  }

  setAlbumLendFlag(album, flag) {
    album.FLG_PRET = flag ? 'O' : 'N';
    this.updateAlbumEdition(album);
  }

  setAlbumNumEdFlag(album, flag) {
    album.FLG_NUM = flag ? 'O' : 'N';
    this.updateAlbumEdition(album);
  };

  setAlbumGiftFlag(album, flag) {
    album.FLG_CADEAU = flag ? 'O' : 'N';
    this.updateAlbumEdition(album);
  };

  updateAlbumEdition(album) {
    APIManager.updateAlbumInCollection(album.ID_TOME, () => { }, {
      'id_edition': album.ID_EDITION,
      'flg_achat': 'N',
      'flg_lu': album.FLG_LU ? album.FLG_LU : 'N',
      'flg_cadeau': album.FLG_CADEAU ? album.FLG_CADEAU : 'N',
      'flg_pret': album.FLG_PRET ? album.FLG_PRET : 'N',
      'flg_num': album.FLG_NUM ? album.FLG_NUM : 'N',
    });
  }

  isAlbumInCollection(album) {
    return Helpers.getAlbumIdxInArray(album, global.collectionAlbumsDict) >= 0;
  }

  isAlbumInWishlist(album) {
    return Helpers.getAlbumIdxInArray(album, global.wishlistAlbumsDict) >= 0;
  }

  getFirstAlbumEditionOfSerieInCollection(album) {
    let retalb = global.collectionAlbums.find(alb =>
      (alb.ID_SERIE == album.ID_SERIE && alb.ID_TOME == album.ID_TOME));
    if (!retalb) {
      retalb = global.wishlistAlbums.find(alb =>
      (alb.ID_SERIE == album.ID_SERIE && alb.ID_TOME == album.ID_TOME));
      console.log('Album ' + album.ID_TOME + ' série ' + album.ID_SERIE + ' not found in collection but in wish ? ' + (retalb ? 'true' : 'false'));
    }
    return retalb ? retalb : album;
  }

  getNbOfUserAlbumsInSerie(serie) {
    let count = 0;
    global.collectionAlbums.forEach(album => {
      if (album.ID_SERIE == serie.ID_SERIE) {
        count++;
      }
    });
    return count;
  }

};

const CollectionManager = new CCollectionManager();

export default CollectionManager;
