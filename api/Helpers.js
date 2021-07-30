import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View  } from 'react-native';

import * as APIManager from '../api/APIManager';

String.prototype.replaceAt = function (index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

export function lowerCaseNoAccentuatedChars(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function renderSeparator() {
  return <View style={{ borderBottomColor: '#eee', borderBottomWidth: StyleSheet.hairlineWidth * 2, }} />
};

export function plural(nb) {
  return nb > 1 ? 's' : '';
}

export function pluralWord(nb, word) {
  return nb + ' ' + word + (nb > 1 ? 's' : '');
}

// Move to login page if no token available
export function checkForToken(navigation) {
  APIManager.checkForToken(navigation).then().catch();
}

export function sortByDate(data, field = 'DATE_AJOUT') {
  data.sort(function (item1, item2) {
    return new Date(item2[field].replaceAt(10, 'T')) - new Date(item1[field].replaceAt(10, 'T'));
  });
  return data;
}
export function sliceSortByDate(data, field = 'DATE_AJOUT') {
  return sortByDate(data.slice(), field);
}

export function sortByAscendingValue(data, field = 'NUM_TOME') {
  data.sort(function (item1, item2) {
    return item1[field] - item2[field];
  });
  return data;
}
export function sliceSortByAscendingValue(data, field = 'NUM_TOME') {
  return sortByAscendingValue(data.slice(), field);
}

export function sortByDesendingValue(data, field = 'NUM_TOME') {
  data.sort(function (item1, item2) {
    return item2[field] - item1[field];
  });
  return data;
}
export function sliceSortByDescendingValue(data, field = 'NUM_TOME') {
  return sortByDesendingValue(data.slice(), field);
}

export function stripEmptySections(data) {
  return data.filter(item => (item.data.length > 0));
}

export function stripNewsByOrigin(data, origine) {
  console.log("data to filter by " + origine)
  console.log(data);
  return data.filter(item => (item.ORIGINE == origine));
}

export function makeAlbumUID(album) {
  // 009633-062007: ID_TOME*1000000 + ID_EDITION
  return parseInt(album.ID_TOME) * 1000000 + parseInt(album.ID_EDITION);
}

export function createDictFromArray(array, dict, hashFun) {
  for (let i = 0; i < array.length; i++) {
    const idx = hashFun(array[i]);
    dict[idx] = i;
  }
  return dict;
}

export function createAlbumDict(array, dict) {
  return createDictFromArray(array, dict, (item) => makeAlbumUID(item));
}

export function createSerieDict(array, dict) {
  return createDictFromArray(array, dict, (item) => item.ID_SERIE);
}

export function getAlbumIdxInArray(album, dict) {
  return dict ? dict[makeAlbumUID(album)] : null;
}

export function addAlbumToArrayAndDict(album, array, dict) {
  const idx = array.push(album) - 1;
  dict[makeAlbumUID(album)] = idx;
  return idx;
}

export function removeAlbumFromArrayAndDict(album, array, dict) {
  const idx = getAlbumIdxInArray(album, dict);
  if (idx) {
    array[idx] = null;
    dict[makeAlbumUID(album)] = null;
  }
}
