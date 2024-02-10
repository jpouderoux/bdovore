/* Copyright 2021-2022 Joachim Pouderoux & Association BDovore
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

import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Dimensions } from 'react-native';

import { CommonStyles } from '../styles/CommonStyles';

import { Icon } from '../components/Icon';

import { CollapsableSection } from '../components/CollapsableSection';
import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';

import { LoadingIndicator } from '../components/LoadingIndicator';
import {
 
  BarChart
} from 'react-native-chart-kit'

let timeout = null;
const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#999999",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#FFFFFF",
  backgroundGradientToOpacity: 0.5,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(26, 26, 146, ${opacity})`,
  strokeWidth: 3, // optional, default 3
  barPercentage: 1,
  useShadowColorFromDataset: false // optional
};

function CollectionStatScreen ({ route, navigation }) {
    const [errortext, setErrortext] = useState('');
    const [loading, setLoading] = useState(false);
    /*const [userId, setUserId] = useState(route.params.userid); */
    const [dataGenre, setDataGenre] = useState(null);

  useEffect(() => {
    fetchData();
    // Make sure data is refreshed when login/token changed
    const willFocusSubscription = navigation.addListener('focus', () => {
      fetchData();
    });
    return () => {
      willFocusSubscription();
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const fetchData = () => {
    if (global.isConnected) {
      if (global.verbose) {
        Helpers.showToast(false, 'Téléchargement des informations utilisateur...');
      }
      setLoading(true);
      setErrortext('');
      fetchInfo();
    } else if (!timeout && (!dataGenre || dataGenre.length == 0)) {
      if (verbose) {
        Helpers.showToast(false, 'Will try to fetch user\'s info again in 2sec.');
      }
      timeout = setTimeout(fetchData, 2000);
    }
  }

  const remapData = (data) => {
    labels = data.map( item => item.libelle).slice(0,5);
    value = data.map (item => item.nbtome).slice(0,5);
    return ({"labels" : labels, "datasets" : [ {"data": value}]});
  }
  const renderData = useCallback (({ item, index }) => (
    <Text key={index}>{item.libelle} : {item.nbtome}</Text>
  ));
  const fetchInfo = () => {
    APIManager.fetchCollectionStat("Genre",{ navigation }, onInfoGenreFetched);

  }
  const onInfoGenreFetched = async (result) => {
    //console.debug(result.items);
    setDataGenre(result.items);
    setErrortext(result.error);
  }
  return(
    <View style={CommonStyles.screenStyle}>
      {!global.isConnected ?
         <View style={[CommonStyles.screenStyle, { alignItems: 'center', height: '50%', flexDirection: 'column' }]}>
            <View style={{ flex: 1 }}></View>
            <Text style={CommonStyles.defaultText}>Informations indisponibles en mode non-connecté.{'\n'}</Text>
            <Text style={CommonStyles.defaultText}>Rafraichissez cette page une fois connecté.</Text>
            <TouchableOpacity style={{ flexDirection: 'column', marginTop: 20 }} onPress={fetchData}>
            <Icon name='refresh' size={50} color={CommonStyles.markIconDisabled.color} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}></View>
        </View>
       :
       (!dataGenre ?
          <LoadingIndicator /> :
          <View style={{ flexDirection: 'column', alignItems: 'center' }}>
            <ScrollView style={{ margin: 0, width: '100%' }}>

              <CollapsableSection sectionName='Genre' noAnimation={true}>
                <BarChart
                  // style={graphStyle}
                  data={remapData(dataGenre)}
                  width={screenWidth-20}
                  height={320}
                  chartConfig={chartConfig}
                  verticalLabelRotation={10}
                  withHorizontalLabels={true}
                  showValuesOnTopOfBars={true}
                    />
              </CollapsableSection>
            </ScrollView>
         </View>
       )
    }
    </View>
  )
}
 
export default CollectionStatScreen;