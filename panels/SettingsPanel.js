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

import React, { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BottomSheet } from '../components/BottomSheet';
import { CommonStyles } from '../styles/CommonStyles';


function SettingsPanel({ isVisible, visibleSetter }) {

  const [imageOnWifi, setImageOnWifi] = useState(global.imageOnWifi);
  const [verbose, setVerbose] = useState(global.verbose);
  const [showBDovoreIds, setShowBDovoreIds] = useState(global.showBDovoreIds);
  const [confirmDeletion, setConfirmDeletion] = useState(global.confirmDeletion);
  const [showConnectionMessages, setShowConnectionMessages] = useState(global.showConnectionMessages);

  useEffect(() => {
  }, []);

  const onSwitchImageOnWifi = (value) => {
    setImageOnWifi(value);
    global.imageOnWifi = value;
    AsyncStorage.setItem('imageOnWifi', value ? '1' : '0').catch((error) => { });
  };

  const onSwitchVerbose = (value) => {
    setVerbose(value);
    global.verbose = value;
    AsyncStorage.setItem('verbose', value ? '1' : '0').catch((error) => { });
  };

  const onSwitchBDovoreIds = (value) => {
    setShowBDovoreIds(value);
    global.showBDovoreIds = value;
    AsyncStorage.setItem('showBDovoreIds', value ? '1' : '0').catch((error) => { });
  }

  const onSwitchConfirmDeletion = (value) => {
    setConfirmDeletion(value);
    global.confirmDeletion = value;
    AsyncStorage.setItem('confirmDeletion', value ? '1' : '0').catch((error) => { });
  }

  const onSwitchConnectionMessages = (value) => {
    setShowConnectionMessages(value);
    global.showConnectionMessages = value;
    AsyncStorage.setItem('showConnectionMessages', value ? '1' : '0').catch((error) => { });
  }

  return (
    <BottomSheet isVisible={isVisible} visibleSetter={visibleSetter} containerStyle={CommonStyles.bottomSheetContainerStyle}>
      <View style={[CommonStyles.modalViewStyle, { height: '80%', paddingTop: 10, paddingBottom: 20, marginBottom: -10 }]}>

        <View style={{
           flexDirection: 'row', flex: 1, width: '80%', paddingVertical: 10, marginHorizontal: 10, justifyContent: 'space-between' }}>
          <Text style={CommonStyles.defaultText}>Images uniquement en Wifi</Text>
          <View style={{ flex: 1 }}></View>
          <Switch value={imageOnWifi} onValueChange={onSwitchImageOnWifi}
            style={{ marginTop: -5 }}
            thumbColor={CommonStyles.switchStyle.color}
            trackColor={{ false: CommonStyles.switchStyle.borderColor, true: CommonStyles.switchStyle.backgroundColor }} />
        </View>

        <View style={{
          flexDirection: 'row', flex: 1, width: '80%', paddingVertical: 10, marginHorizontal: 10, justifyContent: 'space-between',
          borderTopWidth: 1.0, borderTopColor: CommonStyles.separatorStyle.borderBottomColor
        }}>
          <Text style={CommonStyles.defaultText}>Informations de débogage</Text>
          <View style={{ flex: 1 }}></View>
          <Switch value={verbose} onValueChange={onSwitchVerbose}
            style={{ marginTop: -5 }}
            thumbColor={CommonStyles.switchStyle.color}
            trackColor={{ false: CommonStyles.switchStyle.borderColor, true: CommonStyles.switchStyle.backgroundColor }} />
        </View>

        <View style={{
          flexDirection: 'row', flex: 1, width: '80%', paddingVertical: 10, marginHorizontal: 10, justifyContent: 'space-between',
          borderTopWidth: 1.0, borderTopColor: CommonStyles.separatorStyle.borderBottomColor
        }}>
          <Text style={CommonStyles.defaultText}>Afficher les identifiants BDovore</Text>
          <View style={{ flex: 1 }}></View>
          <Switch value={showBDovoreIds} onValueChange={onSwitchBDovoreIds}
            style={{ marginTop: -5 }}
            thumbColor={CommonStyles.switchStyle.color}
            trackColor={{ false: CommonStyles.switchStyle.borderColor, true: CommonStyles.switchStyle.backgroundColor }} />
        </View>

        <View style={{
          flexDirection: 'row', flex: 1, width: '80%', paddingVertical: 10, marginHorizontal: 10, justifyContent: 'space-between',
          borderTopWidth: 1.0, borderTopColor: CommonStyles.separatorStyle.borderBottomColor
        }}>
          <Text style={CommonStyles.defaultText}>Confirmer les suppressions</Text>
          <View style={{ flex: 1 }}></View>
          <Switch value={confirmDeletion} onValueChange={onSwitchConfirmDeletion}
            style={{ marginTop: -5 }}
            thumbColor={CommonStyles.switchStyle.color}
            trackColor={{ false: CommonStyles.switchStyle.borderColor, true: CommonStyles.switchStyle.backgroundColor }} />
        </View>

        <View style={{
          flexDirection: 'row', flex: 1, width: '80%', paddingVertical: 10, marginHorizontal: 10, justifyContent: 'space-between',
          borderTopWidth: 1.0, borderTopColor: CommonStyles.separatorStyle.borderBottomColor
        }}>
          <Text style={CommonStyles.defaultText}>Afficher les messages de connexion</Text>
          <View style={{ flex: 1 }}></View>
          <Switch value={showConnectionMessages} onValueChange={onSwitchConnectionMessages}
            style={{ marginTop: -5 }}
            thumbColor={CommonStyles.switchStyle.color}
            trackColor={{ false: CommonStyles.switchStyle.borderColor, true: CommonStyles.switchStyle.backgroundColor }} />
        </View>

        <View style={{ height: 20, }}></View>
        <Text style={[CommonStyles.defaultText, CommonStyles.linkTextStyle, CommonStyles.center]}
          onPress={() => visibleSetter(false)}>Fermer</Text>
      </View>
    </BottomSheet>
  );
}

export default SettingsPanel;
