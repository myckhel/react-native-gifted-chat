import PropTypes from 'prop-types';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { IMessage, Reply } from './Models';
export interface QuickRepliesProps {
    nextMessage?: IMessage;
    currentMessage?: IMessage;
    color?: string;
    sendText?: string;
    quickReplyStyle?: StyleProp<ViewStyle>;
    onQuickReply?(reply: Reply[]): void;
    renderQuickReplySend?(): React.ReactNode;
}
export declare function QuickReplies(props: QuickRepliesProps): JSX.Element | null;
export declare namespace QuickReplies {
    var defaultProps: {
        currentMessage: {
            quickReplies: never[];
        };
        onQuickReply: () => void;
        color: string;
        sendText: string;
        keepReplies: boolean;
        renderQuickReplySend: undefined;
        quickReplyStyle: undefined;
    };
    var propTypes: {
        currentMessage: PropTypes.Validator<object>;
        onQuickReply: PropTypes.Requireable<(...args: any[]) => any>;
        color: PropTypes.Requireable<string>;
        sendText: PropTypes.Requireable<string>;
        keepReplies: PropTypes.Requireable<boolean>;
        renderQuickReplySend: PropTypes.Requireable<(...args: any[]) => any>;
        quickReplyStyle: PropTypes.Requireable<number | boolean | object>;
    };
}
