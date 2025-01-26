import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    inputContainer : {
        flexDirection: 'row',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        alignItems: 'center',
        borderRadius: 32,
        borderWidth: 1,
        marginTop: 3,
        paddingHorizontal: 10
    },
    icon : {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    input : {
        flex: 1,
        height: '100%',
    },
    text: {
        fontWeight: '800',
        fontSize: 18,
        marginBottom: 5,
        paddingVertical: 5
    },
    control: {
        gap: 3
    },
    controlItem: {
        height: 15,
        width: 15
    }
});
