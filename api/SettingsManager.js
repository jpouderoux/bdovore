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

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Helpers from '../api/Helpers';
import NetInfo from "@react-native-community/netinfo";

let connectionStatus = {};

class CSettingsManager {

  constructor() {
    this.initialize();
    console.debug("Settings Manager initialized");
  }

  initialize() {

    NetInfo.fetch().then(state => this.connectionCallback(state)).catch(error => { console.debug(error)});

    // Subscribe to network change events
    NetInfo.addEventListener(this.connectionCallback);

    global.token = undefined;

    global.serverTimestamp = null;
    global.localTimestamp = null;
    AsyncStorage.getItem('localTimestamp').then(value => {
      if (value) global.localTimestamp = value;
    }).catch(() => { });

    global.autoSync = true;
    AsyncStorage.getItem('autoSync').then(value => {
      if (value) global.autoSync = (value != '0');
    }).catch(() => { });

    global.showExcludedAlbums = true;
    AsyncStorage.getItem('showExcludedAlbums').then(value => {
      if (value) global.showExcludedAlbums = (value != '0');
    }).catch(() => { });

    global.imageOnWifi = false;
    AsyncStorage.getItem('imageOnWifi').then(value => {
      if (value) global.imageOnWifi = (value != '0');
    }).catch(() => { });

    //global.hideSponsoredLinks = true;
    /*if (Platform.OS != 'ios')*/ {
      global.hideSponsoredLinks = false;
      AsyncStorage.getItem('hideSponsoredLinks').then(value => {
        if (value) global.hideSponsoredLinks = (value != '0');
      }).catch(() => { });
    }

    global.showBDovoreIds = false;
    AsyncStorage.getItem('showBDovoreIds').then(value => {
      if (value) global.showBDovoreIds = (value != '0');
    }).catch(() => { });

    global.verbose = false;
    AsyncStorage.getItem('verbose').then(value => {
      if (value) global.verbose = (value != '0');
    }).catch(() => { });

    global.confirmDeletion = false;
    AsyncStorage.getItem('confirmDeletion').then(value => {
      if (value) global.confirmDeletion = (value != '0');
    }).catch(() => { });

    global.showConnectionMessages = false;
    AsyncStorage.getItem('showConnectionMessages').then(value => {
      if (value) global.showConnectionMessages = (value != '0');
    }).catch(() => { });
  }

  connectionCallback(state) {
    //console.log(state);
    //console.debug('Connection type ' + state.type + (state.isConnected ? ' enabled' : ' disabled'));
    global.connectionType = state.type;
    if (!global.forceOffline && global.isConnected != state.isConnected) {
      global.isConnected = state.isConnected;
      console.debug('Global connection state: ' + global.isConnected);
      if (showConnectionMessages) {
        Helpers.showToast(false, 'Connexion ' + state.type + (state.isConnected ? ' activée' : ' désactivée'));
      }
    }
  }

  getConnectionStatus(callback = () => {}) {
    NetInfo.fetch().then(state => {
      this.connectionCallback(state);
      if (callback) {
        callback();
      }
    }).catch(error => { console.debug(error) });
  }

  isWifiConnected() {
    return !global.forceOffline && global.connectionType == 'wifi' && global.isConnected;
  }

};

const SettingsManager = new CSettingsManager();

export default SettingsManager;
