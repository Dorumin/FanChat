import React from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableWithoutFeedback
} from 'react-native';
import { ImagePicker, SecureStore } from 'expo';
import { connect } from 'react-redux';
import { setAvatar, setConfig, logout } from '../../actions';
import Section from '../../components/ConfigSection';

class Configuration extends React.Component {
    static navigationOptions = {
        title: 'Configuration'
    };

    state = {
        processing: false
    };

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    async openImagePicker() {
        const { session, setAvatar } = this.props;
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'Images',
                aspect: [1, 1],
                quality: 1,
                allowsEditing: true
            });
            if (result.cancelled) return;
            this.setState({ processing: true });
            const data = new FormData(),
            ext = result.uri.split('.').pop();
            data.append('file', {
                uri: result.uri,
                type: `image/${ext}`,
                name: `avatar.${ext}`
            });
            const res = await fetch(`https://services.wikia.com/user-avatar/user/${session.id}/avatar`, { // Thanks Kocka
                method: 'PUT',
                body: data
            }),
            body = await res.json();
            if (body.imageUrl) {
                setAvatar(body.imageUrl + '/scale-to-width-down/150');
            }
            if (this.mounted) {
                this.setState({ processing: false });
            }
        } catch(e) {
            this.setState({ processing: false });
        }
    }

    render() {
        const { session, navigation, logout } = this.props,
        { processing } = this.state;
        return (
            <ScrollView
                style={{
                    flex: 1,
                    backgroundColor: '#fff',
                    opacity: processing ? .5 : 1
                }}
            >
                <View
                    style={{
                        height: 250,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fcfcfc'
                    }}
                >
                    <TouchableWithoutFeedback
                        style={{
                            borderRadius: 75,
                            overflow: 'hidden'
                        }}
                        onPress={this.openImagePicker.bind(this)}
                    >
                        <View
                            style={{
                                borderRadius: 75,
                                overflow: 'hidden'
                            }}
                        >
                            <Image
                                source={{
                                    uri: session.avatar
                                }}
                                style={{
                                    height: 150,
                                    width: 150
                                }}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <Section
                    onPress={() => navigation.navigate('Configuration_Profile')}
                    source={require('../../img/profile.png')}
                    text='Profile'
                    disabled={processing}
                />
                <Section
                    onPress={() => navigation.navigate('Configuration_Pings')}
                    source={require('../../img/ping.png')}
                    text='Pings'
                    disabled={processing}
                />
                <Section
                    onPress={() => navigation.navigate('Configuration_Settings')}
                    source={require('../../img/config.png')}
                    text='App settings'
                    disabled={processing}
                />
                <Section
                    onPress={() => logout()}
                    source={require('../../img/logout.png')}
                    text='Sign out'
                    disabled={processing}
                />
            </ScrollView>
        )
    }
}

export default connect(
    state => {
        return {
            session: state.session
        }
    },
    dispatch => {
        return {
            setAvatar: url => dispatch(setAvatar(url)),
            logout: async () => {
                await SecureStore.deleteItemAsync('login');
                dispatch(logout());
            }
        }
    }
)(Configuration);