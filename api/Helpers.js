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

import React from 'react';
import { StyleSheet, View  } from 'react-native';
import Toast from 'react-native-toast-message';

import * as APIManager from '../api/APIManager';

// Returns true if the screen is in portrait mode
export function isPortrait() {
  const dim = Dimensions.get('screen');
  return dim.height >= dim.width;
}

// Returns true of the screen is in landscape mode
export function isLandscape() {
  const dim = Dimensions.get('screen');
  return dim.width >= dim.height;
}

String.prototype.replaceAt = function (index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

export function lowerCaseNoAccentuatedChars(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function renderSeparator() {
  return <View style={{ borderBottomColor: global.isDarkMode ? '#333' : '#eee', borderBottomWidth: StyleSheet.hairlineWidth * 2, }} />
}

export function plural(nb) {
  return nb > 1 ? 's' : '';
}

export function pluralize(nb, word) {
  return word + plural(nb);
}

export function pluralWord(nb, word) {
  return nb + ' ' + pluralize(nb, word);
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

export function getNowDateString() {
  return new Date(Date.now()).toISOString().replaceAt(10, ' ');
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
  return data.filter(item => (item.ORIGINE == origine));
}

export function makeAlbumUID(album) {
  // 009633-062007: ID_TOME*1000000 + ID_EDITION
  return album ? parseInt(album.ID_TOME) * 1000000 + parseInt(album.ID_EDITION) : 0;
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

export function createSeriesDict(array, dict) {
  return createDictFromArray(array, dict, (item) => item.ID_SERIE);
}

export function getAlbumIdxInArray(album, dict) {
  return dict ? dict[makeAlbumUID(album)] : null;
}

export function getSerieIdxInArray(id_serie, dict) {
  return dict ? dict[id_serie.toString()] : null;
}

export function addAlbumToArrayAndDict(album, array, dict) {
  const idx = array.push(album) - 1;
  dict[makeAlbumUID(album)] = idx;
  return idx;
}

export function addSerieToArrayAndDict(serie, array, dict) {
  const idx = array.push(serie) - 1;
  dict[serie.ID_SERIE] = idx;
  return idx;
}

export function removeAlbumFromArrayAndDict(album, array, dict) {
  const idx = getAlbumIdxInArray(album, dict);
  if (idx >= 0) {
    const uid = makeAlbumUID(album);
    delete dict[uid];
    array = array.splice(idx, 1);
    // Refresh dictionary according the new array order once the entry has been removed
    for (const [key, value] of Object.entries(dict)) {
      if (value > idx) {
        dict[key] = value - 1;
      }
    }
  }
}

export function removeSerieFromArrayAndDict(id_serie, array, dict) {
  const idx = getSerieIdxInArray(id_serie, dict);
  if (idx >= 0) {
    delete dict[id_serie];
    array = array.splice(idx, 1);
    // Refresh dictionary according the new array order once the entry has been removed
    for (const [key, value] of Object.entries(dict)) {
      if (value > idx) {
        dict[key] = value - 1;
      }
    }
  }
}

export function removeHTMLTags(text) {
  if (text) {
    text = text.replace(/<\!-(.*)\-->/g, '');
    text = text.replace(/<br>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, '$2');
    text = text.replace(/<(?:.|\s)*?>/g, '');
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&quot;/g, '\"');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&.*?;/gi, ' '); // catch any other "&...;" special chars
  }
  return text;
}

export function getAuteurs(album) {
  let auteursArray = [
    { name: album.depseudo, id: album.ID_DESSIN},
    { name: album.scpseudo, id: album.ID_SCENAR},
    { name: album.copseudo, id: album.ID_COLOR}];
  // Remove useless entries
  auteursArray = auteursArray.filter((item) => (item.name != null && item.name != '<n&b>' && item.name != '<indéterminé>'));
  // Remove duplicated entries
  auteursArray = auteursArray.filter((item, pos, self) => self.findIndex((it) => (it.id == item.id)) == pos);
  return auteursArray;
}

export function reverseAuteurName(name) {
  const names = name.split(', ');
  if (names.length >= 2) {
    return names[1] + ' ' + names[0];
  }
  return name;
}

export function isAlbumBW(album) {
  return album.copseudo == '<n&b>';
}

export function makeSection(title = '', data = []) {
  return { title, data };
}

export function convertDate(date) {
  //return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); // not supported on react
  return date.split('-').reverse().join('/');
}

export function getDateParutionAlbum(album) {
  let date = '';
  if (album.DTE_PARUTION) { date = convertDate(album.DTE_PARUTION); }
  else if (album.DATE_PARUTION_EDITION) { date = convertDate(album.DATE_PARUTION_EDITION); }
  if (date.startsWith('01/01/')) {
    // if date is on January 1st, it should means we don't have exact date, skip day and month
    date = date.substring(6);
  }
  if (date.startsWith('01/')) {
    // if day is 01, it might mean we don't have the exact day, so skip it to be safe
    date = date.substring(3);
  }
  return date;
}

export function showToast(isError, text1, text2 = '', duration = 1000) {
  Toast.show({
    visibilityTime: duration,
    autoHide: true,
    position: 'bottom',
    type: isError ? 'error' : 'success',
    text1,
    text2,
  });
}
