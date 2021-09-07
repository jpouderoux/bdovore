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

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';

const Realm = require('realm');

const AlbumSchema =
{
  _id: 'int',
  DATE_ACHAT: 'string?',
  DATE_AJOUT: 'string?',
  DTE_PARUTION: 'string?',
  EAN_EDITION: 'string?',
  EMAIL_PRET: 'string?',
  FLG_ACHAT: 'string?',
  FLG_CADEAU: 'string?',
  FLG_DEDICACE: 'string?',
  FLG_FINI: 'string?',
  FLG_INT_TOME: 'string?',
  FLG_LU: 'string?',
  FLG_NUM: 'string?',
  FLG_PRET: 'string?',
  FLG_TETE: 'string?',
  FLG_TYPE_TOME: 'string?',
  HISTOIRE_TOME: 'string?',
  ID_COLLECTION: 'int?',
  ID_COLOR: 'int?',
  ID_COLOR_ALT: 'int?',
  ID_DESSIN: 'string?',
  ID_DESSIN_ALT: 'int?',
  ID_EDITEUR: 'int?',
  ID_EDITION: 'int',
  ID_GENRE: 'int?',
  ID_SCENAR: 'int?',
  ID_SCENAR_ALT: 'int?',
  ID_SERIE: 'int',
  ID_TOME: 'int',
  IMG_COUV: 'string?',
  ISBN_EDITION: 'string?',
  MOYENNE_NOTE_TOME: 'string?',
  NB_NOTE_TOME: 'int?',
  NBR_USER_ID_TOME: 'int?',
  NOM_COLLECTION: 'string?',
  NOM_EDITEUR: 'string?',
  NOM_EDITION: 'string?',
  NOM_GENRE: 'string?',
  NOM_PRET: 'string?',
  NOM_SERIE: 'string?',
  NUM_TOME: 'string?',
  ORIGINE: 'string?',
  PRIX_BDNET: 'string?',
  TITRE_TOME: 'string?',
  USER_ID: 'string?',
  annee_achat: 'string?',
  coapseudo: 'string?',
  comment: 'string?',
  copseudo: 'string?',
  cote: 'string?',
  deapseudo: 'string?',
  depseudo: 'string?',
  mois_achat: 'string?',
  scapseudo: 'string?',
  scpseudo: 'string?',
  IS_EXCLU: 'int?',
};

const SerieSchema = {
  _id: 'int',
  FLG_FINI_SERIE: 'string?',
  HISTOIRE_SERIE: 'string?',
  ID_GENRE: 'int?',
  ID_SERIE: 'int',
  IMG_COUV_SERIE: 'string?',
  IS_EXCLU: 'int?',
  LIB_FLG_FINI_SERIE: 'string?',
  NB_ALBUM: 'int?',
  NB_NOTE_SERIE: 'int?',
  NB_TOME: 'int?',
  NB_TOME_FINAL: 'int?',
  NB_USER_ALBUM: 'int?',
  NOM_GENRE: 'string?',
  NOM_SERIE: 'string?',
  NOTE_SERIE: 'string?',
  ORIGINE: 'string?',
  TRI_SERIE: 'string?',
};

function createEntry(schema, item) {
  let album = {};
  for (const [key, value] of Object.entries(item)) {
    try {
      if (value != null && key in schema) {
        const keytype = schema[key] ?? '';
        if (keytype.startsWith('int')) {
          if (value == true) {
            album[key] = 1;
          } if (value == false) {
            album[key] = 0;
          } else {
            album[key] = isNaN(parseInt(value)) ? 0 : parseInt(value);
          }
        } else if (keytype.startsWith('float')) {
          album[key] = parseFloat(value);
        } else if (keytype.startsWith('string')) {
          album[key] = value;
        } else {
          //console.debug('Unknown type (' + keytype + ') for key ' + key);
        }
      }
      else {
        //console.debug('skip ' + key+ ' = ' + value);
      }
    }
    catch (error) {
      console.debug(error);
    }
  }
  if (album.ID_EDITION && album.ID_TOME) {
    album['_id'] = Helpers.makeAlbumUID(item);
  } else if (schema == SerieSchema) {
    album['_id'] = parseInt(item.ID_SERIE);
  }
  return album;
}

class CCollectionManager {

  CollectionTypes = {
    0: 'série',
    1: 'album',
  };

  CollectionGenres = {
    0: ['Tout', '', ''],
    1: ['BD', ' BD', ' BD'],
    2: ['Mangas', ' manga', ' mangas'],
    3: ['Comics', ' comic', ' comics'],
  };

  constructor() {
    global.db = null;

    this.release();
    this.initialize();
  }

  release() {
    if (global.db) {
      global.db.close();
      global.db = null;
    }
  }

  initialize() {
    console.debug('init collection manager');

    this.initializeSettings();

    this.initializeDatabase();
  }

  initializeSettings() {
    global.collectionManquantsUpdated = false;

    global.showExcludedAlbums = true;
    AsyncStorage.getItem('showExcludedAlbums').then((value) => {
      global.showExcludedAlbums(value != '0');
    }).catch(() => { });

    global.imageOnWifi = false;
    AsyncStorage.getItem('imageOnWifi').then((value) => {
      global.imageOnWifi(value != '0');
    }).catch(() => { });

    global.hideSponsoredLinks = true;
    /*if (Platform.OS != 'ios')*/ {
      global.hideSponsoredLinks = false;
      AsyncStorage.getItem('hideSponsoredLinks').then((value) => {
        global.hideSponsoredLinks(value != '0');
      }).catch(() => { });
    }

    global.verbose = true;
    AsyncStorage.getItem('verbose').then((value) => {
      global.verbose(value != '0');
    }).catch(() => { });
  }

  resetDatabase() {
    console.debug('/!\\ Database reset!!!!!');
    if (global.verbose) {
      Helpers.showToast(true, 'Réinitilisation de la base de données');
    }
    Realm.deleteFile({}); // TODO: Remove - Delete the database (schema+data)!
    this.initializeDatabase();
  }

  initializeDatabase(reentry = false) {
    this.release();
    try {
      Realm.open({
        schema: [
          { name: 'Albums', primaryKey: '_id', properties: AlbumSchema },
          { name: 'Series', primaryKey: '_id', properties: SerieSchema },
          { name: 'Wishes', primaryKey: '_id', properties: AlbumSchema }]
      }).then(realm => {
        global.db = realm;
        console.debug('db initialized');
      }).catch(error => {
        console.debug(error);
        if (!reentry) {
          this.resetDatabase();
          this.initializeDatabase(true);
        }
      });
    } catch (error) {
      console.debug(error);
      if (!reentry) {
        this.resetDatabase();
        this.initializeDatabase(true);
      }
    }
  }

  filterByOrigine(items, origine) {
    return origine > 0 ? items.filtered("ORIGINE == $0 || NOM_GENRE CONTAINS[c] $0", this.CollectionGenres[origine][0]) : items;
  }

  getAlbums(origine = 0) {
    return this.filterByOrigine(global.db.objects('Albums'), origine);
  }

  getAlbumsInSerie(id_serie) {
    return this.getAlbums().filtered("ID_SERIE == $0", parseInt(id_serie));
  }

  getSeries(origine = 0) {
    return this.filterByOrigine(global.db.objects('Series'), origine);
  }

  getWishes(origine = 0) {
    return this.filterByOrigine(global.db.objects('Wishes'), origine);
  }

  numberOfSeries(origine = 0) {
    return this.getSeries(origine).length;
  }

  numberOfAlbums(origine = 0) {
    return this.getAlbums(origine).length;
  }

  numberOfWishAlbums(origine = 0) {
    return this.getWishes(origine).length;
  }

  isCollectionEmpty(origine = 0) {
    return this.numberOfAlbums(origine) == 0;
  }

  // Fetch all the series within the collection
  fetchSeries(navigation, callback) {

    if (global.isConnected) {
      APIManager.fetchCollectionData('Userserie', { navigation: navigation },
        (result) => this.onSeriesFetched(result, callback, false))
        .then().catch((error) => console.debug(error));
    } else {
      this.onSeriesFetched({ done: true, items: this.getSeries() }, callback, true);
    }
  }

  onSeriesFetched(result, callback, isOffline) {

    console.debug(result.items.length + ' series fetched');

    if (!isOffline) {
      result.items.forEach(item => {
        try {
          global.db.write(() => {
            global.db.create('Series', createEntry(SerieSchema, item));
          });
        }
        catch (error) {
          //console.log(error);
        }
      });
    }

    callback(result);
  }

  // Fetch all the albums within the collection
  fetchAlbums(navigation, callback) {

    if (global.isConnected) {
      APIManager.fetchCollectionData('Useralbum', { navigation: navigation },
        (result) => this.onAlbumsFetched(result, callback, false))
        .then().catch((error) => console.debug(error));
    } else {
      this.onAlbumsFetched({ done: true, items: this.getAlbums() }, callback, true);
    }
  }

  onAlbumsFetched(result, callback, isOffline) {

    console.debug(result.items.length + ' albums fetched');
    if (!isOffline) {
      result.items.forEach(item => {
        try {
          global.db.write(() => {
            global.db.create('Albums', createEntry(AlbumSchema, item));
          });
        } catch (error) {
          //console.log(error);
        }
      });
    }

    callback(result);
  }

  // Fetch the wishlist collection
  fetchWishlist(navigation, callback, isOffline = false) {

    if (global.isConnected) {
      APIManager.fetchWishlist({ navigation: navigation }, (result) =>
        this.onWishlistFetched(result, callback, false))
        .then().catch((error) => console.debug(error));
    } else {
      this.onWishlistFetched({ done: true, items: this.getWishes() }, callback, true);
    }
  }

  onWishlistFetched(result, callback, isOffline) {

    console.debug(result.items.length + ' albums in wishlist fetched');

    result.items.forEach(item => {
      try {
        global.db.write(() => {
          global.db.create('Wishes', createEntry(AlbumSchema, item));
        });
      } catch (error) {
      }
    });

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

  getAlbumType(album) {
    if (album.FLG_TYPE_TOME == 1 || album.TITRE_TOME.startsWith('Pack ')) {
      return 2; // Coffret
    }
    if (album.FLG_INT_TOME == 'O') {
      return 1; // Intégrale
    }
    if (album.TITRE_TOME.endsWith('TL') || album.TITRE_TOME.endsWith('TT')
      || album.TITRE_TOME.includes('(TL)') || album.TITRE_TOME.includes('(TT)')) {
      return 3; // Edition spéciale
    }
    return 0; // Album
  }

  addSerieToCollection(serie, serieAlbums, callback) {
    APIManager.addSerieInCollection(serie.ID_SERIE, (result) => {
      try {
        if (!result.error) {

          global.db.write(() => {
            serieAlbums.forEach((album) => {
              // Add the album in local collection
              album.FLG_ACHAT = 'N';
              album.DATE_AJOUT = Helpers.getNowDateString();
              global.db.create('Albums', createEntry(AlbumSchema, album));
            });
          });

          console.debug('série ' + serie.ID_SERIE + ' (' + serieAlbums.length + ' albums) added to collection');
        }
      } catch (error) {
        result.error = "Erreur inattendue lors de l'ajout de la série";
      }

      if (callback) {
        callback(result);
      }

      if (result.error) {
        Helpers.showToast(result.error, result.error ?
          'Erreur de connexion au serveur.' :
          'Série ajoutée à la collection.');
      }
    })
  }

  addSerieAlbumsToCollection(serie, serieAlbums, callback) {
    try {
      let nbalbums = 0;
      global.db.write(() => {
        serieAlbums.forEach((album) => {
          if (this.getAlbumType(album) == 0) {
            // Add the album in local collection
            // Add the album in local collection
            album.FLG_ACHAT = 'N';
            album.DATE_AJOUT = Helpers.getNowDateString();
            global.db.create('Albums', createEntry(AlbumSchema, album));
            //console.log('Add album ' + album.TITRE_TOME);
            nbalbums++;
          }
        });
      });
      console.debug('série ' + serie.ID_SERIE + ' (' + nbalbums + ' albums seulement) added to collection');
      callback({ error: '' });
    } catch (error) {
      console.debug("Erreur inattendue lors de l'ajout de la série");
      callback({ error: "Erreur inattendue lors de l'ajout de la série" });
    }
  }

  addAlbumToCollection(album, callback = null) {

    // Inform server of the add
    APIManager.updateAlbumInCollection(album.ID_TOME, (result) => {
      try {
        if (!result.error) {
          // Remove the album from the wishlist if needed
          global.db.write(() => {
            album.FLG_ACHAT = 'N';
            album.DATE_AJOUT = Helpers.getNowDateString();
          });

          const albWish = this.getAlbumInWishlist(album);
          if (albWish) {
            global.db.write(() => { global.db.delete(albWish); });
          }

          // Add the album in local collection
          global.db.write(() => {
            global.db.create('Albums', createEntry(AlbumSchema, album));
          })

          console.debug('album ' + album.ID_TOME + ' added to collection and removed from wishlist');

          if (!CollectionManager.getAlbumInCollection(album)) {
            console.error("/!\\ Album added but not found in collection!");
          }

          // Increment the serie's counter
          let serie = this.getSerieInCollection(album.ID_SERIE);
          if (!serie) {
            console.debug('serie ' + album.ID_SERIE + ' not found in collection, let\'s add it');
            APIManager.fetchSerie(album.ID_SERIE, (result) => {
              if (result.error == '') {
                const serie = result.items[0];
                global.db.write(() => {
                  serie.NB_USER_ALBUM = 1;
                  global.db.create('Series', createEntry(SerieSchema, serie));
                  console.debug('serie ' + album.ID_SERIE + ' added to collection');
                });
              }
            });
          } else {
            global.db.write(() => { serie.NB_USER_ALBUM++; });
          }

          //this.saveAlbums();
          global.collectionManquantsUpdated = false;
        }
      } catch (error) {
        result.error = "Erreur inattendue lors de l'ajout de l'album";
      }

      if (callback) {
        callback(result);
      }

      if (result.error) {
        Helpers.showToast(result.error, result.error ?
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
      try {
        if (!result.error) {

          const alb = this.getAlbumInCollection(album);
          if (alb) {
            console.debug('album ' + album.ID_TOME + ' edition ' + album.ID_EDITION + ' removed from the collection');
            global.db.write(() => {
              alb.DATE_AJOUT = '';
              album.DATE_AJOUT = '';
              global.db.delete(alb); });
          }

          if (CollectionManager.isAlbumInCollection(album)) {
            console.error('Album removed but still found in collection!');
          }

          // Decrement the serie's counter
          let serie = this.getSerieInCollection(album.ID_SERIE);
          if (serie) {
            global.db.write(() => {
              if (serie.NB_USER_ALBUM == 1) {
                global.db.delete(serie);
                console.debug('serie ' + album.ID_SERIE + ' removed from collection because no more albums owned');
              } else {
                serie.NB_USER_ALBUM--;
              }
            });
          }
          this.resetAlbumFlags(album);
          global.collectionManquantsUpdated = false;
        }
      } catch (error) {
        result.error = "Erreur inattendue lors de la suppression de l'album";
      }

      if (callback) {
        callback(result);
      }

      if (result.error) {
        Helpers.showToast(result.error, result.error ?
          'Erreur de connexion au serveur.' :
          'Album supprimé de la collection.');
      }
    });
  }

  addAlbumToWishlist(album, callback = null) {
    if (this.getAlbumInCollection(album)) {
      console.debug("trying to add an album in wishlist twice!");
      return;
    }
    APIManager.updateAlbumInCollection(album.ID_TOME, (result) => {
      try {
        if (!result.error) {
          // Add the album to the wishlist with the FLG_ACHAT flag
          global.db.write(() => {
            album.DATE_AJOUT = Helpers.getNowDateString();
            album.FLG_ACHAT = 'O';
            global.db.create('Wishes', createEntry(AlbumSchema, album));
          });

          console.debug('album ' + album.ID_TOME + ' added to the wishlist');
        }
      } catch (error) {
        result.error = "Erreur inattendue lors de l'ajout de l'album";
      }

      if (callback) {
        callback(result);
      }

      if (result.error) {
        Helpers.showToast(result.error, result.error ?
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
      try {
        if (!result.error) {
          // Remove the album from the wishlist
          global.db.write(() => {
            album.FLG_ACHAT = 'N';
          });

          const alb = this.getAlbumInWishlist(album);
          if (alb) {
            global.db.write(() => { global.db.delete(alb); });
          }
          console.debug('album ' + album.ID_TOME + ' removed from the wishlist: ' + this.isAlbumInWishlist(album));
        }
      } catch (error) {
        result.error = "Erreur inattendue lors de la suppression de l'album";
      }

      if (callback) {
        callback(result);
      }

      if (result.error) {
        Helpers.showToast(result.error, result.error ?
          'Erreur de connexion au serveur' :
          'Album supprimé de la wishlist.');
      }
    });
  }

  resetAlbumFlags(album) {
    const colAlb = this.getAlbumInCollection(album) ?? album;
    if (!colAlb) {
      console.debug('Error: unable to find album ' + album.ID_TOME + ' of serie ' + album.ID_SERIE + ' in collection!');
      return;
    }
    try {
      global.db.write(() => {
        album.FLG_ACHAT = 'N';
        album.FLG_LU = 'N';
        album.FLG_PRET = 'N';
        album.FLG_NUM = 'N';
        album.FLG_CADEAU = 'N';

        colAlb.FLG_ACHAT = 'N';
        colAlb.FLG_LU = 'N';
        colAlb.FLG_PRET = 'N';
        colAlb.FLG_NUM = 'N';
        colAlb.FLG_CADEAU = 'N';
      });
    } catch (error) {
      result.error = "Erreur inattendue lors de la mise à jour de l'album";
    }
  }

  setAlbumFlag(album, flagName, flag, callback = null) {
    const colAlb = this.getAlbumInCollection(album) ?? album;
    if (!colAlb) {
      console.debug('Error: unable to find album ' + album.ID_TOME + ' of serie ' + album.ID_SERIE + ' in collection!');
      return;
    }
    try {
      global.db.write(() => {
        album[flagName] = flag ? 'O' : 'N';
        colAlb[flagName] = flag ? 'O' : 'N';
      });
      this.updateAlbumEdition(album, (result) => {
        if (result.error) {
          global.db.write(() => {
            album[flagName] = flag ? 'N' : 'O';
            colAlb[flagName] = flag ? 'N' : 'O';
          });
        }
        if (callback) {
          callback(result);
        }
      });
    } catch (error) {
    result.error = "Erreur inattendue lors de la mise à jour de l'album";
    }
  }

  setAlbumReadFlag(album, flag, callback = null) {
    this.setAlbumFlag(album, 'FLG_LU', flag, callback);
  }

  setAlbumLendFlag(album, flag, callback = null) {
    this.setAlbumFlag(album, 'FLG_PRET', flag, callback);
  }

  setAlbumNumEdFlag(album, flag, callback = null) {
    this.setAlbumFlag(album, 'FLG_NUM', flag, callback);
  };

  setAlbumGiftFlag(album, flag, callback = null) {
    this.setAlbumFlag(album, 'FLG_CADEAU', flag, callback);
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
    return this.getAlbumInCollection(album) != null;
  }

  isAlbumInWishlist(album) {
    return this.getAlbumInWishlist(album) != null;
  }

  getAlbumInCollection(album) {
    const ret = this.getAlbums().filtered('_id == $0', Helpers.makeAlbumUID(album));
    return ret.length > 0 ? ret[0] : null;
  }

  getAlbumInWishlist(album) {
    const ret = this.getWishes().filtered('_id == $0', Helpers.makeAlbumUID(album));
    return ret.length > 0 ? ret[0] : null;
  }

  getFirstAlbumEditionOfSerieInCollection(album) {
    let ret = this.getAlbums().filtered('ID_SERIE == $0 && ID_TOME == $1', parseInt(album.ID_SERIE), parseInt(album.ID_TOME));
    if (ret.length > 0) return ret[0];

    ret = this.getWishes().filtered('ID_SERIE == $0 && ID_TOME == $1', parseInt(album.ID_SERIE), parseInt(album.ID_TOME));
    return (ret.length > 0) ? ret[0] : album;
  }

  getNbOfUserAlbumsInSerie(serie) {
    const albums = this.getAlbums().filtered('ID_SERIE == $0', parseInt(serie.ID_SERIE));
    return albums ? albums.length : 0;
  }

  getAlbumEditionsInCollection(id_tome, id_serie) {
    let ret = this.getAlbums().filtered('ID_SERIE == $0 && ID_TOME == $1', parseInt(id_serie), parseInt(id_tome));
    return (ret.length > 0) ? ret : [];
  }

  getSerieInCollection(id_serie) {
    let ret = this.getSeries().filtered('_id == $0', parseInt(id_serie));
    return ret.length > 0 ? ret[0] : null;
  }

  isSerieComplete(serie) {
    const cs = this.getSerieInCollection(serie.ID_SERIE);
    return cs ? cs.NB_USER_ALBUM == serie.NB_ALBUM : false;
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
        albumsArray[t].data[i] = Helpers.toDict(this.getFirstAlbumEditionOfSerieInCollection(album));
      }
    }
  }

  setSerieExcludeFlag(serie, isExcluded) {
    let ret = this.getSeries().filtered('_id == ' + serie.ID_SERIE);
    if (ret.length > 0) {
      global.db.write(() => {
        ret[0].IS_EXCLU = isExcluded ? 1 : 0;
        serie.IS_EXCLU = isExcluded ? 1 : 0;
      });
    }
  }

  isSerieExcluded(serie) {
    let ret = this.getSeries().filtered('_id == ' + serie.ID_SERIE);
    return (ret.length > 0) ? (ret[0].IS_EXCLU == 1) : (serie.IS_EXCLU == 1);
  }
};

const CollectionManager = new CCollectionManager();

export default CollectionManager;
