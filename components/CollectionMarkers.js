import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet  from 'react-native-extended-stylesheet';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import * as APIManager from '../api/APIManager';
import CommonStyles from '../styles/CommonStyles';

const onGotIt = async (item, setGotIt) => {
};

const onWantIt = async (item, setWantIt) => {
  const wantIt = !(item.FLG_ACHAT && item.FLG_ACHAT != 'N');
  item.FLG_ACHAT = wantIt;
  setWantIt(wantIt);
  if (wantIt) {
    APIManager.updateAlbumInCollection(item.ID_TOME, () => { }, {
      'id_edition': item.ID_EDITION,
      'flg_achat': (wantIt ? 'O' : 'N')
    });
  }
  else {
    APIManager.deleteAlbumInCollection(item.ID_EDITION, () => { });
  }
};

export function CollectionMarkers({ item }) {
  const [gotIt, setGotIt] = useState(false);
  const [wantIt, setWantIt] = useState(false);
  const [idTome, setIdTome] = useState(0);
  let cachedIdTome = 0;

  useEffect(() => {
    if (cachedIdTome != item.ID_TOME) {
      cachedIdTome = item.ID_TOME;
      setIdTome(item.ID_TOME);
    }
  }, []);

  useEffect(() => {
    setWantIt(item.FLG_ACHAT && item.FLG_ACHAT != 'N');
  }, [idTome]);

  return (
    <View style={styles.viewStyle}>

      <TouchableOpacity onPress={() => onGotIt(item, setGotIt)} title="" style={styles.markerStyle}>
        <Icon name='check' size={25} color={gotIt ? 'red' : 'black'} style={styles.iconStyle} />
        <Text style={[styles.textStyle, { color: (gotIt ? 'red' : 'black') }]}>J'ai</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onWantIt(item, setWantIt)} title="" style={styles.markerStyle}>
        <Icon name={wantIt ? 'heart' : 'heart-outline'} size={25} color={wantIt ? 'red' : 'black'} style={styles.iconStyle} />
        <Text style={[styles.textStyle, { color: (wantIt ? 'red' : 'black')}]}>Je veux</Text>
      </TouchableOpacity>

    </View>);
}


const styles = EStyleSheet.create({
  viewStyle: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    right: 20,
  },
  markerStyle: {
    alignItems: 'center',
    alignContent: 'center',
    padding: 8,
  },
  iconStyle: {
    textAlign: 'center',
    paddingTop: 3,
    borderWidth: 1,
    borderColor: 'lightgrey',
    paddingLeft: 2,
    width: 32,
    height: 32
  },
  textStyle: {
    fontSize: 9,
  }
});
