import React from 'react';
import {
    View,
    Animated,
    Dimensions
} from 'react-native';
import { Constants } from 'expo';
import { connect } from 'react-redux';
import FadeInView from '../components/FadeInView';
import Login from '../screens/Login';
import Logo from '../components/Logo';

class LoginContainer extends React.Component {
    state = {
        top: new Animated.Value(Dimensions.get('window').height / 2.5 - 100)
    }

    componentDidMount() {
      const { top } = this.state;
  
      Animated.timing(
        top,
        {
          toValue: 0,
          delay: 1600,
          duration: 1800
        },
      ).start();
    }

    render() {
        const { session } = this.props;
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingHorizontal: 50,
                    opacity: session.processing ? .5 : 1,
                    paddingTop: Constants.statusBarHeight
                }}
            >
                <Logo
                    style={{
                        marginBottom: 30,
                        marginTop: this.state.top
                    }}
                />
                <FadeInView
                    delay={3000}
                    duration={1500}
                    style={{
                        flex: 1,
                        width: '100%'
                    }}
                >
                    <Login />
                </FadeInView>
            </View>
        );
    }
}

export default connect(
    state => {
        return {
            session: state.session
        };
    }
)(LoginContainer);