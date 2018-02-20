import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TextInput,
    Button,
    Alert
} from 'react-native';
import { connect } from 'react-redux';
import { removeChat } from '../actions';
import fetch from 'react-native-cancelable-fetch';
import Wiki from '../components/Wiki';
import ShyView from '../components/ShyView';
import Conditional from '../components/Conditional';

class NewChatModal extends React.Component {
    static navigationOptions = {
        header: null
    };

    state = {
        wikis: [],
        noresults: false
    }

    onChangeText(text) {
        const { chats, session } = this.props;
        fetch.abort(`search:${this.state.query}`);
        this.setState({ query: text });
        if (!text.trim()) return;
        this.fetchWikis(text).then(r => {
            if (r.query != this.state.query) return;
            r.items = r.items.map(wiki => {
                wiki.code = wiki.domain.slice(0, -'.wikia.com'.length);
                return Object.assign(wiki, {
                    wordmark: wiki.wordmark.startsWith('data:image/gif;') ? '' : wiki.wordmark,
                    exists: chats.find(chat => chat.code == wiki.code && chat.userid == session.id)
                });
            }).sort((a, b) => {
                // Prefer exact matches
                if (a == r.query) return 1;
                if (b == r.query) return -1;
                // Prefer wikis with wordmarks
                return !!b.wordmark - !!a.wordmark
            });
            this.setState({
                wikis: r.items,
                noresults: !r.items.length
            });
        });
    }

    fetchWikis(query) {
        return fetch(`http://www.wikia.com/api/v1/Wikis/ByString?expand=1&string=${query}&limit=6&includeDomain=true`, null, `search:${query}`)
            .then(r => r.json())
            .then(r => Object.assign(r, { query: query }));
    }

    componentDidMount() {
        if (this.search) {
            this.search.focus();
        }
    }

    render() {
        const { wikis, noresults } = this.state,
        { chats, removeChat } = this.props,
        processing = chats.some(chat => chat.processing),
        failed = chats.find(chat => chat.failed);
        if (failed) {
            let message = 'Something went wrong! Uh, sorry about that.';
            switch (failed.error) {
                case 'ControllerNotFoundException':
                    message = 'This wiki does not have chats enabled!';
                    break;
            }
            Alert.alert(
                'Oops!',
                message
            );
            removeChat(failed.code);
        }
        return (
            <ShyView>
                <View
                    style={{
                        flex: 1
                    }}
                >
                    <TextInput
                        onChangeText={this.onChangeText.bind(this)}
                        placeholder='Wiki name or domain'
                        style={{
                            height: 60,
                            fontSize: 20,
                            paddingHorizontal: 10,
                            opacity: processing ? .5 : 1
                        }}
                        ref={search => this.search = search}
                        spellCheck={false}
                        autoCorrect={false}
                    />
                    {
                        !noresults ? 
                            <ScrollView
                                style={{
                                    marginBottom: 55,
                                    opacity: processing ? .5 : 1
                                }}
                            >
                                {
                                wikis.map(wiki => (
                                    <Wiki
                                        wiki={wiki}
                                        key={wiki.domain}
                                        disabled={processing}
                                        navigation={this.props.navigation}
                                    />
                                ))
                                }
                            </ScrollView>
                        :
                        <Text
                            style={{
                                margin: 30,
                                color: '#888',
                                opacity: processing ? .5 : 1
                            }}
                        >
                            Hm, no results. Try checking your spelling?
                        </Text>
                    }
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 10,
                            left: 10,
                            right: 10,
                            opacity: processing ? .5 : 1
                        }}
                    >
                        <Button
                            title='Back'
                            onPress={() => this.props.navigation.goBack()}
                        />
                    </View>
                </View>
            </ShyView>
        )
    }
}

export default connect(
    state => {
        return {
            chats: Object.values(state.models.chats),
            session: state.session
        }
    },
    dispatch => {
        return {
            removeChat: wiki => dispatch(removeChat(wiki))
        }
    }
)(NewChatModal);