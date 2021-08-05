import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function BarcodeScanner({ route, navigation }) {

  const [torchOn, setTorchOn] = useState(false);
  const [eanFound, setEanFound] = useState(false);

  const onBarCodeRead = (e) => {
    if (!eanFound) {
      setEanFound(true);
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
        <Text style={{
          backgroundColor: 'white',
          fontSize: 18,
          margin: 5
        }}>
          {'  '}Scannez le code barre de l'album{'  '}
        </Text>
      </RNCamera>
      <View style={styles.bottomOverlay}>
        <TouchableOpacity onPress={handleTorch}>
          <MaterialCommunityIcons name={torchOn ? 'flashlight' : 'flashlight-off'} size={30} color={torchOn ? 'orange' : 'black'} style={styles.cameraIcon} />
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
    alignItems: 'center'
  },
  cameraIcon: {
    margin: 10,
    height: 40,
    width: 40,
    padding: 5,
    backgroundColor: 'white',
  },
  bottomOverlay: {
    position: "absolute",
    right: 0
  },
});

export default BarcodeScanner;
