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

import React, { useEffect, useState } from 'react';
import { Button, Image, Linking, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';

import { CommonStyles } from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';
import { SmallLoadingIndicator } from '../components/SmallLoadingIndicator';

function LoginScreen({ navigation }) {

  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwd, setPasswd] = useState("dummypwd");
  const [pseudo, setPseudo] = useState('dummyuser');

  useEffect(() => {
    AsyncStorage.multiGet(['pseudo', 'passwd']).then((response) => {
      setPseudo(response[0][1]);
      setPasswd(response[1][1]);
    }).catch((error) => { console.log(error) });
  }, []);

  const onLoginPress = () => {
    setLoading(true);
    APIManager.loginBdovore(pseudo, passwd, onConnected);
  }

  const onConnected = (data) => {
    setLoading(false);
    setErrortext(data.error);

    if (data.error == '') {
      AsyncStorage.setItem('token', data.token).then(() => {
        AsyncStorage.multiSet([
          ['pseudo', pseudo],
          ['passwd', passwd],
          ['collecFetched', 'false']], () => { });
        navigation.goBack();
      }
      );
    }
    else {
      console.log('error on connection: ' + data.error);
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
        //console.log(JSON.stringify(result));
      }
      else {
        Linking.openURL(url);
      }
    } catch (error) {
      Helpers.showToast(true, error.message);
    }
  }

  return (
    <View style={CommonStyles.screenStyle}>
      <View style={{ marginTop: 10, alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.0)' }}>
        <Image source={require('../assets/bdovore-167.png')} />
      </View>
      <Text style={[CommonStyles.defaultText, {  marginTop: 0, marginBottom: 15, textAlign: 'center' }]}>Connectez vous avec votre compte Bdovore</Text>
      <Text style={[CommonStyles.defaultText,{ textAlign: 'center'  }]}>Login</Text>
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
      <Text style={[CommonStyles.defaultText,{ textAlign: 'center' }]}>Mot de passe</Text>
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
          <Text style={[CommonStyles.defaultText, { textAlign: 'center' }]}>Vous n'avez pas encore de compte ?</Text>
          <Text style={[CommonStyles.defaultText, { textAlign: 'center' }]}>Rendez-vous sur bdovore.com pour en créer un gratuitement.</Text>
          <Text style={[CommonStyles.linkTextStyle, { marginTop: 10, textAlign: 'center' }]} onPress={onRegister}>Créer mon compte</Text>
        </View>
      }
    </View>
  );
}

export default LoginScreen;
