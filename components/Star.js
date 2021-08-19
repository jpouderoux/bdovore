// Fork & highly customized version of FaiChou's react-native-star-view component
// to display vector black stars instead of yellow bitmaps ones
// Code by Joachim Pouderoux, 2021

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import PropTypes from 'prop-types';

const STAR_COUNT = 5;

// default total score is 5
// if score >= 3.3 and score < 3.8, draw half a star
// default length is 150, height is 30, color is black
class Star extends React.PureComponent {
  render() {
    const { score, totalScore, style, starColor } = this.props;
    const scale = totalScore / STAR_COUNT;
    let fullStarCount = ~~(score / scale);
    let halfStarCount = 0;
    let voidStarCount = STAR_COUNT - fullStarCount;
    const dif = (score / scale) - fullStarCount
    if (0 <= dif && dif < 0.3) {
      // console.log('0 <= dif && 0 < 0.3');
    } else if (0.3 <= dif && dif < 0.8) {
      halfStarCount = 1;
      voidStarCount--;
    } else if (dif >= 0.8) {
      fullStarCount++;
      voidStarCount--;
    }
    let flattenStyle = {};
    if (typeof style === 'number') {
      flattenStyle = StyleSheet.flatten([style]);
    } else {
      flattenStyle = style;
    }
    const starWidth = flattenStyle.width / STAR_COUNT || 30;
    const Star = ({ source, color = starColor }) => (
      <Icons name={source} size={starWidth} color={color} />
    );
    return (
      <View style={[Styles.container, style]}>
        {Array(fullStarCount).fill().map((e, i) => <Star key={i.toString()} source={'star'} />)}
        {Array(halfStarCount).fill().map((e, i) => <Star key={i.toString()} source={'star-half-full'} />)}
        {Array(voidStarCount).fill().map((e, i) => <Star key={i.toString()} source={'star-outline'} />)}
      </View>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    width: 150,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  star: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

Star.propTypes = {
  score: PropTypes.number.isRequired,
  totalScore: PropTypes.number,
  style: PropTypes.any,
};

Star.defaultProps = {
  totalScore: 5,
  style: {
    width: 150,
    height: 30,
  },
  starColor: 'black',
};

export default Star;
