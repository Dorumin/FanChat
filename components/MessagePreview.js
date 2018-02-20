import React from 'react';
import {
    View,
    Text,
    PixelRatio
} from 'react-native';
import prompt from 'react-native-prompt-android';
import A from './Anchor';
import Emoticon from './Emoticon';

export default class MessagePreview extends React.Component {
    state = {
        now: Date.now()
    }

    pad(n, l = 2, force = true) {
        if (typeof n != 'number') throw new TypeError('n must be a number');
        if (!force && n.toString().length >= l) {
            return n.toString();
        }
        return ('0000' + n).slice(-l);
    };

    getTime(ts) {
        const rn = this.state.now,
        date = new Date(ts),
        pad = this.pad;

        if (rn - ts > 24 * 60 * 60 * 1000) {
            return `${pad(date.getDate())}/${pad(date.getMonth())}`;
        }
        if (rn - ts < 60000) {
            return 'just now';
        }
        if (rn - ts < 600000) {
            const mins = Math.floor((rn - ts) / 60000);
            return `${mins} ${mins == 1 ? 'minute' : 'minutes'} ago`;
        }
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    msg(code, ...vars) {
        const { chat } = this.props,
        messages = chat.mwmessages;

        return messages['chat-' + code].replace(/\$(\d)/g, (s, index) => vars[index - 1] || '');
    }

    getText(model) {
        const { chat, config } = this.props,
        name = chat.username,
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
                    'You have left the chat'
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
                return model.name == name ? (
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

    update() {
        this.setState({ now: Date.now() });
    }

    componentDidMount() {
        this.interval = setInterval(this.update.bind(this), 60000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }
    
    escape(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    parseEmoticons(text, chat, big, color) {
        color = color ? { fontSize: 16, color } : { fontSize: 16 };
        const nodes = [],
        matches = [],
        customs = chat.emoticons.other,
        // Inspired by wikia's own emote regex, but optimized by the much more common :emote: and (emote) patterns
        // Behaves in the same way as the Special:Chat parser since this app is a 2nd class citizen in the chat world
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
                        style={{
                            height: 16 * PixelRatio.get(),
                            width: 16 * PixelRatio.get()
                        }}
                        key={index++}
                    />
                );
                if (nextText.trim()) {
                    nodes.push(<Text key={index++} style={color}>{nextText}&nbsp;</Text>);
                    big = false;
                }
            }
        } else {
            nodes.push(<Text key={index++} style={color}>{text}</Text>);
            big = false;
        }

        if (big) {
            for (const idx in nodes) {
                nodes[idx] = (
                    <Emoticon
                        emote={nodes[idx].props.emote}
                        icon={nodes[idx].props.icon}
                        style={nodes[idx].props.style}
                        big={true}
                        key={index++}
                    />
                );
            }
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

                nodes.push(this.parseEmoticons(display, chat, false, '#07C'));
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
        const { chat, messages, count } = this.props;
        const lastId = chat.messages[chat.messages.length - 1];
        if (!lastId) return null;
        const lastMessage = messages[lastId],
        time = this.getTime(lastMessage.time);
        return (
            <View
                style={{
                    position: 'absolute',
                    bottom: 5,
                    left: 0,
                    right: chat.wordmark ? 160 : 0,
                    paddingRight: count ? 30 : 0,
                    ...this.props.style
                }}
            >
                {
                    lastMessage.inline ? (
                        <Text
                            style={{
                                fontSize: 16,
                                fontStyle: 'italic',
                                color: '#444'
                            }}
                            numberOfLines={1}
                        >
                            {this.parseLinks(this.getText(lastMessage), chat, '#444')}
                        </Text>
                    ) : (
                        <Text
                            style={{
                                fontSize: 16,
                                top: 3
                            }}
                            numberOfLines={1}
                        >
                            <Text
                                style={{
                                    fontWeight: '500'
                                }}
                            >
                                {lastMessage.name}:&nbsp;
                            </Text>
                            {this.parseLinks(lastMessage.text, chat)}
                        </Text>
                    )
                }
                <Text
                    style={{
                        color: '#666'
                    }}
                >
                    {time}
                </Text>
                {!!count &&
                    <View
                        style={{
                            position: 'absolute',
                            backgroundColor: '#bbb',
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'flex-end',
                            height: 16,
                            minWidth: 16,
                            top: 5,
                            right: 5,
                            borderRadius: 8
                        }}
                    >
                        <Text
                            style={{
                                color: '#fff',
                                fontWeight: '500',
                                fontSize: 14
                            }}
                        >
                            {count}
                        </Text>
                    </View>
                }
            </View>
        )
    }
}