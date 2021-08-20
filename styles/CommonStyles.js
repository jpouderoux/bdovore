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

import { Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export const bdovored = '#990000';
export const bdovorgray = '#aaaaaa'; // Same as iOS UIColor.lightGray

export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;

export const FullAlbumImageWidth = 180;
export const FullAlbumImageHeight = 244;

export const AlbumImageWidth = windowWidth / 4;
export const AlbumImageHeight = AlbumImageWidth * (FullAlbumImageHeight / FullAlbumImageWidth);
export const AlbumItemHeight = AlbumImageHeight + 1;

export const CommonStyles = EStyleSheet.create({
  screenStyle: {
    backgroundColor: 'white',
    flex: 1,
  },

  // *************
  // Image styles
  albumImageStyle: {
    marginLeft: 5,
    marginRight: 5,
    resizeMode: 'contain',
    width: AlbumImageWidth,
    height: AlbumImageHeight, // respect the aspect ratio
  },
  auteurImageStyle: {
    margin: 5,
    resizeMode: 'cover',
    width: AlbumImageWidth,
    height: AlbumImageHeight, // respect the aspect ratio
  },
  auteurImageStyle: {
    width: 90,
    height: 122,
  },
  fullAlbumImageStyle: {
    resizeMode: 'contain',
    width: FullAlbumImageWidth,
    height: FullAlbumImageHeight,
  },
  serieImageStyle: {
    width: 90,
    height: 122,
  },
  bdfugueIcon: {
    width: 200/2,
    height: 65/2,
    marginRight: 40,
  },
  amazonIcon: {
    width: 365/4,
    height: 130/4,
  },
  iconStyle: {
    color: 'black', // #222
  },
  iconEnabledStyle: {
    color: 'dodgerblue',
  },

  // ************
  // Text styles

  itemTextWidth: {
    width: (windowWidth / 4) * 3 - 15,
  },
  itemTextContent: {
    margin: 5,
    flexDirection: "column",
    flex: 1
  },
  itemTitleText: {
    color: 'black',
  },
  itemText: {
    color: bdovorgray,
  },
  italic: {
    fontStyle: 'italic'
  },
  bold: {
    fontWeight: 'bold'
  },
  center: {
    textAlign: 'center'
  },
  largerText: {
    fontSize: '1.0rem'
  },
  errorTextStyle: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  },
  sectionStyle: {
    backgroundColor: '#ddd',
    width: '100%',
  },
  sectionAlbumStyle: {
    backgroundColor: '#ddd',
    color: 'white',
    width: '100%',
  },
  albumEditionButtonStyle: {
    backgroundColor: bdovorgray,
    borderColor: 'black',
    color: 'black',
    borderWidth: 1,
    borderRadius: 5,
  },
  sectionListStyle: {
    backgroundColor: bdovorgray,
  },
  linkTextStyle: {
    color: 'dodgerblue',
    //textDecorationLine: 'underline',
  },

  //****************
  // Markers styles
  markerStyle: {
    alignItems: 'center',
    alignContent: 'center',
    padding: 8,
  },
  markerIconStyle: {
    textAlign: 'center',
    paddingTop: 3,
    borderWidth: 0.5,
    borderColor: bdovorgray,
    paddingLeft: 2,
    width: 32,
    height: 32,
  },
  markerTextStyle: {
    fontSize: 9,
  },
  markIconEnabled: {
    color: 'green',
  },
  markWishIconEnabled: {
    color: 'red',
  },
  markIconDisabled: {
    color: 'black',
  },

  //**************
  // Login styles
  loginConnectionTextStyle: {
    color: 'white',
    paddingVertical: 10,
    fontSize: 16,
  },
  loginConnectionButtonStyle: {
    backgroundColor: 'red',
    borderWidth: 0,
    color: 'white',
    borderColor: 'red',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 20,
    marginBottom: 25,
  },
  loginInputTextStyle: {
    margin: 12,
    color: 'black',
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: bdovorgray,
  },
  loginRegisterTextStyle: {
    alignSelf: 'center',
    fontSize: 14,
    padding: 10,
    textAlign: 'center',
  },

  //*****************
  // Comments styles
  commentsTextStyle: {
    color: bdovorgray,
    position: 'absolute',
    right: 10,
  },
  commentsTextInputStyle: {
    backgroundColor: 'lightgrey',
    marginTop: 10,
    textAlignVertical: 'top',
    width: '100%',
  },

  //**********************
  // Bottom sheets styles
  bottomSheetContainerStyle: {
    backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)',
  },
  bottomSheetItemContainerStyle: {
    backgroundColor: 'white',
  },
  bottomSheetSelectedItemContainerStyle: {
    backgroundColor: 'dodgerblue',
  },
  bottomSheetItemTextStyle: {
    color: 'dodgerblue',
  },
  bottomSheetSelectedItemTextStyle: {
    color: 'white',
  },

  //***************
  // Search styles
  searchContainerStyle: {
    backgroundColor: '#eee',
  },

  //**********************
  // Bouton groups styles
  buttonGroupContainerStyle: {
    height: 30,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  buttonGroupButtonStyle: {
    borderRadius: 8,
    margin: 2,
    backgroundColor: '#eee',
  },
  buttonGroupSelectedButtonStyle: {
    backgroundColor: 'white',
  },
  buttonGroupInnerBorderStyle: {
    width: 0,
  },

  //*********************
  // Rating stars styles
  ratingStarColor: {
    color: global.isDarkMode ? 'white' : 'black',
  }

});

