import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View  } from 'react-native';

export function renderSeparator() {
  return <View style={{ borderBottomColor: '#eee', borderBottomWidth: StyleSheet.hairlineWidth * 2, }} />
};

export function plural(nb) {
  return nb > 1 ? 's' : '';
}
