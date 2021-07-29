import { Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const CommonStyles = EStyleSheet.create({
  screenStyle: {
    backgroundColor: 'white',
    height: '100%',
  },
  searchInput: {
    flex: 1,
    margin: 12,
    color: 'black',
    fontSize: '0.7rem',
    height: 32,
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: '#dadae8',
  },
  starStyle: {
    color: '#000',
    backgroundColor: 'transparent',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptyStarStyle: {
    color: 'white',
  },
  albumImageStyle: {
    margin: 5,
    resizeMode: 'cover',
    width: windowWidth / 4,
    height: windowWidth / 4 * (122 / 90), // respect the aspect ratio
  },
  auteurImageStyle: {
    margin: 5,
    resizeMode: 'cover',
    width: windowWidth / 4,
    height: windowWidth / 4 * (122 / 90), // respect the aspect ratio
  },
  fullAlbumImageStyle: {
    width: 180,
    height: 244,
  },
  itemTextWidth: {
    width: (windowWidth / 4) * 3 - 15,
  },
  itemTextContent: {
    margin: 5,
    flexDirection: "column",
    flex: 1
  },
  serieImageStyle: {
    width: 90,
    height: 122,
  },
  auteurImageStyle: {
    width: 90,
    height: 122,
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
    fontSize: '1.1rem'
  },
  errorTextStyle: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  },
  bdfugueIcon: {
    width: 105,
    height: 30
  },
  sectionStyle: {
    backgroundColor: '#ddd',
    width: '100%'
  },
  linkTextStyle: {
    textDecorationLine: 'underline',
  }
});

export default CommonStyles;
