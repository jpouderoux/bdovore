import React, { useState } from 'react';
import AsyncStorage from '@react-native-community/async-storage';

const bdovoreBaseURL = 'https://www.bdovore.com/';
const bdovoreBaseUserURL = bdovoreBaseURL + '/getjson?';

function getBaseUserURL(token, dataMode) {
  return bdovoreBaseUserURL + 'API_TOKEN=' + encodeURI(token) + '&data=' + dataMode;
}

export async function checkForToken(navigation) {
  // Move to login page if no token available
  const value = await AsyncStorage.getItem('token');
  if (value === null) {
    navigation.navigate('Login');
  } else if (value === 'expired') {
    reloginBdovore(navigation);
  }
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

  return fetch(bdovoreBaseURL + 'auth/gettoken', {
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
      console.error("Exception: "+ error);
      callback({ connected: false, token: '', error: error.toString() });
    });
}

export async function fetchCollectionData(dataMode, context, callback) {

  const token = await AsyncStorage.getItem('token');
  //console.log("Token: " + token);
  if (token == null) {
    context.navigation.push('Login');
    callback({ nbItems: 0, items: [], error: null });
    return;
  }
  const length = 100;
  const url = getBaseUserURL(token, dataMode) + '&mode=2&page=1&length=' + length;
  console.log(url);
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      //console.log(json);
      let data = json.data;
      const nbItems = (dataMode === 'Userserie') ? json.nbserie : json.nbTotal;
      let nbPages = Math.ceil(nbItems / length);
      if (nbPages > 1) {
        for (let i = 2; i <= nbPages; i++) {
          //console.log("Fetching page " + i + '/' + nbPages);
          const url = getBaseUserURL(token, dataMode) + '&mode=2&page=' + i + '&length=' + length;
          fetch(url).then((response) => response.json()).then((json) => {
            data = data.concat(json.data);
            if (i === nbPages) {
              callback({ nbItems: nbItems, items: data, error: '' });
            }
          });
        }
      }
      else {
        callback({ nbItems: nbItems, items: data, error: '' });
      }
    })
    .catch((error) => {
      console.error("Error: " + error);
      callback({ nbItems: 0, items: [], error: error.toString() });
    });
}

export async function fetchAlbumsManquants(context, callback) {

  const token = await AsyncStorage.getItem('token');
  if (token == null) {
    context.navigation.push('Login');
    callback({ nbItems: 0, items: [], error: null });
    return;
  }
  const url = getBaseUserURL(token, 'Albummanquant') + '&mode=all&page=1&length=999';
  console.log(url);
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      //console.log(json);
      callback({ nbItems: json.nbmanquant, items: json.data, error: ''});
    })
    .catch((error) => {
      console.error("Error: " + error);
      callback({ nbItems: 0, items: [], error: error.toString()});
    });
}

export async function fetchNews(origine, context, callback) {

  const token = await AsyncStorage.getItem('token');
  if (token == null) {
    context.navigation.navigate('Login');
    callback({ nbItems: 0, items: [], error: null });
    return;
  }
  const url = getBaseUserURL(token, 'Actu') + '&origine='+ origine + '&mode=2&page=1&length=20';
  console.log(url);
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      callback({ nbItems: 20, items: json, error: '' })
    })
    .catch((error) => {
      console.error("Error: " + error);
      callback({ nbItems: 0, items: [], error: error.toString() })
    });
};

export async function fetchWishlist(context, callback) {

  const token = await AsyncStorage.getItem('token');
  if (token == null) {
    context.navigation.navigate('Login');
    callback({ nbItems: 0, items: [], error: null });
    return;
  }
  const url = getBaseUserURL(token, 'Useralbum') + '&mode=2&page=1&length=999&flg_achat=O';
  console.log(url);
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      //console.log(json);
      callback({ nbItems: json.nbTotal, items: json.data, error: '' })
    })
    .catch((error) => {
      console.error("Error: " + error);
      callback({ nbItems: 0, items: [], error: error.toString() })
    });
};

export function getAlbumCoverURL(item) {

}

export function getSerieCoverURL(item) {

}

export function getAuteurCoverURL(item) {

}

