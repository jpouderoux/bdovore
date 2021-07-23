import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';

import { createAppContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-community/async-storage';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Login from '../screens/Login';
import Serie from '../screens/Serie';
import Album from '../screens/Album';
import MyCollection from '../screens/MyCollection';
import News from '../screens/News';
import Search from '../screens/Search';
import ToComplete from '../screens/ToComplete';
import Wishlist from '../screens/Wishlist';

const Tab = createBottomTabNavigator();

const MyCollectionStack = createStackNavigator();

function MyCollectionScreens({navigation}) {

  const onAccountPress = () => {
    navigation.navigate('Login');
  };

  const accountButton = () => {
    return (
      <TouchableOpacity onPress={onAccountPress} title="Search" style={{ margin: 8 }}>
        <MaterialCommunityIcons name='account-cog' size={25} color='#222' />
      </TouchableOpacity>
    );
  }

  return (
    <MyCollectionStack.Navigator>
      <MyCollectionStack.Screen name="Ma collection" component={MyCollection}
        options={{
          headerRight: accountButton,
        }} />
      <MyCollectionStack.Screen name="Login" component={Login} />
      <MyCollectionStack.Screen name="Serie" component={Serie}
        options={({ route }) => ({ title: route.params.item.NOM_SERIE })} />
      <MyCollectionStack.Screen name="Album" component={Album}
        options={({ route }) => ({ title: route.params.item.TITRE_TOME })} />
    </MyCollectionStack.Navigator>
  );
}

function WishlistScreens({ navigation }) {
  return (
    <MyCollectionStack.Navigator>
      <MyCollectionStack.Screen name="Mes envies BD" component={Wishlist} />
      <MyCollectionStack.Screen name="Serie" component={Serie}
        options={({ route }) => ({ title: route.params.item.NOM_SERIE })} />
      <MyCollectionStack.Screen name="Album" component={Album}
        options={({ route }) => ({ title: route.params.item.TITRE_TOME })} />
    </MyCollectionStack.Navigator>
  );
}

function ToCompleteScreens({ navigation }) {
  return (
    <MyCollectionStack.Navigator>
      <MyCollectionStack.Screen name="Albums manquants" component={ToComplete} />
      <MyCollectionStack.Screen name="Serie" component={Serie}
        options={({ route }) => ({ title: route.params.item.NOM_SERIE })} />
      <MyCollectionStack.Screen name="Album" component={Album}
        options={({ route }) => ({ title: route.params.item.TITRE_TOME })} />
    </MyCollectionStack.Navigator>
  );
}

function NewsScreens({ navigation }) {
  return (
    <MyCollectionStack.Navigator>
      <MyCollectionStack.Screen name="Actualité" component={News} />
    </MyCollectionStack.Navigator>
  );
}

function SearchScreens({ navigation }) {
  return (
    <MyCollectionStack.Navigator>
      <MyCollectionStack.Screen name="Rechercher" component={Search} />
      <MyCollectionStack.Screen name="Serie" component={Serie}
        options={({ route }) => ({ title: route.params.item.NOM_SERIE })} />
      <MyCollectionStack.Screen name="Album" component={Album}
        options={({ route }) => ({ title: route.params.item.TITRE_TOME })} />
    </MyCollectionStack.Navigator>
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
      initialRouteName="Ma collection"
      screenOptions={{ gestureEnabled: false }}
    >
      <Tab.Screen
        name="Ma collection"
        component={MyCollectionScreens}
        options={{
          tabBarIcon: (p) => {
            return setTabBarIonicons("library", p); }
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreens}
        options={{
          tabBarIcon: (p) =>  {
            return setTabBarMatComIcons("heart-flash", p); }
        }}
      />
      <Tab.Screen
        name="A compléter"
        component={ToCompleteScreens}
        options={{
          tabBarIcon: (p) => {
            return setTabBarIonicons("color-fill", p);
          }
        }}
      />
      <Tab.Screen
        name="Actualité"
        component={NewsScreens}
        options={{
          tabBarIcon: (p) => {
            return setTabBarMatComIcons("newspaper", p); }
        }}
      />
      <Tab.Screen
        name="Rechercher"
        component={SearchScreens}
        options={{
          tabBarIcon: (p) => {
            return setTabBarMatComIcons("table-search", p);
          }
        }}
      />
    </Tab.Navigator>
  );
}

export default MainTab;
