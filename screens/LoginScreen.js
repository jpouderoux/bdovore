/* Copyright 2021 Joachim Pouderoux & Association Bdovore
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

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Linking, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import NetInfo from "@react-native-community/netinfo";

import { CommonStyles } from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';
import { SmallLoadingIndicator } from '../components/SmallLoadingIndicator';
import CollectionManager from '../api/CollectionManager';

const pkg = require('../app.json');

function LoginScreen({ navigation }) {

  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwd, setPasswd] = useState("dummypwd");
  const [pseudo, setPseudo] = useState('dummyuser');
  const [showAbout, setShowAbout] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;  // Initial value for opacity: 0

  useEffect(() => {
    AsyncStorage.multiGet(['pseudo', 'passwd']).then((response) => {
      setPseudo(response[0][1]);
      setPasswd(response[1][1]);
    }).catch((error) => { console.debug(error) });
  }, []);

  const onLoginPress = () => {
    setLoading(true);
    global.isConnected = true;
    //if (global.isConnected) {
      APIManager.loginBdovore(pseudo, passwd, onConnected);
    /*} else {
      Helpers.showToast(false, "Utilisation en mode off-line.", "Connexion internet désactivée.")
      onConnected({ error: '', token: 'offline-' + Date.now() });
    }*/
  }

  const onOfflinePress = () => {
    global.isConnected = false;
    Helpers.showToast(false, "Utilisation en mode off-line.", "Connexion internet désactivée.")
    onConnected({ error: '', token: 'offline-' + Date.now() });
  }

  const onConnected = (data) => {
    setLoading(false);
    setErrortext(data.error);

    if (data.error == '') {
      CollectionManager.initialize();
      AsyncStorage.setItem('token', data.token).then(() => {
        AsyncStorage.multiSet([
          ['pseudo', pseudo],
          ['passwd', passwd],
          ['collecFetched', 'false']], () => { });
        navigation.goBack();
      });
    }
    else {
      console.debug('error on connection: ' + data.error);
    }
  }

  const onRegister = async () => {
    try {
      const url = APIManager.bdovoreBaseURL + '/compte/inscription';
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'Cancel',
          preferredBarTintColor: '#FFFFFF',
          preferredControlTintColor: 'blue',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'fullScreen',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: false,
          toolbarColor: 'white',
          secondaryToolbarColor: 'black',
          navigationBarColor: 'black',
          navigationBarDividerColor: 'blue',
          enableUrlBarHiding: true,
          enableDefaultShare: false,
          forceCloseOnRedirection: false,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right'
          },
          headers: {
            'my-custom-header': 'Créer mon compte'
          }
        })
        //console.debug(JSON.stringify(result));
      }
      else {
        Linking.openURL(url);
      }
    } catch (error) {
      Helpers.showToast(true, error.message);
    }
  }

  const onAboutPress = () => {
    setShowAbout(showAbout => !showAbout);
    fadeAnim.setValue(0);
    if (!showAbout) {
      Animated.timing(
        fadeAnim,
        {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }
      ).start();
    }
  }

  const onToggleSponsoredLinks = () => {
    if (Platform.OS != 'ios') {
      global.hideSponsoredLinks = !global.hideSponsoredLinks;
      AsyncStorage.setItem('hideSponsoredLinks', global.hideSponsoredLinks.toString());
      Helpers.showToast(false, 'Sponsored linked are now ' + (global.hideSponsoredLinks ? 'disabled' : 'enabled') + '!');
    }
  }

  return (
    <View style={CommonStyles.screenStyle}>
      <ScrollView>
        <View style={{ marginTop: 10, alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.0)' }}>
          <TouchableOpacity onPress={onAboutPress}
            title='About'>
            <Image source={require('../assets/bdovore-167.png')} />
          </TouchableOpacity>
        </View>
        <Text style={[CommonStyles.defaultText, { marginTop: 0, marginBottom: 15, textAlign: 'center' }]}>Connectez vous avec votre compte Bdovore</Text>
        <Text style={[CommonStyles.defaultText, { textAlign: 'center' }]}>Login</Text>
        <TextInput
          style={[CommonStyles.SectionStyle, CommonStyles.loginInputTextStyle]}
          placeholder='Login'
          autoCapitalize='none'
          returnKeyType='next'
          blurOnSubmit={false}
          value={pseudo}
          textContentType='username'  // iOS
          autoCompleteType='username' // Android
          onChangeText={(pseudo) => setPseudo(pseudo)}
        />
        <Text style={[CommonStyles.defaultText, { textAlign: 'center' }]}>Mot de passe</Text>
        <TextInput
          style={[CommonStyles.SectionStyle, CommonStyles.loginInputTextStyle]}
          placeholder='Mot de passe'
          secureTextEntry={true}
          value={passwd}
          autoCapitalize='none'
          blurOnSubmit={true}
          returnKeyType='next'
          textContentType='password'  // iOS
          autoCompleteType='password' // Android
          onChangeText={(passwd) => setPasswd(passwd)}
        />
        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        {loading ?
          <SmallLoadingIndicator style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            padding: 10
          }} /> :
          <View>
            <TouchableOpacity
              style={CommonStyles.loginConnectionButtonStyle}
              onPress={onLoginPress}
              title='Login'>
              <Text style={CommonStyles.loginConnectionTextStyle}>Se connecter</Text>
            </TouchableOpacity>
            <Text onPress={onOfflinePress} style={[CommonStyles.linkTextStyle, { textAlign: 'center', marginBottom: 10 }]}>Mode offline</Text>
            <Text style={[CommonStyles.defaultText, { textAlign: 'center' }]}>Vous n'avez pas encore de compte ?</Text>
            <Text style={[CommonStyles.defaultText, { textAlign: 'center' }]}>Rendez-vous sur bdovore.com pour en créer un gratuitement.</Text>
            <Text style={[CommonStyles.linkTextStyle, { marginTop: 10, textAlign: 'center' }]} onPress={onRegister}>Créer mon compte</Text>
          </View>
        }
        {showAbout ?
          <Animated.View style={[CommonStyles.commentsTextInputStyle, {
            flexDirection: 'column', width: null, alignItems: 'center', marginVertical: 20, opacity: fadeAnim, marginLeft: 35, marginRight: 35, borderRadius: 30
          }]}>
            <Text style={[CommonStyles.defaultText, CommonStyles.bold, { marginVertical: 10 }]}>{pkg.displayName} - {Platform.OS == 'ios' ? 'iOS' : 'Android'}</Text>
            <Text style={[CommonStyles.defaultText]}>Version {pkg.version} - Septembre 2021</Text>
            <Text style={[CommonStyles.defaultText, { marginVertical: 10 }]} onPress={onToggleSponsoredLinks}>Code by Joachim Pouderoux & Thomas Cohu</Text>
          </Animated.View> : null
        }
        <View style={{height: 20}}></View>
      </ScrollView>
    </View>
  );
}

export default LoginScreen;
