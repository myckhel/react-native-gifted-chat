import PropTypes from 'prop-types';
import { ImageProps, ViewStyle, StyleProp, ImageStyle } from 'react-native';
import { IMessage } from './Models';
export interface MessageImageProps<TMessage extends IMessage> {
    currentMessage?: TMessage;
    containerStyle?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ImageStyle>;
    imageProps?: Partial<ImageProps>;
    lightboxProps?: object;
}
export declare function MessageImage<TMessage extends IMessage = IMessage>(props: MessageImageProps<TMessage>): JSX.Element | null;
export declare namespace MessageImage {
    var defaultProps: {
        currentMessage: {
            image: null;
        };
        containerStyle: {};
        imageStyle: {};
        imageProps: {};
        lightboxProps: {};
    };
    var propTypes: {
        currentMessage: PropTypes.Requireable<object>;
        containerStyle: PropTypes.Requireable<number | boolean | object>;
        imageStyle: PropTypes.Requireable<number | boolean | object>;
        imageProps: PropTypes.Requireable<object>;
        lightboxProps: PropTypes.Requireable<object>;
    };
}
