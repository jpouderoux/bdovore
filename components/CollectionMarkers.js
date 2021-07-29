import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet  from 'react-native-extended-stylesheet';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import CommonStyles from '../styles/CommonStyles';

const onGotIt = (item) => {

};

const onWantIt = (item) => {

};

export function CollectionMarkers({ item, gotIt, wantIt}) {
  return (
    <View style={styles.viewStyle}>

      <TouchableOpacity onPress={onGotIt(item)} title="" style={styles.markerStyle}>
        <Icon name='check' size={25} color={gotIt ? 'red' : 'black'} style={styles.iconStyle} />
        <Text style={styles.textStyle}>J'ai</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onWantIt(item)} title="" style={styles.markerStyle}>
        <Icon name={wantIt ? 'heart' : 'heart-outline'} size={25} color={wantIt ? 'red' : 'black'} style={styles.iconStyle} />
        <Text style={styles.textStyle}>Je veux</Text>
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
