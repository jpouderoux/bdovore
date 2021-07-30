import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet  from 'react-native-extended-stylesheet';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';


export function CollectionMarkers({ item, style, reduceMode }) {
  const [gotIt, setGotIt] = useState(false);
  const [wantIt, setWantIt] = useState(false);
  const [readIt, setReadIt] = useState(false);
  const [lendIt, setLendIt] = useState(false);
  const [numEd, setNumEd] = useState(false);
  const [present, setPresent] = useState(false);
  const [showAllMarks, setShowAllMarks] = useState(false);

  const [idTome, setIdTome] = useState(0);
  let cachedIdTome = 0;

  useEffect(() => {
    if (cachedIdTome != item.ID_TOME) {
      cachedIdTome = item.ID_TOME;
      setIdTome(item.ID_TOME);
    }
    const isInCollec = Helpers.getAlbumIdxInArray(item, global.collectionAlbumsDict) >= 0;
    setGotIt(isInCollec);
    setShowAllMarks(reduceMode ? false :isInCollec);
  }, []);

  useEffect(() => {
    const idx = Helpers.getAlbumIdxInArray(item, global.wishlistAlbumsDict);
    if (idx) {
      const album = global.wishlistAlbums[idx];
      setWantIt(album.FLG_ACHAT && album.FLG_ACHAT != 'N');
    } else {
      setWantIt(item.FLG_ACHAT && item.FLG_ACHAT != 'N');
    }

    const isInCollec = Helpers.getAlbumIdxInArray(item, global.collectionAlbumsDict) >= 0;
    setGotIt(isInCollec);
    setShowAllMarks(reduceMode ? false : isInCollec);
  }, [idTome]);


  const onGotIt = async (item) => {
    const idxCol = Helpers.getAlbumIdxInArray(item, global.collectionAlbumsDict);
    if (!idxCol) {
      // If album is in not collection yet, let's add it
      setGotIt(true);
      setShowAllMarks(reduceMode ? false : true);
      APIManager.updateAlbumInCollection(item.ID_TOME, () => { }, {
        'id_edition': item.ID_EDITION,
        'flg_achat': 'N'
      });
      Helpers.addAlbumToArrayAndDict(item, global.collectionAlbums, global.collectionAlbumsDict);
    }
    else {
      setGotIt(false);
      setShowAllMarks(false);
      // If album is marked "I want" it wishlist, do not remove it from the collection
      const idx = Helpers.getAlbumIdxInArray(item, global.wishlistAlbumsDict);
      if (!idx || (global.wishlistAlbums[idx].FLG_ACHAT = 'N')) {
        APIManager.deleteAlbumInCollection(item.ID_EDITION, () => { });
      }
      // Remove the album from the collection
      Helpers.removeAlbumFromArrayAndDict(item, global.collectionAlbums, global.collectionAlbumsDict);
    }
  };

  const onWantIt = async (item) => {
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

  const onReadIt = async (item) => {
    const readIt = !(item.FLG_LU && item.FLG_LU != 'N');
    item.FLG_LU = readIt;
    setReadIt(readIt);
    APIManager.updateAlbumInCollection(item.ID_TOME, () => { }, {
      'id_edition': item.ID_EDITION,
      'flg_lu': readIt ? 'O' : 'N',
    });
  };

  const onLendIt = async (item) => {
    const lendIt = !(item.FLG_PRET && item.FLG_PRET != 'N');
    item.FLG_PRET = lendIt;
    setLendIt(lendIt);
    APIManager.updateAlbumInCollection(item.ID_TOME, () => { }, {
      'id_edition': item.ID_EDITION,
      'flg_pret': lendIt ? 'O' : 'N',
    });
  };

  const onNumEd = async (item) => {
    const numEd = !(item.FLG_NUM && item.FLG_NUM != 'N');
    item.FLG_NUM = numEd;
    setNumEd(numEd);
    APIManager.updateAlbumInCollection(item.ID_TOME, () => { }, {
      'id_edition': item.ID_EDITION,
      'flg_num': numEd ? 'O' : 'N',
    });
  };

  const onPresent = async (item) => {
    const present = !(item.FLG_CADEAU && item.FLG_CADEAU != 'N');
    item.FLG_CADEAU = present;
    setPresent(present);
    APIManager.updateAlbumInCollection(item.ID_TOME, () => { }, {
      'id_edition': item.ID_EDITION,
      'flg_cadeau': present ? 'O' : 'N',
    });
  };


  return (
    <View style={[styles.viewStyle, style]}>

      <TouchableOpacity onPress={() => onGotIt(item)} title="" style={styles.markerStyle}>
        <Icon name='check' size={25} color={gotIt ? 'green' : 'black'} style={styles.iconStyle} />
        <Text style={[styles.textStyle, { color: (gotIt ? 'green' : 'black') }]}>J'ai</Text>
      </TouchableOpacity>

      {!gotIt ?
      <TouchableOpacity onPress={() => onWantIt(item)} title="" style={styles.markerStyle}>
        <Icon name={wantIt ? 'heart' : 'heart-outline'} size={25} color={wantIt ? 'red' : 'black'} style={styles.iconStyle} />
        <Text style={[styles.textStyle, { color: (wantIt ? 'red' : 'black')}]}>Je veux</Text>
      </TouchableOpacity> : null}

      {showAllMarks ?
      <TouchableOpacity onPress={() => onReadIt(item)} title="" style={styles.markerStyle}>
        <MaterialCommunityIcons name={readIt ? 'book' : 'book-outline'} size={25} color={readIt ? 'red' : 'black'} style={styles.iconStyle} />
        <Text style={[styles.textStyle, { color: (readIt ? 'red' : 'black') }]}>Lu</Text>
      </TouchableOpacity> : null}

      {showAllMarks ?
      <TouchableOpacity onPress={() => onLendIt(item)} title="" style={styles.markerStyle}>
        <Ionicons name={lendIt ? 'ios-person-add' : 'ios-person-add-outline'} size={25} color={lendIt ? 'red' : 'black'} style={styles.iconStyle} />
        <Text style={[styles.textStyle, { color: (lendIt ? 'red' : 'black') }]}>Prêt</Text>
      </TouchableOpacity> : null}

      {showAllMarks ?
      <TouchableOpacity onPress={() => onNumEd(item)} title="" style={styles.markerStyle}>
          <MaterialIcons name={numEd ? 'devices' : 'devices'} size={25} color={numEd ? 'red' : 'black'} style={styles.iconStyle} />
        <Text style={[styles.textStyle, { color: (numEd ? 'red' : 'black') }]}>Ed. Num.</Text>
      </TouchableOpacity> : null}

      {showAllMarks ?
      <TouchableOpacity onPress={() => onPresent(item)} title="" style={styles.markerStyle}>
        <MaterialCommunityIcons name= {present ? 'gift' : 'gift-outline'} size={25} color={present ? 'red' : 'black'} style={styles.iconStyle} />
        <Text style={[styles.textStyle, { color: (present ? 'red' : 'black') }]}>Cadeau</Text>
      </TouchableOpacity> : null}

    </View>);
}

const styles = EStyleSheet.create({
  viewStyle: {
    flexDirection: 'row',
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
