import React from 'react';
import {
    View,
    Text,
    Image,
    Linking,
    TouchableWithoutFeedback
} from 'react-native';
import Touchable from 'react-native-platform-touchable';
import A from './Anchor';
import Emoticon from './Emoticon';

export default class Message extends React.Component {
    pad(n) {
        return ('0' + n).slice(-2);
    }

    getTime(ts) {
        const date = new Date(ts);
        return `${this.pad(date.getHours())}:${this.pad(date.getMinutes())}`
    }

    shouldComponentUpdate(nextProps) {
        return this.props.keys.join('|') != nextProps.keys.join('|');
    }

    escape(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    bodgeNewlines(nodes, text, style, index) { // WARNING: Ugly!
        text.split('\n').forEach((line, i) => {
            if (i) {
                nodes.push(<View key={index++} style={{ width: '100%' }} />);
            }
            nodes.push(<Text key={index++} style={style}>{line.trim()}</Text>);
        });
        return index;
    }

    parseEmoticons(text, chat, big, color) {
        const nodes = [],
        matches = [],
        style = color ? { fontSize: 16, color } : { fontSize: 16 },
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
                const t = text.slice(0, matches[0].index);
                if (t) {
                    index = this.bodgeNewlines(nodes, t, style, index);
                    big = false;
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
                        key={index++}
                    />
                );
                if (nextText) {
                    index = this.bodgeNewlines(nodes, nextText, style, index);
                    big = false;
                }
            }
        } else {
            index = this.bodgeNewlines(nodes, text, style, index);
            big = false;
        }

        if (big) {
            for (const idx in nodes) {
                nodes[idx] = (
                    <Emoticon
                        emote={nodes[idx].props.emote}
                        icon={nodes[idx].props.icon}
                        big={true}
                        key={index++}
                    />
                );
            }
        }

        return nodes;
    }

    parseLinks(text, chat) {
        const nodes = [],
        matches = [],
        // OH MY GOD THE REGEXP IS REAL I only made the part after this pipe over here ==v
        regex = /\bhttps?:\/\/(?:\w+:{0,1}\w*@)?[a-zA-Z0-9\-\.]+(?::[0-9]+)?\S+[^.\s\?\,]|\[\[([^|\[\]\r\n]*[^|\[\]\s][^|\[\]\r\n]*)(?:\|([^\[\]\r\n]*[^\[\]\s][^\[\]\r\n]*))?\]\]/ig;

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
                    nodes.push(this.parseEmoticons(nextText, chat));
                }
            }
        } else {
            nodes.push(this.parseEmoticons(text, chat, true));
        }

        return nodes;
    }

    render() {
        const { user, messages, chat, config, keys, index, onLongPress } = this.props;
        if (!user) return null;
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
                <View
                    style={{
                        width: '100%',
                        alignItems: 'flex-start',
                        flexDirection: 'row'
                    }}
                >
                    <TouchableWithoutFeedback
                        onPress={() => onLongPress(null, user)}
                    >
                        <View
                            style={{
                                alignItems: 'center',
                                paddingVertical: 10,
                                paddingHorizontal: 10
                            }}
                        >
                            <View
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 25,
                                    marginBottom: 5,
                                    overflow: 'hidden'
                                }}
                            >
                                <Image
                                    source={{
                                        uri: user.avatar
                                    }}
                                    style={{
                                        height: 50,
                                        width: 50
                                    }}
                                />
                            </View>
                            <Text
                                style={{
                                    color: '#aaa'
                                }}
                            >
                                {this.getTime(messages[0].time)}
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <View
                        style={{
                            marginRight: 50,
                            width: '100%',
                            justifyContent: 'flex-start'
                        }}
                    >
                    {
                        messages
                        .map(message => {
                            if (!config.pings || !config.pinglist || !config.pinglist.trim() || message.name == chat.username) return message;
                            const lines = [],
                            regs = [],
                            pings = config.pinglist.split('\n')
                                .map(line => line.trim())
                                .filter(Boolean)
                                .forEach(line => {
                                    if (!line.startsWith('regex:')) {
                                        lines.push(line.toLowerCase());
                                    } else {
                                        const match = line.match(/^\/(.+?)\/(?!.*\/)(.*)/);
                                        regs.push(new RegExp(match[1], match[2]));
                                    }
                                });

                            message.pinged = lines.some(line => message.text.toLowerCase().includes(line)) || regs.some(reg => reg.test(line));
                            return message;
                        })
                        .map((message, i) =>
                            <Touchable
                                onLongPress={() => onLongPress(message, user)}
                                background={Touchable.Ripple('#eef')}
                                activeOpacity={1}
                                delayPressIn={0}
                                key={keys[i]}
                                style={{
                                    flex: i + 1 == messages.length ? 1 : 0,
                                    paddingTop: i == 0 ? 10 : 0,
                                    paddingBottom: i + 1 == messages.length ? 10 : 0
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        marginRight: 80,
                                        flexDirection: 'row',
                                        flexWrap: 'wrap',
                                        backgroundColor: message.pinged ? 'rgba(250, 166, 26, .2)' : 'transparent'
                                    }}
                                >
                                    {this.parseLinks(message.text, chat)}
                                </View>
                            </Touchable>
                        )
                    }
                    </View>
                </View>
            </View>
        )
    }
}