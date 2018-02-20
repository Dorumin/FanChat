import React from 'react';
import {
    View,
    Text,
    Image,
    Button,
    Keyboard,
    Platform,
    TextInput,
    ScrollView,
    Dimensions,
    KeyboardAvoidingView,
} from 'react-native';
import { connect } from 'react-redux';
import { SecureStore } from 'expo';
import { attemptLogin, loginFailure } from '../actions';
import ShyView from '../components/ShyView';
import ErrorNotice from '../components/ErrorNotice';

class Login extends React.Component {
    state = {
        disclaimer: true,
        bottom: 0
    };

    componentDidMount() {
        this.showListener = Keyboard.addListener('keyboardDidShow', e => {
            this.setState({
                disclaimer: false,
                bottom: e.endCoordinates.height
            });
        });
        this.hideListener = Keyboard.addListener('keyboardDidHide', () => {
            this.setState({
                disclaimer: true,
                bottom: 0
            });
        });
    }

    componentWillUnmount () {
      this.showListener.remove();
      this.hideListener.remove();
    }

    login() {
        const { name, pass } = this.state;
        const { attemptLogin, failLogin } = this.props;
        if (!name) {
            failLogin('noname');
        } else if (!pass) {
            failLogin('nopass');
        } else {
            attemptLogin(name, pass);
            SecureStore.setItemAsync('login', name + '|' + pass);
        }
    }
    
    messageFromCode(code) {
        switch (code) {
            case 'noname':
                return 'Please enter a username';
            case 'nopass':
                return 'Please enter a password';
            case 'access_denied':
                return "Your credentials don't match. Please verify your username and password.";
            
            default:
                return "Something isn't working. Please check your internet connection";
        }
    }

    render() {
        const { session } = this.props;
        if (session.failed && session.error == 'access_denied') {
            SecureStore.deleteItemAsync('login');
        }
        return (
            <View
                style={{
                    flex: 1,
                    paddingBottom: 20,
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    marginBottom: this.state.bottom
                }}
            >
                <ScrollView
                    style={{
                        flex: 1,
                        width: '100%'
                    }}
                    contentContainerStyle={{
                        alignItems: 'center'
                    }}
                >
                    <ErrorNotice
                        message={this.messageFromCode(session.error)}
                        condition={!!session.failed}
                    />
                    <TextInput
                        style={{
                            height: 40,
                            fontSize: 20,
                            paddingHorizontal: 5,
                            width: '100%'
                        }}
                        placeholder='Username'
                        ref={input => this.username = input}
                        returnKeyType='next'
                        blurOnSubmit={false}
                        onChangeText={(text) => this.setState({name: text})}
                        onSubmitEditing={() => this.password.focus()}
                    />
                    <TextInput
                        style={{
                            height: 40,
                            fontSize: 20,
                            marginTop: 10,
                            paddingHorizontal: 5,
                            width: '100%'
                        }}
                        placeholder='Password'
                        ref={input => this.password = input}
                        returnKeyType='done'
                        secureTextEntry={true}
                        onChangeText={(text) => this.setState({pass: text})}
                        onSubmitEditing={this.login.bind(this)}
                    />
                    <View
                        style={{
                            flex: 0,
                            width: '100%',
                            marginTop: 10
                        }}
                    >
                        <Button
                            onPress={this.login.bind(this)}
                            title="Log in"
                        />
                    </View>
                </ScrollView>
                {this.state.disclaimer &&
                    <Text
                        style={{
                            color: '#666',
                            position: 'absolute',
                            textAlign: 'center',
                            bottom: 5
                        }}
                    >
                        We are not affiliated with Wikia ¯\_(ツ)_/¯
                    </Text>
                }
            </View>
        );
    }
} 

export default connect(
    state => {
        return {
            session: state.session
        };
    },
    dispatch => {
        return {
            attemptLogin: (name, pass) => dispatch(attemptLogin(name, pass)),
            failLogin: (err) => dispatch(loginFailure(err))
        };
    }
)(Login);