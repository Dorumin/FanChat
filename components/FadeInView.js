import React from 'react';
import { Animated } from 'react-native';

export default class FadeInView extends React.Component {
  constructor() {
    super();

    this.state = {
      viewOpacity: new Animated.Value(0),
    };
  }

  componentDidMount() {
    const { viewOpacity } = this.state;
    const { onFadeComplete, duration = 500, delay = 0 } = this.props;

    Animated.timing(
      viewOpacity,
      {
        toValue: 1,
        duration,
        delay
      },
    ).start(onFadeComplete || (() => {}));
  }

  render() {
    const { viewOpacity } = this.state;
    const { style } = this.props;

    return (
      <Animated.View style={[{ opacity: viewOpacity }].concat(style || [])}>
        {this.props.children}
      </Animated.View>
    );
  }
}