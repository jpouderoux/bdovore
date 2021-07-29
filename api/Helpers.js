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
  return data.filter(item => item.data.length > 0);
}
