import React, { useState } from 'react';
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
  console.log(params);
  for (const key in params) {
    url += '&' + key + '=' + params[key];
  }
  return encodeURI(url);
}

export async function checkForToken(navigation) {
  // Move to login page if no token available
  const token = await AsyncStorage.getItem('token');
  if (token === null) {
    navigation.navigate('Login');
  } else if (token === 'expired') {
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
  console.log("Login...");
  if (!pseudo) {
    callback({ connected: false, token: null, error: 'Veuillez renseigner le pseudo.' });
    return;
  }
  if (!passwd) {
    callback({ connected: false, token: null, error: 'Veuillez renseigner le mot de passe.' });
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
        callback({ connected: true, token: responseJson.Token, error: '' });
      } else {
        callback({ connected: false, token: responseJson.Token, error: responseJson.Error });
      }
    })
    .catch((error) => {
      console.error("Exception: " + error);
      callback({ connected: false, token: '', error: error.toString() });
    });
}

export async function fetchJSON(request, context, callback, params = {},
  datamode = false, multipage = false, multipageTotalField = 'nbTotal', pageLength = 100) {

  let userMode = false;
  let token = '';
  if (context && context.navigation) {
    token = await checkForToken(context.navigation);
    if (token == '') {
      callback({ nbItems: 0, items: [], error: null });
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
      callback({
        nbItems: Object.keys(data).length,
        items: data,
        error: ''
      });
      if (multipage && datamode) {
        const nbItems = json[multipageTotalField]; //(request === 'Userserie') ? json.nbserie : json.nbTotal;
        let nbPages = Math.ceil(nbItems / pageLength);
        if (nbPages > 1) {
          for (let i = 2; i <= nbPages; i++) {
            //console.log("Fetching page " + i + '/' + nbPages);
            const url = baseUrl + '&page=' + i + '&length=' + pageLength;
            fetch(url).then((response) => response.json()).then((json) => {
              data.push(... json.data);
              callback({ nbItems: Object.keys(data).length, items: data, error: '' });
            });
          }
        }
      }
    })
    .catch((error) => {
      console.error("Error: " + error);
      callback({ nbItems: 0, items: [], error: error.toString() })
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
    mode:2,
    nb_mois:3
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

/*export async function fetchSerie(callback, params = {}) {

  fetchJSON('Serie', null, callback, {
    ...{
      mode: 2
    }, ...params
  });
};*/

export function getAlbumCoverURL(item) {
  return encodeURI('https://www.bdovore.com/images/couv/' + (item.IMG_COUV ? item.IMG_COUV : 'default.png'));
}

export function getSerieCoverURL(item) {
  return encodeURI('https://www.bdovore.com/images/couv/' + (item.IMG_COUV_SERIE ? item.IMG_COUV_SERIE : item.IMG_COUV ? item.IMG_COUV : 'default.png'));
}

export function getAuteurCoverURL(item) {
  return encodeURI('https://www.bdovore.com/images/auteur/default_auteur.png');
}

