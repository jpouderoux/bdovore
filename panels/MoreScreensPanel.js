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

import React,  { useState } from 'react';
import {  StyleSheet, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { useNavigation, useRoute, getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { CommonStyles, bdovored } from '../styles/CommonStyles';
import { Icon } from '../components/Icon';
import AboutPanel from './AboutPanel';
import SettingsPanel from './SettingsPanel';


function MoreScreensPanel({ isVisible, visibleSetter }) {

  const [showAboutPanel, setShowAboutPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';

  const onAboutPress = () => {
    setShowAboutPanel(true);
  }

  const onSettingsPress = () => {
    setShowSettingsPanel(true);
  }

  const Item = ({icon, collection, title, callback}) =>
    <TouchableOpacity style={styles.itemStyle}
      onPress={callback}>
      <Icon name={icon} size={25} color={routeName == title ? bdovored : 'grey'} />
      <Text style={[CommonStyles.defaultText, CommonStyles.smallerText, styles.titleStyle, { color: routeName == title ? bdovored : 'grey'}]}>{title}</Text>
      <View style={{ flex: 1 }}></View>
    </TouchableOpacity>;

  const navigate = (screen) => {
    navigation.navigate(screen);
    visibleSetter(false);
  }

  return (
    <Modal
      animationType='slide'
      coverScreen={false}
      backdropOpacity={0}
      transparent={true}
      isVisible={isVisible}
      onBackdropPress={() => visibleSetter(false)}
      onRequestClose={() => visibleSetter(false)}
      onSwipeComplete={() => visibleSetter(false)}
      swipeDirection={['down', 'right']}
      useNativeDriver={false}
      propagateSwipe={true}
      style={styles.modalStyle}
    >
      <ScrollView style={styles.scrollViewStyle}>
        <View style={[CommonStyles.modalViewStyle, { marginTop: -10 }]}>

          <Item icon='account-circle-outline' title='Connexion' callback={() => navigate('Login')} />

          <Item icon='FontAwesome/comments-o' title='Critiques' callback={() => navigate('Critiques')} />

          <Item icon='chart-line' title='Stats' callback={() => navigate('Stats')} />

          <Item icon='barcode-scan' title='Scan code-barre' callback={() => navigate('BarcodeScanner')} />

          <Item icon='cog-outline' title='Paramètres' callback={onSettingsPress} />

          <Item icon='information-outline' title='A propos...' callback={onAboutPress} />

        </View>

        <SettingsPanel navigation={navigation}
          isVisible={showSettingsPanel}
          visibleSetter={(visible) => { if (!visible) { visibleSetter(false); } setShowSettingsPanel(visible); }} />

        <AboutPanel navigation={navigation}
          isVisible={showAboutPanel}
          visibleSetter={(visible) => { if (!visible) { visibleSetter(false); } setShowAboutPanel(visible); }} />

      </ScrollView>
    </Modal>);
}

const styles = StyleSheet.create({
  modalStyle: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 0,
    backgroundColor: 'transparent'
  },

  itemStyle: {
    flexDirection: 'row',
    flex: 1,
    marginTop: 10,
    paddingVertical: 0,
    marginHorizontal: 0,
    justifyContent: 'space-between',
  },

  titleStyle: {
    marginLeft: 15,
    color: 'grey',
    textAlignVertical: 'center'
  },

  scrollViewStyle: {
    backgroundColor: 'white',
    position: 'absolute',
    padding: 15,
    bottom: 55,
    right: -15,
    flex: 1,
    flexDirection: 'column-reverse',
    borderWidth: StyleSheet.hairlineWidth * 1,
    borderColor: 'gray',
    borderRadius: 5
  },
});

export default MoreScreensPanel;
