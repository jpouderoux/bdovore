import React, { useState } from 'react';
import AsyncStorage from '@react-native-community/async-storage';

export async function checkForToken(navigation) {
  // Move to login page if no token available
  AsyncStorage.getItem('Token').then((value) => {
    if (value === null) {
      navigation.navigate('Login');
    }
  }, () => { }
  );
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

export function getAlbumCoverURL(item) {

}

export function getSerieCoverURL(item) {

}

export function getAuteurCoverURL(item) {

}

