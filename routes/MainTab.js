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

import React from 'react';
import { Share, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import AlbumScreen from '../screens/AlbumScreen';
import AuteurScreen from '../screens/AuteurScreen';
import CollectionScreen from '../screens/CollectionScreen';
import LoginScreen from '../screens/LoginScreen';
import NewsScreen from '../screens/NewsScreen';
import SearchScreen from '../screens/SearchScreen';
import SerieScreen from '../screens/SerieScreen';
import ToCompleteScreen from '../screens/ToCompleteScreen';
import WishlistScreen from '../screens/WishlistScreen';

const Tab = createBottomTabNavigator();

const CollectionStack = createStackNavigator();


const accountButton = (navigation) => {
  return (
    <TouchableOpacity onPress={() => onAccountPress(navigation)} style={{ margin: 8 }}>
      <MaterialCommunityIcons name='account-circle-outline' size={25} color='#222' />
    </TouchableOpacity>
  );
}

const onAccountPress = () => {
  navigation.navigate('Login');
};

const shareButton = (item) => {
  return (
    <TouchableOpacity onPress={() => onSharePress(item)} style={{ margin: 8 }}>
      <MaterialCommunityIcons name='share-variant' size={25} color='#222' />
    </TouchableOpacity>
  );
}

const onSharePress = async (item) => {
  console.log("share");
  Share.share({
    message: 'https://www.bdovore.com/Album?id_tome=' + item.ID_TOME,
    url: 'https://www.bdovore.com/Album?id_tome=' + item.ID_TOME
    ,
  });
}

function CollectionScreens({navigation}) {

  return (
    <CollectionStack.Navigator>
      <CollectionStack.Screen name='Ma collection'
      component={CollectionScreen}
        options={({route}) => ({
          headerLeft: () => accountButton(navigation)
        })} />
      <CollectionStack.Screen name='Login' component={LoginScreen} />
      <CollectionStack.Screen name='Serie' component={SerieScreen}
        options={({ route }) => ({ title: route.params.item.NOM_SERIE })} />
      <CollectionStack.Screen name='Album' component={AlbumScreen}
        options={({ route }) => ({
          title: route.params.item.TITRE_TOME,
          headerRight: () => shareButton(route.params.item)
        })} />
    </CollectionStack.Navigator>
  );
}

function WishlistScreens({ navigation }) {
  return (
    <CollectionStack.Navigator>
      <CollectionStack.Screen name='Mes envies BD' component={WishlistScreen} />
      <CollectionStack.Screen name='Serie' component={SerieScreen}
        options={({ route }) => ({ title: route.params.item.NOM_SERIE })} />
      <CollectionStack.Screen name='Album' component={AlbumScreen}
        options={({ route }) => ({
          title: route.params.item.TITRE_TOME,
          headerRight: () => shareButton(route.params.item)
        })} />
    </CollectionStack.Navigator>
  );
}

function ToCompleteScreens({ navigation }) {
  return (
    <CollectionStack.Navigator>
      <CollectionStack.Screen name='Albums manquants' component={ToCompleteScreen} />
      <CollectionStack.Screen name='Serie' component={SerieScreen}
        options={({ route }) => ({ title: route.params.item.NOM_SERIE })} />
      <CollectionStack.Screen name='Album' component={AlbumScreen}
        options={({ route }) => ({
          title: route.params.item.TITRE_TOME,
          headerRight: () => shareButton(route.params.item)
        })} />
    </CollectionStack.Navigator>
  );
}

function NewsScreens({ navigation }) {
  return (
    <CollectionStack.Navigator>
      <CollectionStack.Screen name='Actualité' component={NewsScreen} />
      <CollectionStack.Screen name='Album' component={AlbumScreen}
        options={({ route }) => ({
          title: route.params.item.TITRE_TOME,
          headerRight: () => shareButton(route.params.item)
        })} />
    </CollectionStack.Navigator>
  );
}

function SearchScreens({ navigation }) {
  return (
    <CollectionStack.Navigator>
      <CollectionStack.Screen name='Rechercher' component={SearchScreen} />
      <CollectionStack.Screen name='Serie' component={SerieScreen}
        options={({ route }) => ({ title: route.params.item.NOM_SERIE })} />
      <CollectionStack.Screen name='Album' component={AlbumScreen}
      options={({ route }) => ({
        title: route.params.item.TITRE_TOME,
        headerRight: () => shareButton(route.params.item)
      })} />
      <CollectionStack.Screen name='Auteur' component={AuteurScreen}
        options={({ route }) => ({ title: route.params.item.PSEUDO })} />
    </CollectionStack.Navigator>
  );
}

function MainTab() {

  const setTabBarIonicons = (icon, params) => {
    return (
      <Ionicons name={icon} color={params.color} size={params.size}/>
    );
  };

  const setTabBarMatComIcons = (icon, params) => {
    return (
      <MaterialCommunityIcons name={icon} color={params.color} size={params.size} />
    );
  };

  const setTabBarMatIcons = (icon, params) => {
    return (
      <MaterialIcons name={icon} color={params.color} size={params.size} />
    );
  };

  return (
    <Tab.Navigator
      initialRouteName='Ma collection'
      screenOptions={{ gestureEnabled: false }}
    >
      <Tab.Screen
        name='Wishlist'
        component={WishlistScreens}
        options={{
          tabBarIcon: (p) =>  {
            return setTabBarMatComIcons('heart', p); }
        }}
      />
      <Tab.Screen
        name='A compléter'
        component={ToCompleteScreens}
        options={{
          tabBarIcon: (p) => {
            return setTabBarMatIcons('list-alt', p);
          }
        }}
      />
      <Tab.Screen
        name='Ma collection'
        component={CollectionScreens}
        options={{
          tabBarIcon: (p) => {
            return setTabBarMatComIcons('home', p);
          }
        }}
      />
      <Tab.Screen
        name='Actualité'
        component={NewsScreens}
        options={{
          tabBarIcon: (p) => {
            return setTabBarMatIcons('fiber-new', p); }
        }}
      />
      <Tab.Screen
        name='Rechercher'
        component={SearchScreens}
        options={{
          tabBarIcon: (p) => {
            return setTabBarMatIcons('search', p);
          }
        }}
      />
    </Tab.Navigator>
  );
}

export default MainTab;
