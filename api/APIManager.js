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

const bdovoreBaseURL = 'https://www.bdovore.com';
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

export async function checkForToken(navigation = null) {
 // const navigation = useNavigation();
  // Move to login page if no token available
  const token = await AsyncStorage.getItem('token');
  if (token === null && navigation) {
    navigation.navigate('Login');
  } else if (token === 'expired' && navigation) {
    reloginBdovore(navigation);
  } else {
    return token;
  }
  return '';
}

export function reloginBdovore(navigation) {

  AsyncStorage.multiGet('pseudo', 'passwd')
    .then((response) => {
      let pseudo = response[0][1];
      let passwd = response[1][1];
      loginBdovore(pseudo, passwd, (response) => {
        AsyncStorage.setItem('token', response.token);
      });
    })
    .catch((error) => {
      navigation.navigate('Login');
    });
}

export function loginBdovore(pseudo, passwd, callback) {
  const formatResult = (connected, token, error = '') => {
    return { connected: connected, token: token, error: error}; }

  console.log("Login...");
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
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: encodeURI("user_login=" + pseudo + "&user_password=" + passwd)
  })
    .then((response) => response.json())
    .then((responseJson) => {
      //console.log(responseJson);
      if (responseJson.Error === '') {
        console.log("New token: " + responseJson.Token);
        callback(formatResult(true, responseJson.Token));
      } else {
        callback(formatResult(false, responseJson.Token, responseJson.Error));
      }
    })
    .catch((error) => {
      console.error("Exception: " + error);
      callback(formatResult(false, '', error.toString()));
    });
}

export async function fetchJSON(request, context, callback, params = {},
  datamode = false, multipage = false, multipageTotalField = 'nbTotal', pageLength = 100) {

  const formatResult = (items = [], error = '', done = true, totalItems = null) => {
    return {
      nbItems: Object.keys(items).length,
      items: items,
      error: error,
      done: done,
      totalItems: (totalItems ? totalItems : Object.keys(items).length)
    };
  }

  let userMode = false;
  let token = '';
  if (context && context.navigation) {
    token = await checkForToken(context.navigation);
    if (token == '') {
      callback(formatResult([]));
      return;
    }
    userMode = true;
  }
  const baseUrl = concatParamsToURL(userMode ? getBaseUserURL(token, request) : getBaseURL(request), params);
  let url = baseUrl;
  if (multipage && datamode) {
    url += '&page=1&length='+ pageLength;
  }
  console.log(url);
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      let data = datamode ? json.data : json;
      //console.log(datamode ? json.data : json);

      // get total number of items and compute number of pages to fetch
      let nbItems = (multipage && datamode) ? json[multipageTotalField] : null;
      let nbPages = (multipage && datamode) ? Math.ceil(nbItems / pageLength) : 1;

      callback(formatResult(data, '', nbPages == 1, nbItems));

      for (let i = 2; i <= nbPages; i++) {
        //console.log("Fetching page " + i + '/' + nbPages);
        const url = baseUrl + '&page=' + i + '&length=' + pageLength;
        fetch(url).then((response) => response.json()).then((json) => {
          data.push(...json.data);
          callback(formatResult(data, '', i == nbPages, nbItems));
        });
      }
    })
    .catch((error) => {
      console.error("Error: " + error);
      callback(formatResult([], error.toString()));
    });
};

export async function fetchJSONData(request, context, callback, params = {}) {
  fetchJSON(request, context, callback, params, true);
};

export async function fetchCollectionData(request, context, callback, params = {}) {

  fetchJSON(request, context, callback, {...{
    mode: 2,
  }, ... params}, true, true, (request === 'Userserie') ? 'nbserie' : 'nbTotal');
}

export async function fetchSerie(id_serie, context, callback, params = {}) {

  fetchJSON('Serie', null, callback, {...{
    id_serie: id_serie,
    mode: 1,
  }, ...params});
}

export async function fetchSerieAlbums(id_serie, context, callback, params = {}) {

  fetchJSON('Album', null, callback, {
    ...{
      id_serie: id_serie,
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

  fetchJSON('Actu', context, callback, {...{
      origine: origine,
      mode: 2,
      page: 1,
      length: 100
    }, ...params
  });
};

export async function fetchUserNews(context, callback, params = {}) {

  fetchJSONData('Useractu', context, callback, {...{
    mode:1,
    nb_mois:12
  }, ...params});
};

export async function fetchWishlist(context, callback, params = {}) {

  fetchJSONData('Useralbum', context, callback, {...{
    mode: 2,
    page:1,
    length:999,
    flg_achat:'O'
  }, ...params});
};

export async function fetchAlbum(callback, params = {}) {

  fetchJSON('Album', null, callback, {...{
    mode: 2
    }, ...params});
};

export async function fetchAlbumEditions(id_tome, callback, params = {}) {

  fetchJSON('Edition', null, callback, {
    ...{
      id_tome: id_tome,
    }, ...params
  });
};

export async function updateAlbumInCollection(id_tome, callback, params = {}) {

  let token = await checkForToken();
  const url = concatParamsToURL(bdovoreBaseURL + '/macollection/majcollection' +'?API_TOKEN=' + encodeURI(token), {
    ...{
      id_tome: id_tome,
    }, ...params});

  console.log(url);
  fetch(url)
    .then((response) => {
      callback({ error: (response.status == '200') });
    })
    .catch((error) => {
      console.log('==> error : ' + error.toString())
      callback({ error: error.toString() });
    });
}

export async function deleteAlbumInCollection(id_edition, callback, params = {}) {

  let token = await checkForToken();
  const url = concatParamsToURL(bdovoreBaseURL + '/macollection/deleteAlbum' + '?API_TOKEN=' + encodeURI(token), {
    ...{
      id_edition: id_edition,
    }, ...params
  });

  console.log(url);
  fetch(url)
    .then((response) => {
      callback({ error: (response.status == '200') });
    })
    .catch((error) => {
      console.log(' ==> ' + error.toString());
      callback({ error: error.toString() });
    });
}

export function getAlbumCoverURL(item) {
  return encodeURI(bdovoreBaseURL+ '/images/couv/' + (item.IMG_COUV ? item.IMG_COUV : 'default.png'));
}

export function getSerieCoverURL(item) {
  return encodeURI(bdovoreBaseURL + '/images/couv/' + (item.IMG_COUV_SERIE ? item.IMG_COUV_SERIE : item.IMG_COUV ? item.IMG_COUV : 'default.png'));
}

export function getAuteurCoverURL(item) {
  return encodeURI(bdovoreBaseURL + '/images/auteur/default_auteur.png');
}

