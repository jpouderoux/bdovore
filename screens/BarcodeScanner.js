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

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';

import { Icon } from '../components/Icon';

function BarcodeScanner({ route, navigation }) {

  const [torchOn, setTorchOn] = useState(false);
  const [eanFound, setEanFound] = useState(false);

  const onBarCodeRead = (e) => {
    if (!eanFound) {
      setEanFound(true); // needed to avoid reentry
      navigation.goBack();
      route.params.onGoBack(e.data);
    }
  }

  const handleTorch = () => {
    setTorchOn(!torchOn);
  }

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.preview}
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
        <View style={{ width: '100%', backgroundColor: 'white', flexDirection: 'row', padding: 5 }}>
        <Icon
          name='barcode'
          size={45}
          color='black' />
        <Text style={{
          backgroundColor: 'white',
          fontSize: 14,
          margin: 5,
          paddingLeft: 10,
        }}>
          Placez le code-barre à scanner dans la fenêtre.{'\n'}La recherche commence automatiquement.{'  '}
        </Text>
        </View>
      </RNCamera>
      <View style={styles.bottomOverlay}>
        <TouchableOpacity onPress={handleTorch}>
          <Icon name={torchOn ? 'flashlight' : 'flashlight-off'} size={30} color={torchOn ? 'orange' : 'black'} style={styles.cameraIcon} />
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
