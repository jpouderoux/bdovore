import AsyncStorage from '@react-native-community/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

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
    APIManager.fetchCollectionData('Userserie', { navigation: navigation }, (result) => this.onSeriesFetched(result, callback))
      .then().catch((error) => console.log(error));
  }

  onSeriesFetched(result, callback) {

    console.log("series fetched");

    callback(result);
  }

  // Fetch all the albums within the collection
  fetchAlbums(navigation, callback) {
    APIManager.fetchCollectionData('Useralbum', { navigation: navigation }, (result) => this.onAlbumsFetched(result, callback))
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
    APIManager.fetchWishlist({ navigation: navigation }, (result) => this.onWishlistFetched(result, callback))
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
    APIManager.fetchAlbumEditions(album.ID_TOME, (result) => this.onAlbumEditionsFetched(result, callback));
  }

  onAlbumEditionsFetched(result, callback) {
    callback(result);
  }

};

const CollectionManager = new CCollectionManager();

export default CollectionManager;
