/* Copyright 2021 Joachim Pouderoux & Association BDovore
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

import React, { useState } from 'react';
import { Alert, Platform, Share, TouchableOpacity, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { bdovored, CommonStyles } from '../styles/CommonStyles';
import { Icon } from '../components/Icon';
import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';
import AlbumScreen from '../screens/AlbumScreen';
import AuteurScreen from '../screens/AuteurScreen';
import BarcodeScanner from '../screens/BarcodeScanner';
import CollectionPanel from '../panels/CollectionPanel';
import CollectionScreen from '../screens/CollectionScreen';
import ImageScreen from '../screens/ImageScreen';
import LoginScreen from '../screens/LoginScreen';
import NewsScreen from '../screens/NewsScreen';
import SearchScreen from '../screens/SearchScreen';
import SerieScreen from '../screens/SerieScreen';
import SettingsPanel from '../panels/SettingsPanel';
import ToCompleteScreen from '../screens/ToCompleteScreen';
import WishlistScreen from '../screens/WishlistScreen';


// The main tab navigator
const Tab = createBottomTabNavigator();

// The stack navigators for each tab
const CollectionStack = createStackNavigator();
const WishlistStack = createStackNavigator();
const ToCompleteStack = createStackNavigator();
const NewsStack = createStackNavigator();
const SearchStack = createStackNavigator();


const accountButton = (navigation) => {
  return (
    <TouchableOpacity onPress={() => onAccountPress(navigation)} style={{ margin: 8 }}>
      <Icon name='account-circle-outline' size={25} color={CommonStyles.iconStyle.color} />
    </TouchableOpacity>
  );
}

const onAccountPress = (navigation) => {
  navigation.navigate('Login');
};

const ShareIcon = () => (
  Platform.OS == 'ios' ?
    <Icon collection='Ionicons' name='ios-share-outline' size={25} color={CommonStyles.iconStyle.color} /> :
    <Icon name='share-variant' size={25} color={CommonStyles.iconStyle.color} />);

const shareAlbumButton = (item) => {
  return (
    <TouchableOpacity onPress={() => onShareAlbumPress(item)} style={{ margin: 8 }}>
      <ShareIcon />
    </TouchableOpacity>
  );
}

const onShareAlbumPress = async (item) => {
  const url = APIManager.bdovoreBaseURL + '/Album?id_tome=' + item.ID_TOME;
  Share.share({
    message: url,
    url: url
  });
}

const shareSerieButton = (item) => {
  return (
    <TouchableOpacity onPress={() => onShareSeriePress(item)} style={{ margin: 8 }}>
      <ShareIcon />
    </TouchableOpacity>
  );
}

const onShareSeriePress = async (item) => {
  const url = APIManager.bdovoreBaseURL + '/serie-bd-' + item.ID_SERIE;
  Share.share({
    message: url,
    url: url
  });
}

const shareAuthorButton = (item) => {
  return (
    <TouchableOpacity onPress={() => onShareAuthorPress(item)} style={{ margin: 8 }}>
      <ShareIcon />
    </TouchableOpacity>
  );
}

const onShareAuthorPress = async (item) => {
  const url = APIManager.bdovoreBaseURL + '/auteur-bd-' + item.ID_AUTEUR;
  Share.share({
    message: url,
    url: url
  });
}

const defaultStackOptions = {
  headerTintColor: global.isDarkMode ? 'white' : bdovored,
  headerTruncatedBackTitle: ''
};

function CollectionScreens({ route, navigation }) {

  const [collectionGenre, setCollectionGenre] = useState(0);
  const [showCollectionChooser, setShowCollectionChooser] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const onShareCollectionPress = () => {

    const shareCollection = () => {
      const userid = parseInt(global.token.replace(/([0-9]+).*/, '$1')) * 1209 + 951;
      const url = APIManager.bdovoreBaseURL + '/guest?user=' + userid;
      Share.share({
        message: url,
        url: url
      });
    }

    if (global.openCollection) {
      shareCollection();
    } else {
      Alert.alert('Partager ma collection',
        'Le lien partagé ne fonctionnera que si vous avez autorisé la consultation de ' +
        'votre collection par d\'autres utilisateurs sur la page profil du site internet.',
        [{
          text: "Oui",
          onPress: () => shareCollection()
        }, {
          text: "Annuler",
          onPress: () => { },
          style: "cancel"
        }],
        { cancelable: true });
    }
  }

  const onCollectionGenrePress = () => {
    setShowCollectionChooser(!showCollectionChooser);
  }

  const onSettingsPress = () => {
    setShowSettingsPanel(true);
  };

  const settingsButton = (route, navigation) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={onShareCollectionPress} style={{ margin: 8 }}>
          <ShareIcon />
        </TouchableOpacity>

        <TouchableOpacity onPress={onCollectionGenrePress} style={{ margin: 8 }}>
          <Icon collection='Ionicons' name='library-sharp' size={25} color={CommonStyles.iconStyle.color} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onSettingsPress} style={{ margin: 8 }}>
          <Icon name='dots-vertical' size={25} color={CommonStyles.iconStyle.color} />
        </TouchableOpacity>

        <CollectionPanel route={route}
          navigation={navigation}
          isVisible={showCollectionChooser}
          visibleSetter={setShowCollectionChooser}
          collectionGenre={collectionGenre}
          setCollectionGenre={setCollectionGenre} />

        <SettingsPanel navigation={navigation}
          isVisible={showSettingsPanel}
          visibleSetter={setShowSettingsPanel} />
      </View>
    );
  }

  return (
    <CollectionStack.Navigator screenOptions={defaultStackOptions}>
      <CollectionStack.Screen name='Ma collection'
        component={CollectionScreen}
        options={({ route }) => {
          route.params = { collectionGenre: collectionGenre };
          return {
            headerLeft: () => accountButton(navigation),
            headerRight: () => settingsButton(route, navigation),
          };
        }} />
      <CollectionStack.Screen name='Serie' component={SerieScreen}
        options={({ route }) => ({
          title: route.params.item.NOM_SERIE,
          headerRight: () => shareSerieButton(route.params.item)
        })} />
      <CollectionStack.Screen name='Album' component={AlbumScreen}
        options={({ route }) => ({
          title: route.params.item.TITRE_TOME,
          headerRight: () => shareAlbumButton(route.params.item)
        })} />
      <CollectionStack.Screen name='Auteur' component={AuteurScreen}
        options={({ route }) => ({
          title: Helpers.reverseAuteurName(route.params.author.PSEUDO),
          headerRight: () => shareAuthorButton(route.params.author)
        })} />
    </CollectionStack.Navigator>
  );
}

function WishlistScreens({ navigation }) {

  const [collectionGenre, setCollectionGenre] = useState(0);
  const [showCollectionChooser, setShowCollectionChooser] = useState(false);

  const onCollectionGenrePress = () => {
    setShowCollectionChooser(!showCollectionChooser);
  }

  const settingsButton = (route, navigation) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={onCollectionGenrePress} style={{ margin: 8 }}>
          <Icon collection='Ionicons' name='library-sharp' size={25} color={CommonStyles.iconStyle.color} />
        </TouchableOpacity>

        <CollectionPanel route={route}
          navigation={navigation}
          isVisible={showCollectionChooser}
          visibleSetter={setShowCollectionChooser}
          collectionGenre={collectionGenre}
          setCollectionGenre={setCollectionGenre} />
      </View>
    );
  }

  return (
    <WishlistStack.Navigator screenOptions={defaultStackOptions}>
      <WishlistStack.Screen name='Mes envies'
        component={WishlistScreen}
        options={({ route }) => {
          route.params = { collectionGenre: collectionGenre };
          return {
            headerRight: () => settingsButton(route, navigation),
          };
        }}
      />
      <WishlistStack.Screen name='Serie' component={SerieScreen}
        options={({ route }) => ({
          title: route.params.item.NOM_SERIE,
          headerRight: () => shareSerieButton(route.params.item)
        })} />
      <WishlistStack.Screen name='Album' component={AlbumScreen}
        options={({ route }) => ({
          title: route.params.item.TITRE_TOME,
          headerRight: () => shareAlbumButton(route.params.item)
        })} />
      <WishlistStack.Screen name='Auteur' component={AuteurScreen}
        options={({ route }) => ({
          title: Helpers.reverseAuteurName(route.params.author.PSEUDO),
          headerRight: () => shareAuthorButton(route.params.author)
        })} />
    </WishlistStack.Navigator>
  );
}

function ToCompleteScreens({ navigation }) {

  const [collectionGenre, setCollectionGenre] = useState(0);
  const [showCollectionChooser, setShowCollectionChooser] = useState(false);

  const onCollectionGenrePress = () => {
    setShowCollectionChooser(!showCollectionChooser);
  }

  const settingsButton = (route, navigation) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={onCollectionGenrePress} style={{ margin: 8 }}>
          <Icon collection='Ionicons' name='library-sharp' size={25} color={CommonStyles.iconStyle.color} />
        </TouchableOpacity>

        <CollectionPanel route={route}
          navigation={navigation}
          isVisible={showCollectionChooser}
          visibleSetter={setShowCollectionChooser}
          collectionGenre={collectionGenre}
          setCollectionGenre={setCollectionGenre} />
      </View>
    );
  }

  return (
    <ToCompleteStack.Navigator screenOptions={defaultStackOptions}>
      <ToCompleteStack.Screen name='Albums manquants'
        component={ToCompleteScreen}
        options={({ route }) => {
          route.params = { collectionGenre: collectionGenre };
          return {
            headerRight: () => settingsButton(route, navigation),
          };
        }} />
      <ToCompleteStack.Screen name='Serie' component={SerieScreen}
        options={({ route }) => ({
          title: route.params.item.NOM_SERIE,
          headerRight: () => shareSerieButton(route.params.item)
        })} />
      <ToCompleteStack.Screen name='Album' component={AlbumScreen}
        options={({ route }) => ({
          title: route.params.item.TITRE_TOME,
          headerRight: () => shareAlbumButton(route.params.item)
        })} />
      <ToCompleteStack.Screen name='Auteur' component={AuteurScreen}
        options={({ route }) => ({
          title: Helpers.reverseAuteurName(route.params.author.PSEUDO),
          headerRight: () => shareAuthorButton(route.params.author)
        })} />
    </ToCompleteStack.Navigator>
  );
}

function NewsScreens({ navigation }) {
  const [collectionGenre, setCollectionGenre] = useState(1);
  const [showCollectionChooser, setShowCollectionChooser] = useState(false);

  const onCollectionGenrePress = () => {
    setShowCollectionChooser(!showCollectionChooser);
  }

  const settingsButton = (route, navigation) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={onCollectionGenrePress} style={{ margin: 8 }}>
          <Icon collection='Ionicons' name='library-sharp' size={25} color={CommonStyles.iconStyle.color} />
        </TouchableOpacity>

        <CollectionPanel route={route}
          navigation={navigation}
          isVisible={showCollectionChooser}
          visibleSetter={setShowCollectionChooser}
          collectionGenre={collectionGenre}
          setCollectionGenre={setCollectionGenre}
          noAllEntry={true} />
      </View>
    );
  }

  return (
    <NewsStack.Navigator screenOptions={defaultStackOptions}>
      <NewsStack.Screen name='Actualité' component={NewsScreen}
        options={({ route }) => {
          route.params = { collectionGenre: collectionGenre };
          return {
            headerRight: () => settingsButton(route, navigation),
          };
        }} />
      <NewsStack.Screen name='Album' component={AlbumScreen}
        options={({ route }) => ({
          title: route.params.item.TITRE_TOME,
          headerRight: () => shareAlbumButton(route.params.item)
        })} />
      <NewsStack.Screen name='Serie' component={SerieScreen}
        options={({ route }) => ({
          title: route.params.item.NOM_SERIE,
          headerRight: () => shareSerieButton(route.params.item)
        })} />
      <NewsStack.Screen name='Auteur' component={AuteurScreen}
        options={({ route }) => ({
          title: Helpers.reverseAuteurName(route.params.author.PSEUDO),
          headerRight: () => shareAuthorButton(route.params.author)
        })} />
    </NewsStack.Navigator>
  );
}

function SearchScreens({ navigation }) {
  return (
    <SearchStack.Navigator screenOptions={defaultStackOptions}>
      <SearchStack.Screen name='Rechercher' component={SearchScreen} />
      <SearchStack.Screen name='Serie' component={SerieScreen}
        options={({ route }) => ({
          title: route.params.item.NOM_SERIE,
          headerRight: () => shareSerieButton(route.params.item)
        })} />
      <SearchStack.Screen name='Album' component={AlbumScreen}
        options={({ route }) => ({
          title: route.params.item.TITRE_TOME,
          headerRight: () => shareAlbumButton(route.params.item)
        })} />
      <SearchStack.Screen name='Auteur' component={AuteurScreen}
        options={({ route }) => ({
          title: Helpers.reverseAuteurName(route.params.author.PSEUDO),
          headerRight: () => shareAuthorButton(route.params.author)
        })} />
      <SearchStack.Screen name='BarcodeScanner' component={BarcodeScanner}
        options={({ title: 'Scan code-barre' })} />
    </SearchStack.Navigator>
  );
}

function MainTab2() {

  const setTabBarMatComIcons = (icon, params) => {
    return (
      <Icon name={icon} color={params.color} size={params.size} />
    );
  };

  const setTabBarMatIcons = (icon, params) => {
    return (
      <Icon collection='MaterialIcons' name={icon} color={params.color} size={params.size} />
    );
  };

  return (
    <Tab.Navigator
      initialRouteName='Ma collection'
      screenOptions={{ gestureEnabled: false }}
      tabBarOptions={{ activeTintColor: bdovored }}
      animationEnabled={true}
    >
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
        name='Wishlist'
        component={WishlistScreens}
        options={{
          tabBarIcon: (p) => {
            return setTabBarMatComIcons('heart', p);
          }
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
        name='Actualité'
        component={NewsScreens}
        options={{
          tabBarIcon: (p) => {
            return setTabBarMatIcons('fiber-new', p);
          }
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

const RootStack = createStackNavigator();

function MainTab() {
  return (
    <RootStack.Navigator mode="modal" headerMode="none">
      <RootStack.Screen name="MainTab2" component={MainTab2} />
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="Image" component={ImageScreen} />
    </RootStack.Navigator>
  );
}

export default MainTab;
