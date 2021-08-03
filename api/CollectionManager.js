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

  // Fetch all the series within the collection
  fetchSeries(navigation, callback) {
    console.log("fetching series");
    APIManager.fetchCollectionData('Userserie', { navigation: navigation },
      (result) => this.onSeriesFetched(result, callback))
      .then().catch((error) => console.log(error));
  }

  onSeriesFetched(result, callback) {

    console.log("series fetched");
    global.collectionSeries = result.items;

    callback(result);
  }

  // Fetch all the albums within the collection
  fetchAlbums(navigation, callback) {
    APIManager.fetchCollectionData('Useralbum', { navigation: navigation },
      (result) => this.onAlbumsFetched(result, callback))
      .then().catch((error) => console.log(error));
  }

  onAlbumsFetched(result, callback) {

    console.log("albums fetched");

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

    console.log("wishlist fetched");

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

  getAlbunInCollection(album) {

  }

  isAlbumInCollection(album) {
    return Helpers.getAlbumIdxInArray(album, global.collectionAlbumsDict) >= 0;
  }

  isAlbumInWishlist(album) {
    return Helpers.getAlbumIdxInArray(album, global.wishlistAlbumsDict) >= 0;
  }

};

const CollectionManager = new CCollectionManager();

export default CollectionManager;
