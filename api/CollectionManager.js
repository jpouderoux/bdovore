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

import AsyncStorage from '@react-native-async-storage/async-storage';

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

    global.showExcludedAlbums = true;
    AsyncStorage.getItem('showExcludedAlbums').then((value) => {
      global.showExcludedAlbums(value != 0);
    }).catch(() => { });
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
    if (callback) {
      callback(result);
    }
  }

  addAlbumToCollection(album, callback = null) {

    // Inform server of the add
    APIManager.updateAlbumInCollection(album.ID_TOME, (result) => {

      if (!result.error) {
        // Remove the album from the wishlist if needed
        album.FLG_ACHAT = 'N';
        Helpers.removeAlbumFromArrayAndDict(album, global.wishlistAlbums, global.wishlistAlbumsDict);
        console.log('album ' + album.ID_TOME + ' added to collection and removed from wishlist');

        // Add the album in local collection
        Helpers.addAlbumToArrayAndDict(album, global.collectionAlbums, global.collectionAlbumsDict);
        album.DATE_AJOUT = Helpers.getNowDateString();

        if (!CollectionManager.getAlbumInCollection(album)) {
          console.error("/!\\ Album added but not found in collection!");
        }

        // Increment the serie's counter
        let idx = Helpers.getSerieIdxInArray(album.ID_SERIE, global.collectionSeriesDict);
        if (idx === null || idx == undefined) {
          console.log('serie ' + album.ID_SERIE + ' not found in collection, let\'s add it');
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


      if (callback) {
        callback(result);
      }

      if (result.error) {
        Helpers.showToast(result.error,
          result.error ?
            'Erreur de connexion au serveur.' :
            'Album ajouté à la collection.');
      }
    }, {
      'id_edition': album.ID_EDITION,
      'flg_achat': 'N'
    });
  }

  removeAlbumFromCollection(album, callback = null) {

    // Remove the album from the collection
    APIManager.deleteAlbumInCollection(album.ID_EDITION, (result) => {
      if (!result.error) {
        Helpers.removeAlbumFromArrayAndDict(album, global.collectionAlbums, global.collectionAlbumsDict);
        console.log('album ' + album.ID_TOME + ' edition ' + album.ID_EDITION + ' removed from the collection');

        if (CollectionManager.isAlbumInCollection(album)) {
          console.error('Album removed but still found in collection!');
        }
        if (Helpers.getAlbumIdxInArray(album, global.collectionAlbumsDict)) {
          console.error('Album removed but still found in collection dict!');
        }

        let idx = Helpers.getSerieIdxInArray(album.ID_SERIE, global.collectionSeriesDict);
        if (idx >= 0) {
          global.collectionSeries[idx].NB_USER_ALBUM--;
          if (global.collectionSeries[idx].NB_USER_ALBUM == 0) {
            Helpers.removeSerieFromArrayAndDict(album.ID_SERIE, global.collectionSeries, global.collectionSeriesDict);
            console.log('serie ' + album.ID_SERIE + ' removed from collection because no more albums owned');
          }
        }
        this.resetAlbumFlags(album);
      }

      if (callback) {
        callback(result);
      }

      if (result.error) {
        Helpers.showToast(result.error,
          result.error ?
            'Erreur de connexion au serveur.' :
            'Album supprimé de la collection.');
      }
    });
  }

  addAlbumToWishlist(album, callback = null) {
    let idx = Helpers.getAlbumIdxInArray(album, global.wishlistAlbumsDict);
    if (idx >= 0) {
      console.log("trying to add an album in wishlist twice!");
      return;
    }
    APIManager.updateAlbumInCollection(album.ID_TOME, (result) => {
      if (!result.error) {
        album.DATE_AJOUT = Helpers.getNowDateString();
        album.FLG_ACHAT = 'O';

        // Add the album to the wishlist with the FLG_ACHAT flag
        Helpers.addAlbumToArrayAndDict(album, global.wishlistAlbums, global.wishlistAlbumsDict);

        console.log('album ' + album.ID_TOME + ' added to the wishlist');
      }

      if (callback) {
        callback(result);
      }

      if (result.error) {
        Helpers.showToast(result.error,
          result.error ?
            'Erreur de connexion au serveur.' :
            'Album ajouté à la wishlist.');
      }
    }, {
      'id_edition': album.ID_EDITION,
      'flg_achat': 'O',
    });
  }

  removeAlbumFromWishlist(album, callback = null) {

    // Delete the album from the server collection
    APIManager.deleteAlbumInCollection(album.ID_EDITION, (result) => {
      if (!result.error) {
        // Remove the album from the wishlist
        album.FLG_ACHAT = 'N';

        Helpers.removeAlbumFromArrayAndDict(album, global.wishlistAlbums, global.wishlistAlbumsDict);
        console.log('album ' + album.ID_TOME + ' removed from the wishlist: ' + this.isAlbumInWishlist(album));
      }

      if (callback) {
        callback(result);
      }

      if (result.error) {
        Helpers.showToast(result.error,
          result.error ?
            'Erreur de connexion au serveur' :
            'Album supprimé de la wishlist.');
      }
    });
  }

  resetAlbumFlags(album) {
    album.FLG_ACHAT = 'N';
    album.FLG_LU = 'N';
    album.FLG_PRET = 'N';
    album.FLG_NUM = 'N';
    album.FLG_CADEAU = 'N';
  }

  setAlbumReadFlag(album, flag, callback = null) {
    album.FLG_LU = flag ? 'O' : 'N';
    this.updateAlbumEdition(album, (result) => {
      if (result.error) {
        album.FLG_LU = flag ? 'N' : 'O';
      }
      if (callback) {
        callback(result);
      }
    });
  }

  setAlbumLendFlag(album, flag, callback = null) {
    album.FLG_PRET = flag ? 'O' : 'N';
    this.updateAlbumEdition(album, (result) => {
      if (result.error) {
        album.FLG_PRET = flag ? 'N' : 'O';
      }
      if (callback) {
        callback(result);
      }
    });
  }

  setAlbumNumEdFlag(album, flag, callback = null) {
    album.FLG_NUM = flag ? 'O' : 'N';
    this.updateAlbumEdition(album, (result) => {
      if (result.error) {
        album.FLG_NUM = flag ? 'N' : 'O';
      }
      if (callback) {
        callback(result);
      }
    });
  };

  setAlbumGiftFlag(album, flag, callback = null) {
    album.FLG_CADEAU = flag ? 'O' : 'N';
    this.updateAlbumEdition(album, (result) => {
      if (result.error) {
        album.FLG_CADEAU = flag ? 'N' : 'O';
      }
      if (callback) {
        callback(result);
      }
    });
  };

  updateAlbumEdition(album, callback = null) {
    APIManager.updateAlbumInCollection(album.ID_TOME, (result) => {
      if (callback) {
        callback(result);
      }
      if (result.error) {
        Helpers.showToast(result.error,
          result.error ?
            'Erreur de connexion au serveur' :
            'Paramètres de l\'album correctement modifiés.');
      }
    }, {
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

  getAlbumInCollection(album) {
    const idx = Helpers.getAlbumIdxInArray(album, global.collectionAlbumsDict);
    return idx >= 0 ? global.collectionAlbums[idx] : null;
  }

  getAlbumInWishlist(album) {
    const idx = Helpers.getAlbumIdxInArray(album, global.wishlistAlbumsDict);
    return idx >= 0 ? global.wishlistAlbums[idx] : null;
  }

  getFirstAlbumEditionOfSerieInCollection(album) {
    let retalb = global.collectionAlbums.find(alb =>
      (alb.ID_SERIE == album.ID_SERIE && alb.ID_TOME == album.ID_TOME));
    if (!retalb) {
      retalb = global.wishlistAlbums.find(alb =>
        (alb.ID_SERIE == album.ID_SERIE && alb.ID_TOME == album.ID_TOME));
      //console.log('Album ' + album.ID_TOME + ' série ' + album.ID_SERIE + ' not found in collection but in wish ? ' + (retalb ? 'true' : 'false'));
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

  isSerieComplete(serie) {
    let idx = Helpers.getSerieIdxInArray(serie.ID_SERIE, global.collectionSeriesDict);
    if (idx >= 0) {
      return serie.NB_ALBUM == global.collectionSeries[idx].NB_USER_ALBUM;
    }
    return false;
  }

  selectOwnAlbum(albumsArray) {
    for (let i = 0; i < albumsArray.length; i++) {
      let album = albumsArray[i];
      albumsArray[i] = this.getFirstAlbumEditionOfSerieInCollection(album);
    }
    return albumsArray;
  }

  refreshAlbumSeries(albumsArray) {
    // For each serie, select the first own album of the serie
    for (let t = 0; t < albumsArray.length; t++) {
      for (let i = 0; i < albumsArray[t].data.length; i++) {
        let album = albumsArray[t].data[i];
        albumsArray[t].data[i] = this.getFirstAlbumEditionOfSerieInCollection(album);
      }
    }
  }

  setSerieExcludeFlag(serie, isExcluded) {
    let idx = Helpers.getSerieIdxInArray(serie.ID_SERIE, global.collectionSeriesDict);
    if (idx >= 0) {
      global.collectionSeries[idx].IS_EXCLU = isExcluded ? '1' : '0';
    }
  }

  isSerieExcluded(serie) {
    let idx = Helpers.getSerieIdxInArray(serie.ID_SERIE, global.collectionSeriesDict);
    if (idx >= 0) {
      return global.collectionSeries[idx].IS_EXCLU == 1;
    }
    return serie.IS_EXCLU == 1;
  }
};

const CollectionManager = new CCollectionManager();

export default CollectionManager;
