import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TextInput } from 'react-native';

function AboutScreen(props) {
  return (
    <SafeAreaView>
      <Image style={styles.container} source={require('../app/assets/bdovore-167.png')} />
      <Text>About</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AboutScreen;
