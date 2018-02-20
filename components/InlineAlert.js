import React from 'react';
import {
    View,
    Text,
    Image,
    PixelRatio
} from 'react-native';
import Touchable from 'react-native-platform-touchable';
import A from './Anchor';
import Emoticon from './Emoticon';

export default class InlineAlert extends React.Component {
    msg(code, ...vars) {
        const { chat } = this.props,
        messages = chat.mwmessages;

        return messages['chat-' + code].replace(/\$(\d)/g, (s, index) => vars[index - 1] || '');
    }

    getText(model) {
        const { name, chat, config } = this.props,
        uselocal = config.localalerts;

        switch (model.type) {
            case 'join':
                return model.name == name ? 
                    (
                        uselocal ? this.msg('welcome-message', chat.name) : 'You have entered the chat'
                    ) : (
                        uselocal ? this.msg('user-joined', model.name) : `${model.name} has entered the chat`
                    );
            case 'part':
                return model.name == name ? (
                    'You have left the chat' // No message for "You've left", so always the same
                ) : (
                    uselocal ? this.msg('user-parted', model.name) : `${model.name} has left the chat`
                );
            case 'kick':
                return model.name == name ? (
                    uselocal ? this.msg('you-were-kicked', model.mod) : `You have been kicked by ${model.mod}`
                ) : (
                    uselocal ? this.msg('user-was-kicked', model.name, model.mod) : `${model.name} has been kicked by ${model.mod}`
                );
            case 'ban':
                return model.name == name ? ( // Notice how model.reason isn't included? That's why I don't want you to use this option
                    uselocal ? this.msg('you-were-banned', model.mod) : `You have been banned by ${model.mod}: ${model.reason.trim() || 'No reason specified.'}`
                ) : (
                    uselocal ? this.msg('user-was-banned', model.name, model.mod, '') : `${model.name} has been banned by ${model.mod}: ${model.reason.trim() || 'No reason specified.'}`
                );
            case 'unban':
                return uselocal ? this.msg('user-was-unbanned', model.name, model.mod) : `${model.name} has been unbanned by ${model.mod}: ${model.reason.trim() || 'No reason specified.'}`;
            case 'chat-err-connected-from-another-browser':
                return 'You have connected from another device. This connection will be closed.';

            default:
                return `We received an unknown inline alert type ¯\_(ツ)_/¯ (type was ${model.type}, please contact Dorumin#0969 on discord to report this issue)`;
        }
    }

    shouldComponentUpdate(nextProps) {
        return this.props.keys.join('|') != nextProps.keys.join('|') || this.props.config != nextProps.config;
    }
    
    escape(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    parseEmoticons(text, chat, big, color) {
        color = color ? { color } : { };
        const nodes = [],
        matches = [],
        customs = chat.emoticons.other,
        regex = new RegExp('(?:^|\\s)(' + (customs.length ? customs.map(this.escape).join('|') + '|' : '') + '\\(.+?\\)|:.+?:)(?=[^/]|$)', 'ig');

        let m,
        index = 0;
        while ((m = regex.exec(text)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            if (matches.length == 5) { // Enforcing emote limit inherited from wikia chat
                break;
            }

            const emote = chat.emoticons.table[m[1].toLowerCase()];

            if (emote) {
                matches.push({
                    index: m.index + m[0].length - m[1].length,
                    text: m[1],
                    length: m[1].length,
                    emote
                });
            }
        }
        
        if (matches.length) {
            if (matches[0].index) {
                const t = text.slice(0, matches[0].index).trim();
                if (t) {
                    nodes.push(<Text key={index++} style={color}>{t}&nbsp;</Text>);
                }
            }
            for (const i in matches) {
                const item = matches[i],
                next = matches[+i + 1],
                start = item.index + item.length,
                nextText = next ? text.slice(start, next.index) : text.slice(start);

                nodes.push(
                    <Emoticon
                        emote={item.text}
                        icon={item.emote}
                        style={{
                            height: 16 * PixelRatio.get(),
                            width: 16 * PixelRatio.get()
                        }}
                        key={index++}
                    />
                );
                if (nextText.trim()) {
                    nodes.push(<Text key={index++} style={color}>{nextText}&nbsp;</Text>);
                }
            }
        } else {
            nodes.push(<Text key={index++} style={color}>{text}</Text>);
        }

        return nodes;
    }

    parseLinks(text, chat, color) {
        const nodes = [],
        matches = [],
        // OH MY GOD THE REGEXP IS REAL I only made the part after this pipe over here ==v
        regex = /\bhttps?:\/\/(?:\w+:{0,1}\w*@)?[a-zA-Z0-9\-\.]+(?::[0-9]+)?\S+[^.\s\?\,]|\[\[([^|\[\]\r\n]*[^|\[\]\s][^|\[\]\r\n]*)(?:\|([^\[\]\r\n]*[^\[\]\s][^\[\]\r\n]*))?\]\]/ig,
        style = color ? { color } : {};

        let m,
        index = 0;
        while ((m = regex.exec(text)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            matches.push({
                index: m.index,
                text: m[0],
                length: m[0].length,
                page: m[1],
                title: m[2]
            });
        }
        
        if (matches.length) {
            if (matches[0].index) {
                nodes.push(this.parseEmoticons(text.slice(0, matches[0].index), chat));
            }
            for (const i in matches) {
                const item = matches[i],
                next = matches[+i + 1],
                start = item.index + item.length,
                nextText = next ? text.slice(start, next.index) : text.slice(start),
                url = item.page ? `http://${chat.code.split('/').pop()}.wikia.com/wiki/${item.page}` : item.text,
                display = item.title || item.page || item.text;

                nodes.push(
                    <A url={url} key={index++}>
                        {this.parseEmoticons(display, chat, false, '#07C')}
                    </A>
                );
                if (nextText) {
                    nodes.push(this.parseEmoticons(nextText, chat, false, color));
                }
            }
        } else {
            nodes.push(this.parseEmoticons(text, chat, false, color));
        }

        return nodes;
    }

    render() {
        const { models, chat, keys, index, onLongPress } = this.props;
        return (
            <View
                style={{
                    width: '100%',
                    alignItems: 'center'
                }}
            >
                {index != 0 &&
                    <View
                        style={{
                            backgroundColor: '#ccc',
                            width: '95%',
                            height: 1
                        }}
                    />
                }
                {
                    models.map((model, i) =>
                        <Touchable
                            onLongPress={() => onLongPress(model, model.user)}
                            background={Touchable.Ripple('#eef')}
                            activeOpacity={1}
                            delayPressIn={0}
                            key={keys[i]}
                            style={{
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    paddingRight: 80,
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    paddingTop: i == 0 ? 20 : 3,
                                    paddingBottom: i == models.length - 1 ? 20 : 10,
                                    paddingHorizontal: 50
                                }}
                                key={keys[i]}
                            >
                                <Text
                                    style={{
                                        textAlign: 'center',
                                        color: '#aaa'
                                    }}
                                >
                                    {this.parseLinks(this.getText(model), chat, '#aaa')}
                                </Text>
                            </View>
                        </Touchable>
                    )
                }
            </View>
        )
    }
}