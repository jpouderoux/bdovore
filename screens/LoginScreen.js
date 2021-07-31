import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, Text, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import CommonStyles from '../styles/CommonStyles';
import * as APIManager from '../api/APIManager'
import { LinkText } from '../components/LinkText';

function LoginScreen({ navigation }) {

  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwd, setPasswd] = useState("dummypwd");
  const [pseudo, setPseudo] = useState('dummyuser');

  useEffect(() => {
    AsyncStorage.multiGet(['pseudo', 'passwd']).then((response) => {
      setPseudo(response[0][1]);
      setPasswd(response[1][1]); }).catch((error) => { console.log(error) });
  }, []);

  const onLoginPress = () => {
    setLoading(true);
    APIManager.loginBdovore(pseudo, passwd, onConnected);
  }

  const onConnected = (data) => {
    setLoading(false);
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
      setErrortext(data.error);
    }
  }

  return (
    <SafeAreaView style={CommonStyles.screenStyle}>
      <View style={{ margin: 30, alignItems: 'center' }}>
        <Image source={require('../assets/bdovore-167.png')} />
      </View>
      <View style={{ marginLeft: 20 }}>
        <Text style={{ alignItems: 'center' }}>Pseudo</Text>
      </View>
      <View style={styles.SectionStyle}>
        <TextInput
          style={styles.inputStyle}
          placeholder="Pseudo"
          autoCapitalize="none"
          returnKeyType="next"
          blurOnSubmit={false}
          value={pseudo}
          onChangeText={(pseudo) => setPseudo(pseudo)}
        />
      </View>
      <View style={{ marginLeft: 20 }}>
        <Text style={{ alignItems: 'center' }}>Mot de passe</Text>
      </View>
      <View style={styles.SectionStyle}>
        <TextInput
          style={styles.inputStyle}
          placeholder="Mot de passe"
          secureTextEntry={true}
          value={passwd}
          blurOnSubmit={true}
          returnKeyType="next"
          onChangeText={(passwd) => setPasswd(passwd)}
        />
      </View>
      {errortext != '' ? (
        <Text style={CommonStyles.errorTextStyle}>
          {errortext}
        </Text>
      ) : null}
      {
        loading ?
          <View style={{
            flex: 1,
            justifyContent: "center",
            flexDirection: "row",
            justifyContent: "space-around",
            padding: 10
          }}>
            <ActivityIndicator size="large" color="red" />
          </View> :
          <View>
            <TouchableOpacity
              style={styles.buttonStyle}
              onPress={onLoginPress}
              title="Login">
              <Text style={styles.buttonTextStyle}>Se connecter</Text>
            </TouchableOpacity>
            <LinkText
              text='Pas encore inscrit ?'
              url='https://www.bdovore.com/compte/inscription?'
              style={styles.registerTextStyle} />
          </View>
    }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionStyle: {
    flexDirection: 'row',
    height: 80,
    marginTop: 20,
    marginLeft: 35,
    marginRight: 35,
    margin: 10,
  },
  buttonTextStyle: {
    color: 'white',
    paddingVertical: 10,
    fontSize: 16,
  },
  buttonStyle: {
    backgroundColor: 'red',
    borderWidth: 0,
    color: 'white',
    borderColor: 'red',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 20,
    marginBottom: 25,
  },
  inputStyle: {
    margin: 12,
    color: 'black',
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: 'lightgrey',
  },
  registerTextStyle: {
    alignSelf: 'center',
    color: 'black',
    fontSize: 14,
    padding: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;
