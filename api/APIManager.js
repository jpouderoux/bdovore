import React, { useState } from 'react';
import AsyncStorage from '@react-native-community/async-storage';

export async function checkForToken(navigation) {
  // Move to login page if no token available
  const value = await AsyncStorage.getItem('Token');
  if (value === null) {
    navigation.navigate('Login');
  }
}

export function loginBdovore(pseudo, passwd, context) {
  console.log("Login...");
  context.setErrortext('');
  if (!pseudo) {
    alert('Veuillez renseigner le pseudo.');
    return;
  }
  if (!passwd) {
    alert('Veuillez renseigner le mot de passe.');
    return;
  }
  context.setLoading(true);

  return fetch('https://www.bdovore.com/auth/gettoken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: encodeURI("user_login=" + pseudo + "&user_password=" + passwd)
  })
    .then((response) => response.json())
    .then((responseJson) => {
      //console.log(responseJson);
      context.setErrortext(responseJson.Error);
      if (responseJson.Error === '') {
        console.log("New token: " + responseJson.Token);
        AsyncStorage.setItem('Token', responseJson.Token).then((token) => {
          context.navigation.goBack();
        });
        AsyncStorage.setItem('pseudo', pseudo);
        AsyncStorage.setItem('passwd', passwd);
        AsyncStorage.setItem('collecFetched', 'false');
      } else {
        console.log("Erreur: " + responseJson.Error);
      }
    })
    .catch((error) => {
      context.setErrortext(error);
      console.error("Exception: {error}");
    })
    .finally(() => {
      context.setLoading(false);
    });
}

export async function fetchCollectionData(dataMode, callback, context) {
  context.setLoading(true);
  context.setErrortext('');
  try {
  const token = await AsyncStorage.getItem('Token');
  //console.log("Token: " + token);
  if (token == null) {
    context.navigation.push('Login');
    return;
  }

  const url = 'https://www.bdovore.com/getjson?data=' + dataMode + '&API_TOKEN=' + encodeURI(token) + '&mode=2&page=1&length=999';
  console.log(url);
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      //console.log(json);
      if (dataMode === 'Userserie') {
        AsyncStorage.setItem('collectionSeries', JSON.stringify(json.data));
        AsyncStorage.setItem('nbSeries', json.nbserie);
      }
      else {
        AsyncStorage.setItem('collectionAlbums', JSON.stringify(json.data));
        AsyncStorage.setItem('nbAlbums', json.nbTotal);
      }
    })
    .catch((error) => {
      setData([]);
      if (dataMode === 'Userserie') {
        AsyncStorage.setItem('collectionSeries', '');
        AsyncStorage.setItem('nbSeries', 0);
      }
      else {
        AsyncStorage.setItem('collectionAlbums', '');
        AsyncStorage.setItem('nbAlbums', 0);
      }
      //context.setErrortext(error);
      console.error("Error: " + error);
    })
    .finally(() => {
      context.setLoading(false);
      callback();
    });
  }
  catch (error) {
  }
};

export function getAlbumCoverURL(item) {

}

export function getSerieCoverURL(item) {

}

export function getAuteurCoverURL(item) {

}

