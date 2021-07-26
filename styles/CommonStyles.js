import { Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const CommonStyles = EStyleSheet.create({
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
  itemTextWidth: {
    width: (windowWidth / 4) * 3 - 15,
  },
  itemTextContent: {
    margin: 5,
    flexDirection: "column",
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
  errorTextStyle: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default CommonStyles;
