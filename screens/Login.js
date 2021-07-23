import React, { useState } from 'react';
import { ActivityIndicator, Image, Linking, SafeAreaView, Text, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

function Login({ navigation }) {
  const [pseudo, setPseudo] = useState('pix3l');
  const [passwd, setPasswd] = useState("pxl0nBD");
  const [errortext, setErrortext] = useState('');
  const [loading, setLoading] = useState(false);

  const loginBdovore = () => {

    setErrortext('');
    if (!pseudo) {
      alert('Veuillez renseigner le pseudo.');
      return;
    }
    if (!passwd) {
      alert('Veuillez renseigner le mot de passe.');
      return;
    }
    setLoading(true);

    return fetch('https://www.bdovore.com/auth/gettoken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: encodeURI("user_login="+pseudo+"&user_password="+passwd)
    })
      .then((response) => response.json())
      .then((responseJson) => {
        //console.log(responseJson);
        setErrortext(responseJson.Error);
        if (responseJson.Error === '') {
          console.log("New token: " + responseJson.Token);
          AsyncStorage.setItem('Token', responseJson.Token).then((token) => {
            navigation.navigate('Ma collection');
          }, );
        } else {
          console.log("Erreur: " + responseJson.Error);
        }
      })
      .catch((error) => {
        setErrortext(error);
        console.error("Exception: {error}");
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
          onChangeText={(pseudo) =>
            setPseudo(pseudo)
          }
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
          onChangeText={(passwd) =>
            setPasswd(passwd)
          }
        />
      </View>
      {errortext != '' ? (
        <Text style={styles.errorTextStyle}>
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
            onPress={loginBdovore}
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
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
  },
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
  errorTextStyle: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
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

export default Login;
