import PropTypes from 'prop-types';
import { ReactNode } from 'react';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';
export interface ActionsProps {
    options?: {
        [key: string]: any;
    };
    optionTintColor?: string;
    icon?: () => ReactNode;
    wrapperStyle?: StyleProp<ViewStyle>;
    iconTextStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    onPressActionButton?(): void;
}
export declare const Actions: {
    ({ options, optionTintColor, icon, wrapperStyle, iconTextStyle, onPressActionButton, containerStyle, }: ActionsProps): JSX.Element;
    defaultProps: {
        options: {};
        optionTintColor: string;
        icon: undefined;
        containerStyle: {};
        iconTextStyle: {};
        wrapperStyle: {};
    };
    propTypes: {
        onSend: PropTypes.Requireable<(...args: any[]) => any>;
        options: PropTypes.Requireable<object>;
        optionTintColor: PropTypes.Requireable<string>;
        icon: PropTypes.Requireable<(...args: any[]) => any>;
        onPressActionButton: PropTypes.Requireable<(...args: any[]) => any>;
        wrapperStyle: PropTypes.Requireable<number | boolean | object>;
        containerStyle: PropTypes.Requireable<number | boolean | object>;
    };
};
