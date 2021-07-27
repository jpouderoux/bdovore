import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View  } from 'react-native';

import * as APIManager from '../api/APIManager';

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
