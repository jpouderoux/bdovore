import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, SafeAreaView, Text, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import * as APIManager from '../api/APIManager'
import CommonStyles from '../styles/CommonStyles';

function LoginScreen({ navigation }) {
  const [pseudo, setPseudo] = useState('dummyuser');
  const [passwd, setPasswd] = useState("dummypwd");
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("effect");
    AsyncStorage.getItem('pseudo').then(v => setPseudo(v)).catch(() => { });
    AsyncStorage.getItem('passwd').then(v => setPasswd(v)).catch(() => { });

    // Make sure data is refreshed when login/token changed
    const willFocusSubscription = navigation.addListener('focus', () => {
    });
    return willFocusSubscription;
  }, []);

  const onLoginPress = () => {
    APIManager.loginBdovore(pseudo, passwd, { navigation: navigation, setErrortext: setErrortext, setLoading: setLoading });
  }

  return (
    <SafeAreaView>
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
            <ActivityIndicator size="large" color="#f00f0f" /></View> :
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={onLoginPress}
            title="Login"
          >
            <Text style={styles.buttonTextStyle}>Se connecter</Text>
          </TouchableOpacity>
      }
      <Text
        style={styles.registerTextStyle}
        onPress={() => { Linking.openURL("https://www.bdovore.com/compte/inscription?"); }}
      >
        Pas encore inscrit ?
      </Text>
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
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
  buttonStyle: {
    backgroundColor: '#f00f0f',
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#a00f0f',
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
    borderColor: '#dadae8',
  },
  registerTextStyle: {
    color: 'black',
    textDecorationLine: 'underline',
    textAlign: 'center',
    fontSize: 14,
    alignSelf: 'center',
    padding: 10,
  },
});

export default LoginScreen;
