import React from 'react';
import {
    View,
    Text,
    Image,
    Alert,
    Switch,
    Animated,
    TextInput,
    ScrollView,
    KeyboardAvoidingView
} from 'react-native';
import { Constants } from 'expo';
import { connect } from 'react-redux';
import { setConfig } from '../../actions';
import Touchable from 'react-native-platform-touchable';

class Pings extends React.Component {
    static navigationOptions =  ({navigation}) => {
        const props = navigation.state.params || {},
        {
            set = () => console.log('oops lol'),
            config = {}
        } = props;
        return {
            title: 'Pings',
            headerRight: (
                <Switch
                    value={config.pings}
                    onValueChange={set.bind(this, 'pings')}
                />
            )
        }
    };

    constructor(props) {
        super(props);

        this.changed = false;
        this.scale = new Animated.Value(0);
        this.state = {};
    }

    componentWillMount() {
        const { set, config } = this.props;
        this.props.navigation.setParams({
            set,
            config
        });
    }

    componentDidUpdate() {
        const { set, config } = this.props;
        this.props.navigation.setParams({
            set,
            config
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.props.config.pings != nextProps.config.pings ||
            this.props.config.pinglist != nextProps.config.pinglist ||
            this.state.pinglist != nextState.pinglist
        )
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
        const split = this.state.pinglist.split('\n').filter(Boolean);
        for (const i in split) {
            let item = split[i];
            if (item.startsWith('regex:')) {
                item = item.slice(6).trim();
                const match = item.match(/^\/(.+?)\/(?!.*\/)(.*)/);
                if (item.charAt(0) != '/') {
                    Alert.alert(
                        `Regex error at line ${+i + 1}`,
                        'regex patterns MUST start with / to keep code convention'
                    );
                    return;
                } else if (!match) {
                    Alert.alert(
                        `Regex error at line ${+i + 1}`,
                        'It failed to match our test pattern. Please revise it and check it against the example pattern'
                    );
                    return;
                } else {
                    try {
                        new RegExp(match[1], match[2]);
                    } catch(e) {
                        Alert.alert(
                            `Regex error at line ${+i + 1}`,
                            e.message
                        );
                        return;
                    }
                }
            }
        }
        this.changed = false;
        Animated.timing(this.scale, {
            toValue: 0,
            duration: 200
        }).start();
        this.props.set('pinglist', this.state.pinglist);
    }

    render() {
        const { config } = this.props,
        { pinglist } = this.state;
        return (
            <KeyboardAvoidingView
                behavior='padding'
                keyboardVerticalOffset={60 + Constants.statusBarHeight}
                style={{
                    flex: 1,
                    backgroundColor: '#fff'
                }}
            >
                <View
                    style={{
                        flex: 1,
                        margin: 10,
                        opacity: config.pings ? 1 : .4
                    }}
                >
                    <ScrollView>
                        <Text>Put each phrase in each line and messages including them will be highlighted.</Text>
                        <Text>PROTIP: Prefix a line with regex: to use a regular expression pattern! (regex:/\bExample\b/gi)</Text>
                        <TextInput
                            style={{
                                width: '100%',
                                height: 400,
                                fontSize: 16,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                textAlignVertical: 'top'
                            }}
                            value={pinglist === undefined ? config.pinglist : pinglist}
                            editable={!!config.pings}
                            placeholder='List of ping phrases'
                            disableFullscreenUI={true}
                            multiline={true}
                            maxLength={10000}
                            onChangeText={this.onWrite.bind(this, 'pinglist')}
                        />
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
            config: state.config[state.session.id]
        }
    },
    dispatch => {
        return {
            set: (key, value) => dispatch(setConfig(key, value))
        }
    }
)(Pings)