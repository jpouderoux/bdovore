import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Ionicons from 'react-native-vector-icons/Ionicons';
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

function CollectionScreens({navigation}) {

  const onAccountPress = () => {
    navigation.navigate('Login');
  };

  const accountButton = () => {
    return (
      <TouchableOpacity onPress={onAccountPress} style={{ margin: 8 }}>
        <MaterialCommunityIcons name='account-circle-outline' size={25} color='#222' />
      </TouchableOpacity>
    );
  }

  return (
    <CollectionStack.Navigator>
      <CollectionStack.Screen name='Ma collection'
      component={CollectionScreen}
        options={({route}) => ({
          headerLeft: accountButton
        })} />
      <CollectionStack.Screen name='Login' component={LoginScreen} />
      <CollectionStack.Screen name='Serie' component={SerieScreen}
        options={({ route }) => ({ title: route.params.item.NOM_SERIE })} />
      <CollectionStack.Screen name='Album' component={AlbumScreen}
        options={({ route }) => ({ title: route.params.item.TITRE_TOME })} />
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
        options={({ route }) => ({ title: route.params.item.TITRE_TOME })} />
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
        options={({ route }) => ({ title: route.params.item.TITRE_TOME })} />
    </CollectionStack.Navigator>
  );
}

function NewsScreens({ navigation }) {
  return (
    <CollectionStack.Navigator>
      <CollectionStack.Screen name='Actualité' component={NewsScreen} />
      <CollectionStack.Screen name='Album' component={AlbumScreen}
        options={({ route }) => ({ title: route.params.item.TITRE_TOME })} />
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
        options={({ route }) => ({ title: route.params.item.TITRE_TOME })} />
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
            return setTabBarMatComIcons('heart-flash', p); }
        }}
      />
      <Tab.Screen
        name='A compléter'
        component={ToCompleteScreens}
        options={{
          tabBarIcon: (p) => {
            return setTabBarIonicons('color-fill', p);
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
            return setTabBarMatComIcons('newspaper', p); }
        }}
      />
      <Tab.Screen
        name='Rechercher'
        component={SearchScreens}
        options={{
          tabBarIcon: (p) => {
            return setTabBarMatComIcons('table-search', p);
          }
        }}
      />
    </Tab.Navigator>
  );
}

export default MainTab;
