import EStyleSheet from 'react-native-extended-stylesheet';

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
    width: 90,
    height: 122,
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
