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
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CommonStyles } from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager'
import { LinkText } from '../components/LinkText';
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
          <LinkText
            text='Pas encore inscrit ?'
            url='https://www.bdovore.com/compte/inscription?'
            style={[CommonStyles.loginRegisterTextStyle, CommonStyles.linkTextStyle]} />
        </View>
      }
    </View>
  );
}

export default LoginScreen;
