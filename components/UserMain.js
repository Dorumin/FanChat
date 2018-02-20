import React from 'react';
import {
    View,
    Image,
    Text,
    Platform,
    ToastAndroid,
    TouchableOpacity
} from 'react-native';
import { SecureStore } from 'expo';
import { connect } from 'react-redux';
import { logout } from '../actions';

class UserMain extends React.Component {
    toast(text) {
        if (Platform.OS == 'android') {
            ToastAndroid.show(text, ToastAndroid.SHORT);
        }
    }

    render() {
        const { session, navigation, logout } = this.props;
        return (
            <View
                style={{
                    height: 60,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    backgroundColor: '#f5f5f5',
                    position: 'absolute',
                    justifyContent: 'center'
                }}
            >
                <View
                    style={{
                        height: 30,
                        width: 30,
                        marginLeft: 15,
                        borderRadius: 15,
                        overflow: 'hidden'
                    }}
                >
                    <Image
                        source={{
                            uri: session.avatar
                        }}
                        style={{
                            height: 30,
                            width: 30
                        }}
                    />
                </View>
                <View
                    style={{
                        height: 60,
                        left: 60,
                        right: 140,
                        position: 'absolute',
                        justifyContent: 'center'
                    }}
                >
                    <Text
                        style={{
                            fontSize: 20
                        }}
                        numberOfLines={1}
                    >
                        {session.name}
                    </Text>
                </View>
                <TouchableOpacity
                    style={{
                        height: 60,
                        width: 60,
                        right: 60,
                        position: 'absolute',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={logout}
                    onLongPress={this.toast.bind(this, 'Log out of your account')}
                >
                    <Image
                        source={require('../img/logout.png')}
                        style={{
                            height: 20,
                            width: 20
                        }}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        height: 60,
                        width: 60,
                        right: 0,
                        position: 'absolute',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onPress={() => navigation.navigate('Configuration')}
                    onLongPress={this.toast.bind(this, 'Open configuration')}
                >
                    <Image
                        source={require('../img/config.png')}
                        style={{
                            height: 20,
                            width: 20
                        }}
                    />
                </TouchableOpacity>
            </View>
        )
    }
}

export default connect(
    null,
    dispatch => {
        return {
            logout: async () => {
                await SecureStore.deleteItemAsync('login');
                dispatch(logout());
            }
        }
    }
)(UserMain)