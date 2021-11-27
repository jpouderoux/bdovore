/* Copyright 2021 Joachim Pouderoux & Association BDovore
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

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';

import CollectionManager from '../api/CollectionManager';
import { CommonStyles, bdovored } from '../styles/CommonStyles';
import { Icon } from '../components/Icon';
import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';

let eanFound = false;

function BarcodeScanner({ route, navigation }) {
  const [autoAddMode, setAutoAddMode] = useState(false);
  const [lastEan, setLastEan] = useState('');
  const [loading, setLoading] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [nbAddedAlbums, setNbAddedAlbums] = useState(0);
  const [lastAddedAlbum, setLastAddedAlbum] = useState('');

  useEffect(() => {
    const willFocusSubscription = navigation.addListener('focus', () => {
      eanFound = false;
    });
    return willFocusSubscription;
  }, []);

  const searchAndAddAlbumWithEAN = (ean) => {
    if (lastEan != ean) {
      setLastEan(ean);
      setLoading(true);
      let params = (ean.length > 10) ? { EAN: ean } : { ISBN: ean };
      APIManager.fetchAlbum((result) => {
        if (result.error == '' && result.items.length > 0) {
          const album = result.items[0];
          let albumName = Helpers.getAlbumName(album);
          albumName += (albumName != album.NOM_SERIE ? ' / ' + album.NOM_SERIE : '');
          if (!CollectionManager.isAlbumInCollection(album)) {
            CollectionManager.addAlbumToCollection(album);
            Helpers.showToast(false,
              'Nouvel album ajouté à la collection',
              albumName);
            setNbAddedAlbums(nbAddedAlbums => nbAddedAlbums + 1);
            setLastAddedAlbum(albumName);
          } else {
            Helpers.showToast(true,
              'Album déjà présent dans la collection',
              albumName);
          }
        } else {
          Helpers.showToast(true,
            "Aucun album trouvé avec ce code",
            "Essayez la recherche textuelle avec le nom de la série ou de l'album");
        }
        eanFound = false;
        setLoading(false);
      }, params);
    } else {
      eanFound = false;
    }
  }

  const onBarCodeRead = (e) => {
    const ean = e.data;
    //console.log('ean detected ' + ean + ' ' + eanFound);
    if (!eanFound && ean) {
      eanFound = true; // needed to avoid reentry
      if (autoAddMode) {
        if (global.isConnected) {
          searchAndAddAlbumWithEAN(ean);
        } else {
          Helpers.showToast(true,
            "Connexion internet désactivée",
            "Rechercher de l'album impossible");
          eanFound = false;
        }
      } else {
        setLoading(true);
        let params = (ean.length > 10) ? { EAN: ean } : { ISBN: ean };
        APIManager.fetchAlbum((result) => {
          if (result.error == '' && result.items.length > 0) {
            navigation.goBack();
            navigation.push('Album', { item: result.items[0] })
          } else {
            Helpers.showToast(true,
              "Aucun album trouvé",
              "Aucun album trouvé avec ce code. Essayez la recherche textuelle avec le nom de la série ou de l'album.");
          }
          eanFound = false;
          setLoading(false);
        }, params);
      }
      /*route.params.onGoBack(ean);
      }*/
    }
  }

  const onTorchPress = () => {
    setTorchOn(!torchOn);
  }

  const onAutoAddModePress = () => {
    setAutoAddMode(global.isConnected ? !autoAddMode : false);
  }

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        flashMode={torchOn ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
        onBarCodeRead={onBarCodeRead}
        barCodeTypes={[RNCamera.Constants.BarCodeType.ean13, RNCamera.Constants.BarCodeType.ean8]}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: 'Permission d\'utilisation de la caméra',
          message: 'Nous avons besoin de votre autorisation pour utiliser la caméra',
          buttonPositive: 'Ok',
          buttonNegative: 'Annuler',
        }}>
        <View style={{ position: 'absolute', top: 0, width: '100%', backgroundColor: 'white', flexDirection: 'row', padding: 5 }}>
          <Icon name='barcode' collection='FontAwesome5' size={45} color='black' style={{ marginLeft: 5 }} />
          {loading ? <ActivityIndicator size="small" color={bdovored} style={[CommonStyles.markerIconStyle, { borderWidth: 0 }]} /> : null}
          <Text style={{ width: '80%', alignSelf: 'center', textAlign: 'center', backgroundColor: 'white', fontSize: 14, margin: 5, paddingLeft: 10, }}>
            {!autoAddMode ? "Visez le code-barre de l'album.\nLa recherche est automatique." : (
              (nbAddedAlbums == 0 ?
                <Text style={{ fontSize: 14, textAlign: 'center' }}>
                  Mode ajout automatique activé : les albums{'\n'}
                  détectés seront ajoutés à votre collection.
                </Text> :
                <Text style={{ fontSize: 15, textAlign: 'center', }} numberOfLines={2} textBreakStrategy='balanced'>
                  {Helpers.pluralWord(nbAddedAlbums, 'album') + ' ' + Helpers.pluralize(nbAddedAlbums, 'ajouté')}.{'\n'}
                  Dernier ajout : {lastAddedAlbum}
                </Text>))}
          </Text>
        </View>
      </RNCamera>
      <View style={{ position: "absolute", right: 0, bottom: 5 }}>
        <TouchableOpacity onPress={onAutoAddModePress}>
          <Icon name={'playlist-add'} collection={'MaterialIcons'} size={30} color={autoAddMode ? bdovored : 'black'} style={styles.cameraIcon} />
        </TouchableOpacity>
      </View>
      <View style={{ position: "absolute", right: 0, bottom: 65 }}>
        <TouchableOpacity onPress={onTorchPress}>
          <Icon name={torchOn ? 'flashlight' : 'flashlight-outline'} collection='Ionicons' size={30} color={torchOn ? 'orange' : 'black'} style={styles.cameraIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cameraIcon: {
    margin: 10,
    height: 40,
    width: 40,
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 30,
  },
  bottomOverlay: {
    position: "absolute",
    right: 0,
  },
});

export default BarcodeScanner;
