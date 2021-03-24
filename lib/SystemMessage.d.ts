/// <reference types="react" />
import { ViewStyle, StyleProp, TextStyle } from 'react-native';
import PropTypes from 'prop-types';
import { IMessage } from './Models';
export interface SystemMessageProps<TMessage extends IMessage> {
    currentMessage?: TMessage;
    containerStyle?: StyleProp<ViewStyle>;
    wrapperStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}
export declare function SystemMessage<TMessage extends IMessage = IMessage>(props: SystemMessageProps<TMessage>): JSX.Element | null;
export declare namespace SystemMessage {
    var defaultProps: {
        currentMessage: {
            system: boolean;
        };
        containerStyle: {};
        wrapperStyle: {};
        textStyle: {};
    };
    var propTypes: {
        currentMessage: PropTypes.Requireable<object>;
        containerStyle: PropTypes.Requireable<number | boolean | object>;
        wrapperStyle: PropTypes.Requireable<number | boolean | object>;
        textStyle: PropTypes.Requireable<number | boolean | object>;
    };
}
