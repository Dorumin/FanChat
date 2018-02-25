import React from 'react';
import {
    View,
    Text,
    Image,
    Alert,
    Button,
    Animated,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    TouchableWithoutFeedback
} from 'react-native';
import { Constants, ImagePicker } from 'expo';
import { connect } from 'react-redux';
import { setAvatar, setConfig, logout } from '../../actions';
import Touchable from 'react-native-platform-touchable';

class Profile extends React.Component {
    static navigationOptions = {
        title: 'Profile'
    };

    constructor(props) {
        super(props);

        this.changed = false;
        this.scale = new Animated.Value(0);
        this.state = {
            processing: false
        };
    }

    onWrite(key, text) {
        if (!this.changed) {
            this.changed = true;
            Animated.timing(this.scale, {
                toValue: 1,
                duration: 200
            }).start();
        }
        this.setState({
            [key]: text
        });
    }

    save() {
        const { session } = this.props,
        props = Object.assign({}, this.state);
        delete props.processing;
        this.changed = false;
        Animated.timing(this.scale, {
            toValue: 0,
            duration: 200
        }).start();
        Object.assign(session.props, props);
        fetch(`http://community.wikia.com/wikia.php?controller=UserProfilePage&method=saveUserData&format=json`, {
            method: 'POST',
            body: `userId=${session.id}&data=${JSON.stringify(props)}&token=${session.encodedtoken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }

    changePassword() {
        const { session } = this.props;
        if (!(this.pass && this.newpass && this.newpassrepeat)) {
            Alert.alert(
                'Please fill each password field',
                'pls?'
            );
            return;
        } else if (this.newpass != this.newpassrepeat) {
            Alert.alert(
                'Your passwords don\'t match',
                'Double check the "new password" and "retype password" fields'
            );
            this.newpassinput.clear();
            this.retypeinput.clear();
        } else if (this.pass == this.newpass) {
            Alert.alert(
                'Your new password must not be the same as your old password',
                'Whatcha playing at?'
            );
        } else {
            Alert.alert(
                'Are you sure that you want to change your password?',
                'This will log you out of your account.',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    },
                    {
                        text: 'OK',
                        onPress: () => {
                            fetch('http://community.wikia.com/wiki/Special:ChangePassword', {
                                method: 'POST',
                                body: `token=${session.encodedtoken}&wpName=${session.name}&wpPassword=${this.pass}&wpNewPassword=${this.newpass}&wpRetype=${this.newpassrepeat}`,
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                }
                            });
                            this.props.logout();
                        }
                    }
                ]
            )
        }
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
            const res = await fetch(`https://services.wikia.com/user-avatar/user/${session.id}/avatar`, {
                method: 'PUT',
                body: data
            }),
            body = await res.json();
            if (body.imageUrl) {
                setAvatar(body.imageUrl + '/scale-to-width-down/150');
            }
            this.setState({ processing: false });
        } catch(e) {
            this.setState({ processing: false });
        }
    }

    render() {
        const { session } = this.props,
        { name, location, occupation, gender, bio, processing } = this.state;
        return (
            <KeyboardAvoidingView
                behavior='padding'
                keyboardVerticalOffset={60 + Constants.statusBarHeight}
                style={{
                    flex: 1,
                    backgroundColor: '#fff',
                    opacity: processing ? .5 : 1
                }}
            >
                <View
                    style={{
                        flex: 1
                    }}
                >
                    <ScrollView>
                        <View
                            style={{
                                height: 250,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#fcfcfc',
                                width: '100%'
                            }}
                        >
                            <TouchableWithoutFeedback
                                style={{
                                    borderRadius: 75,
                                    overflow: 'hidden'
                                }}
                                onPress={this.openImagePicker.bind(this)}
                                disabled={processing}
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
                        <View
                            style={{
                                padding: 20,
                                alignItems: 'flex-start'
                            }}
                        >
                            <Text>Nickname</Text>
                            <TextInput
                                style={{
                                    width: '100%',
                                    height: 36,
                                    fontSize: 16,
                                    paddingHorizontal: 10
                                }}
                                editable={!processing}
                                value={name === undefined ? session.props.name : name}
                                placeholder="What do people call you?"
                                disableFullscreenUI={true}
                                maxLength={40}
                                onChangeText={this.onWrite.bind(this, 'name')}
                            />
                            <Text>Location</Text>
                            <TextInput
                                style={{
                                    width: '100%',
                                    height: 36,
                                    fontSize: 16,
                                    paddingHorizontal: 10
                                }}
                                editable={!processing}
                                value={location === undefined ? session.props.location : location}
                                placeholder="What's your location?"
                                disableFullscreenUI={true}
                                maxLength={200}
                                onChangeText={this.onWrite.bind(this, 'location')}
                            />
                            <Text>Occupation</Text>
                            <TextInput
                                style={{
                                    width: '100%',
                                    height: 36,
                                    fontSize: 16,
                                    paddingHorizontal: 10
                                }}
                                editable={!processing}
                                value={occupation === undefined ? session.props.occupation : occupation}
                                placeholder="What's your occupation?"
                                disableFullscreenUI={true}
                                maxLength={200}
                                onChangeText={this.onWrite.bind(this, 'occupation')}
                            />
                            <Text>Gender</Text>
                            <TextInput
                                style={{
                                    width: '100%',
                                    height: 36,
                                    fontSize: 16,
                                    paddingHorizontal: 10
                                }}
                                editable={!processing}
                                value={gender === undefined ? session.props.gender : gender}
                                placeholder="What's your gender?"
                                disableFullscreenUI={true}
                                maxLength={200}
                                onChangeText={this.onWrite.bind(this, 'gender')}
                            />
                            <Text>Bio</Text>
                            <TextInput
                                style={{
                                    width: '100%',
                                    height: 100,
                                    fontSize: 16,
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    textAlignVertical: 'top'
                                }}
                                editable={!processing}
                                value={bio === undefined ? session.props.bio : bio}
                                placeholder='Tell us about yourself'
                                disableFullscreenUI={true}
                                multiline={true}
                                maxLength={25000 /* YES HOLY SHIT THE BIO CAN HAVE INFINITE CHARACTERS */}
                                onChangeText={this.onWrite.bind(this, 'bio')}
                            />
                            <Text>Change password</Text>
                            <TextInput
                                style={{
                                    width: '100%',
                                    height: 36,
                                    fontSize: 16,
                                    paddingHorizontal: 10,
                                    marginBottom: 10
                                }}
                                editable={!processing}
                                ref={input => this.passinput = input}
                                placeholder='Your current password'
                                returnKeyType='next'
                                disableFullscreenUI={true}
                                secureTextEntry={true}
                                maxLength={1000 /* I'm going to assume that nobody has more than 1000 characters on their pass */}
                                onChangeText={text => this.pass = text}
                                onSubmitEditing={() => this.newpassinput.focus()}
                            />
                            <TextInput
                                style={{
                                    width: '100%',
                                    height: 36,
                                    fontSize: 16,
                                    paddingHorizontal: 10,
                                    marginBottom: 10
                                }}
                                editable={!processing}
                                ref={input => this.newpassinput = input}
                                placeholder='Your new password'
                                returnKeyType='next'
                                disableFullscreenUI={true}
                                secureTextEntry={true}
                                maxLength={1000}
                                onChangeText={text => this.newpass = text}
                                onSubmitEditing={() => this.retypeinput.focus()}
                            />
                            <TextInput
                                style={{
                                    width: '100%',
                                    height: 36,
                                    fontSize: 16,
                                    paddingHorizontal: 10,
                                    marginBottom: 10
                                }}
                                editable={!processing}
                                ref={input => this.retypeinput = input}
                                placeholder='Retype new password'
                                returnKeyType='done'
                                disableFullscreenUI={true}
                                secureTextEntry={true}
                                maxLength={1000}
                                onChangeText={text => this.newpassrepeat = text}
                                onSubmitEditing={this.changePassword.bind(this)}
                            />
                            <View
                                style={{
                                    marginLeft: 10,
                                    marginTop: 20,
                                    marginBottom: 100
                                }}
                            >
                                <Button
                                    title='Change password'
                                    onPress={this.changePassword.bind(this)}
                                    disabled={processing}
                                />
                            </View>
                        </View>
                    </ScrollView>
                    <Animated.View
                        style={{
                            position: 'absolute',
                            overflow: 'hidden',
                            bottom: 40,
                            right: 20,
                            borderRadius: 25,
                            transform: [{
                                scale: this.scale.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [.01, 1],
                                    extrapolate: 'clamp'
                                })
                            }]
                        }}
                    >
                        <Touchable
                            onPress={this.save.bind(this)}
                            style={{
                                backgroundColor: '#fff'
                            }}
                            disabled={processing}
                        >
                            <Image
                                source={require('../../img/done.png')}
                                style={{
                                    height: 50,
                                    width: 50
                                }}
                            />
                        </Touchable>
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
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
            set: (key, value) => dispatch(setConfig(key, value)),
            setAvatar: url => dispatch(setAvatar(url)),
            logout: () => dispatch(logout())
        }
    }
)(Profile)