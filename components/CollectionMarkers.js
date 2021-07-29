import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet  from 'react-native-extended-stylesheet';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';

const onGotIt = async (item, setGotIt) => {
  const idxCol = Helpers.getAlbumIdxInArray(item, global.collectionAlbumsDict);
  if (!idxCol) {
    // If album is in not collection yet, let's add it
    setGotIt(true);
    APIManager.updateAlbumInCollection(item.ID_TOME, () => { }, {
      'id_edition': item.ID_EDITION,
      'flg_achat': 'N'
    });
    Helpers.addAlbumToArrayAndDict(item, global.collectionAlbums, global.collectionAlbumsDict);
  }
  else {
    setGotIt(false);
    // If album is marked "I want" it wishlist, do not remove it from the collection
    const idx = Helpers.getAlbumIdxInArray(item, global.wishlistAlbumsDict);
    if (!idx || (global.wishlistAlbums[idx].FLG_ACHAT = 'N')) {
      APIManager.deleteAlbumInCollection(item.ID_EDITION, () => { });
    }
    // Remove the album from the collection
    Helpers.removeAlbumFromArrayAndDict(item, global.wishlistAlbums, global.wishlistAlbumsDict)
  }
};

const onWantIt = async (item, setWantIt) => {
  // Switch the want it flag
  const wantIt = !(item.FLG_ACHAT && item.FLG_ACHAT != 'N');
  item.FLG_ACHAT = wantIt;
  setWantIt(wantIt);
  if (wantIt) {
    APIManager.updateAlbumInCollection(item.ID_TOME, () => { }, {
      'id_edition': item.ID_EDITION,
      'flg_achat': 'O',
    });
    // Add the album to the wishlist with the FLG_ACHAT flag
    item.FLG_ACHAT = true;
    Helpers.addAlbumToArrayAndDict(item, global.wishlistAlbums, global.wishlistAlbumsDict);
  }
  else {
    // Mark the album as not wanted (FLG_ACHAT='N')
    const idx = Helpers.getAlbumIdxInArray(item, global.wishlistAlbumsDict);
    if (idx) {
      global.wishlistAlbums[idx].FLG_ACHAT = 'N';
    }
    // Delete the album from the server collection if it is in our client side collection copy
    const idxCol = Helpers.getAlbumIdxInArray(item, global.collectionAlbumsDict);
    if (!idxCol) {
      APIManager.deleteAlbumInCollection(item.ID_EDITION, () => { });
    }
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
    const idx = Helpers.getAlbumIdxInArray(item, global.wishlistAlbumsDict);
    if (idx) {
      const album = global.wishlistAlbums[idx];
      setWantIt(album.FLG_ACHAT && album.FLG_ACHAT != 'N');
    } else {
      setWantIt(item.FLG_ACHAT && item.FLG_ACHAT != 'N');
    }

    const idxCol = Helpers.getAlbumIdxInArray(item, global.collectionAlbumsDict);
    setGotIt(idxCol ? true : false);
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
    borderWidth: 0.5,
    borderColor: 'lightgrey',
    paddingLeft: 2,
    width: 32,
    height: 32
  },
  textStyle: {
    fontSize: 9,
  }
});
