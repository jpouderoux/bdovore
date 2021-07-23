/**
 * Bdovore mobile application
 *
 * @format
 * @flow strict-local
 */

import 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';

import React from 'react';

import {
  useColorScheme,
  Dimensions,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';

import MainTab from './routes/MainTab';

import EStyleSheet from 'react-native-extended-stylesheet';

import SplashScreen from "react-native-splash-screen";

const App: () => Node = () => {

  React.useEffect(() => {
    SplashScreen.hide();
  });

  let { height, width } = Dimensions.get('window');
  EStyleSheet.build({
    $rem: width > 340 ? 16 : 14
  });

  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <MainTab/>
    </NavigationContainer>
  );
};


export default App;
