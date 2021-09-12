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
import { Platform } from 'react-native';

import { showToast } from '../api/Helpers';
import CollectionManager from './CollectionManager';
import SettingsManager from './SettingsManager';

const bdovoreUserAgent = 'bdovore ' + Platform.OS + ' v0.1';

export const bdovoreBaseURL = 'https://www.bdovore.com';
const bdovoreBaseUserURL = bdovoreBaseURL + '/getjson?';

function getBaseURL(dataMode) {
  return bdovoreBaseUserURL + 'data=' + dataMode;
}

function getBaseUserURL(token, dataMode) {
  return getBaseURL(dataMode) + '&API_TOKEN=' + encodeURI(token);
}

function concatParamsToURL(url, params) {
  for (const key in params) {
    url += '&' + key + '=' + params[key];
  }
  return encodeURI(url);
}

const GETHeaders = new Headers({
  'User-Agent': bdovoreUserAgent,
  'Accept-Encoding': 'gzip, deflate',
  'Content-Type': 'application/json',
});

const fetchZIP = async (url) => {
  if (url.includes('TOKEN=offline')) {
    const msg = 'Won\'t perform fetch with offline token: ' + url;
    console.debug(msg);
    throw msg;
  }

  console.debug("fetchZIP: " + url);
  return fetch(url, {
    method: 'GET',
    compress: true,
    headers: GETHeaders,
  });
};

export function isValidToken() {
  return global.token && global.token.match(/([0-9]+)-([0-9a-f]+)/);
}

export function checkForToken(navigation = null, callback = null) {
  // const navigation = useNavigation();
  // Move to login page if no token available
  if (isValidToken()) {
    console.log('valid token');
    return callback ? callback() : global.token;
  }
  if (global.forceOffline) {
    return callback ? callback() : 'offline-';
  }
  if (global.token == undefined) {
    console.log('undefined token -> relogin');
    return reloginBDovore(navigation, callback);
  }
  if (global.token === null && navigation) {
    navigation.navigate('Login');
    return;
  } else if (global.token === 'expired' && navigation) {
    return reloginBDovore(navigation, callback);
  }
  if (callback) callback();
  return global.token;
}

export async function reloginBDovore(navigation, callback = null) {

  console.log("relogin!");
  if (global.isConnected) {
    AsyncStorage.multiGet(['login', 'passwd'])
      .then((values) => {
        const pseudo = values[0][1];
        const passwd = values[1][1];
        loginBDovore(pseudo, passwd, (response) => {
          if (response.error) {
            if (navigation) {
              navigation.navigate('Login');
            }
          } else {
            console.debug("New token " + response.token + " fetched!");
            if (callback) {
              callback();
            }
          }
        });
      })
      .catch((error) => {
        console.log(error);
        if (navigation) {
          navigation.navigate('Login');
        }
      });
  } else {
    console.log('Not connected.');
  }
}

export function loginBDovore(pseudo, passwd, callback) {
  const formatResult = (connected, token, timestamp, error = '') => {
    return { connected, token, error, timestamp };
  }

  console.debug("Login...");
  if (!pseudo) {
    callback(formatResult(false, null, 'Veuillez renseigner le pseudo.'));
    return;
  }
  if (!passwd) {
    callback(formatResult(false, null, 'Veuillez renseigner le mot de passe.'));
    return;
  }

  return fetch(bdovoreBaseURL + '/auth/gettoken', {
    method: 'POST',
    headers: {
      'User-Agent': bdovoreUserAgent,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: encodeURI('user_login=' + pseudo + '&user_password=' + passwd)
  })
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.Error === '') {
        console.debug("New token: " + responseJson.Token);
        global.token = responseJson.Token;
        global.serverTimestamp = responseJson.Timestamp;
        //console.log(responseJson);
        callback(formatResult(true, responseJson.Token, responseJson.Timestamp ?? null));
      } else {
        callback(formatResult(false, responseJson.Token, responseJson.Error));
      }
    })
    .catch((error) => {
      showToast(true,
        'Erreur de connexion au serveur.',
        'Vérifiez la connexion internet.',
        1500);
      callback(formatResult(false, '', 'Erreur de connexion au serveur.\nVérifiez la connexion internet.'));
    });
}

export async function onConnected(navigation, successCb = () => { }, failCb = () => { }) {
  SettingsManager.getConnectionStatus(() => {
    if (global.isConnected) {
      return checkForToken(navigation, successCb);
    }
    return failCb();
  });
}

export async function fetchJSON(request, context, callback, params = {},
  datamode = false, multipage = false, multipageTotalField = 'nbTotal', pageLength = 1000, retry = 5) {

  const formatResult = (items = [], error = '', done = true, totalItems = null) => {
    const nbItems = Object.keys(items).length;
    return {
      nbItems,
      items,
      error,
      done,
      totalItems: (totalItems ? totalItems : nbItems)
    };
  }

  let userMode = false;
  if (!isValidToken() && context && context.navigation) {
    checkForToken(context.navigation);
    if (global.token == '') {
      callback(formatResult([]));
      return;
    }
  }
  if (global.token != '') {
    userMode = true;
  }

  const baseUrl = concatParamsToURL(userMode ? getBaseUserURL(global.token, request) : getBaseURL(request), params);
  let url = baseUrl;
  if (multipage && datamode) {
    url += '&page=1&length=' + pageLength;
  }

  fetchZIP(url)
    .then(response => response.json())
    .then(json => {
      let data = datamode ? json.data : json;

      // Get total number of items and compute number of pages to fetch
      let nbItems = (multipage && datamode) ? parseInt(json[multipageTotalField]) : null;
      let nbPages = (multipage && datamode) ? Math.ceil(nbItems / pageLength) : 1;

      callback(formatResult(data, '', nbPages <= 1, nbItems));

      const loadPage = (page) => {
        const url = baseUrl + '&page=' + page + '&length=' + pageLength;
        //console.debug("Fetching page " + i + '/' + nbPages);
        fetchZIP(url)
          .then(response => response.json())
          .then(json => {
            data.push(...json.data);
            callback(formatResult(data, '', page === nbPages ? true : false, nbItems));
          });
      }
      // Perform all pages request at once. It is far far faster than
      // making them iteratively once the previous has been fetched.
      // Will it create an overload serverside?
      for (let i = 2; i <= nbPages; i++) {
        loadPage(i);
      }
    })
    .catch((error) => {
      if (retry > 0 && global.isConnected) {
        console.debug(error);
        if (global.verbose) {
          showToast(true, 'Connexion perdue. Reconnexion en cours...', 'Tentative n°' + (5 - retry + 1));
        }
        console.debug("Retry " + retry);
        reloginBDovore(context ? context.navigation : null, () => {
          fetchJSON(request, context, callback, params, datamode, multipage, multipageTotalField, pageLength, retry - 1);
        });
      } else {
        console.error("Error: " + error);
        callback(formatResult([], error.toString()));
      }
    });
};

export async function fetchJSONData(request, context, callback, params = {}) {
  fetchJSON(request, context, callback, params, true);
};

export async function fetchCollectionData(request, context, callback, params = {}) {

  fetchJSON(request, context, callback, {
    ...{
      mode: 2,
    }, ...params
  }, true, true, (request === 'Userserie') ? 'nbserie' : 'nbTotal');
}

export async function fetchSerie(id_serie, callback, params = {}) {

  fetchJSON('Serie', null, callback, {
    ...{
      id_serie,
      mode: 1,
    }, ...params
  });
}

export async function fetchSerieByTerm(term, callback, params = {}) {

  fetchJSON('Serie', null, callback, {
    ...{
      term,
      mode: 2,
    }, ...params
  });
}

export async function fetchSerieAlbums(id_serie, callback, params = {}) {

  fetchJSON('Album', null, callback, {
    ...{
      id_serie,
      mode: 1,
    }, ...params
  });
}

export async function fetchAlbumsManquants(context, callback, params = {}) {

  fetchJSON('Albummanquant', context, callback, {
    ...{
      mode: 'all',
    }, ...params
  }, true, true, 'nbmanquant');
}

export async function fetchSeriesManquants(context, callback, params = {}) {

  fetchJSON('Albummanquant', context, callback, {
    ...{
      mode: '1',
    }, ...params
  }, true);
}

export async function fetchNews(origine, context, callback, params = {}) {

  fetchJSON('Actu', context, callback, {
    ...{
      origine,
      mode: 2,
      page: 1,
      length: 100
    }, ...params
  });
};

export async function fetchUserNews(context, callback, params = {}) {

  fetchJSONData('Useractu', context, callback, {
    ...{
      mode: 1,
      nb_mois: 12
    }, ...params
  });
};

export async function fetchWishlist(context, callback, params = {}) {

  fetchJSONData('Useralbum', context, callback, {
    ...{
      mode: 2,
      page: 1,
      length: 999,
      flg_achat: 'O'
    }, ...params
  });
};

export async function fetchSimilAlbums(id_tome, callback) {
  const url = concatParamsToURL(bdovoreBaseURL + '/simil/gettopsimil?', { ID_TOME: id_tome, });

  fetchZIP(url)
    .then(response => response.json())
    .then(json => {
      callback({ error: '', items: json, nbItems: Object.keys(json).length, });
    })
    .catch((error) => {
      console.debug('==> error : ' + error.toString())
      callback({ error: error.toString(), items: [], nbItems: 0 });
    });
}

export async function fetchAlbumComments(id_tome, callback) {
  const url = concatParamsToURL(bdovoreBaseURL + '/Albumcomment?', { id_tome: id_tome, });

  fetchZIP(url)
    .then(response => response.json())
    .then(json => {
      callback({ error: '', items: json, nbItems: Object.keys(json).length, });
    })
    .catch((error) => {
      console.debug('==> error : ' + error.toString())
      callback({ error: error.toString(), items: [], nbItems: 0 });
    });
}

export async function sendAlbumComment(id_tome, callback, note = 0, comment = '') {

  let token = checkForToken();
  const url = concatParamsToURL(bdovoreBaseURL + '/albumcomment/writecomment' + '?API_TOKEN=' + encodeURI(token),
    {
      id_tome: id_tome,
      note: note,
      comment: comment
    });

  fetchZIP(url)
    .then(response => {
      callback({ error: (response.status != '200') });
    })
    .catch(error => {
      console.debug('==> error : ' + error.toString())
      callback({ error: error.toString() });
    });
}

export async function fetchAlbum(callback, params = {}) {

  fetchJSON('Album', null, callback, {
    ...{
      mode: 2
    }, ...params
  });
};

export async function fetchAlbumEditions(id_tome, callback, params = {}) {

  fetchJSON('Edition', null, callback, {
    ...{
      id_tome,
    }, ...params
  });
};

export async function fetchAuteur(id_auteur, callback, params = {}) {
  fetchJSON('Auteur', null, callback, {
     ...{
       id_auteur,
       mode: 2
     }, ...params
  });
}

export async function fetchAuteurByTerm(term, callback, params = {}) {
  fetchJSON('Auteur', null, callback, {
    ...{
      term,
      mode: 2
    }, ...params
  });
}

export async function updateCollection(func, callback, params = {}) {

  let token = checkForToken();
  const url = concatParamsToURL(bdovoreBaseURL + '/macollection/' + func + '?API_TOKEN=' + encodeURI(token) + '&api_version=2', params);

  fetchZIP(url)
    //.then((response) => {
    .then(response => response.json())
    .then(responseJson => {
      if (responseJson.error == '') {
        console.log(responseJson);
        global.serverTimestamp = responseJson.timestamp;
        CollectionManager.saveTimestamp();
        callback({ error: '' });
      } else {
        callback({ error: responseJson.error });
      }
    })
    .catch((error) => {
      console.debug('==> error : ' + error.toString())
      callback({ error: error.toString() });
    });
}

export async function updateAlbumInCollection(id_tome, callback, params = {}) {

  updateCollection('majcollection', callback, {
    ...{
      id_tome,
    }, ...params
  });
}

export async function deleteAlbumInCollection(id_edition, callback, params = {}) {

  updateCollection('deleteAlbum', callback, {
    ...{
      id_edition,
    }, ...params
  });
}

export async function addSerieInCollection(id_serie, callback, params = {}) {

  updateCollection('addSerie', callback, {
    ...{
      id_serie,
    }, ...params
  });
}

export async function fetchExcludeStatusOfSerieAlbums(id_serie, callback, params = {}) {

  fetchJSON('ListTomesExclus', null, callback, {
    ...{
      id_serie,
    }, ...params
  });
}


export async function fetchIsAlbumExcluded(album, callback, params = {}) {

  fetchJSON('isExclu', null, callback, {
    ...{
      id_tome: album.ID_TOME,
      id_serie: album.ID_SERIE,
      id_edition: album.ID_EDITION,
    }, ...params
  });
}

export async function excludeAlbum(album, callback, params = {}) {

  updateCollection('excludeAlbum', callback, {
    ...{
      id_tome: album.ID_TOME,
      id_serie: album.ID_SERIE,
      id_edition: album.ID_EDITION,
    }, ...params
  });
}

export async function includeAlbum(album, callback, params = {}) {

  updateCollection('includeAlbum', callback, {
    ...{
      id_tome: album.ID_TOME,
      id_serie: album.ID_SERIE,
      id_edition: album.ID_EDITION,
    }, ...params
  });
}

export async function excludeSerie(serie, callback, params = {}) {

  updateCollection('excludeSerie', callback, {
    ...{
      id_serie: serie.ID_SERIE,
    }, ...params
  });
}

export async function includeSerie(serie, callback, params = {}) {

  updateCollection('includeSerie', callback, {
    ...{
      id_serie: serie.ID_SERIE,
    }, ...params
  });
}

export function getAlbumCoverURL(item) {
  return encodeURI(bdovoreBaseURL + '/images/couv/' + ((item && item.IMG_COUV) ?? 'default.png'));
}

export function getSerieCoverURL(item) {
  return encodeURI(bdovoreBaseURL + '/images/couv/' + ((item && item.IMG_COUV_SERIE) ? item.IMG_COUV_SERIE : item.IMG_COUV ?? 'default.png'));
}

export function getAuteurCoverURL(item) {
  return encodeURI(bdovoreBaseURL + '/images/auteur/' + ((item && item.IMG_AUT) ?? 'default_auteur.png'));
}

