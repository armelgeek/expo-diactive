import {StyleSheet} from "react-native";
import {AppColors, FontSizes, FontWeights} from "../../theme";

export const styles = StyleSheet.create({
    viewContainer: {
        height: '100%',
    },
    background: {
        height: '100%',
    },
    title: {
        fontSize: 25,
        color: AppColors.default,
        textAlign: 'center',
        fontFamily: FontWeights.Regular1.fontFamily,
    },
    diactivTitle: {
        fontSize: 30,
        color: AppColors.default,
        textAlign: 'center',
        fontFamily: FontWeights.Bold1.fontFamily
    },
    subtitle: {
        paddingVertical: 70,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: AppColors.lightColor,
        borderRadius: 20,
        position: 'relative',
        alignItems: 'center',
        width: '80%',
        marginHorizontal: '5%'
    },
    Lastsubtitle: {
        paddingVertical: 60,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: AppColors.lightColor,
        borderRadius: 20,
        position: 'relative',
        alignItems: 'center',
        marginHorizontal: 20
    },
    subtitleText: {
        fontSize: FontSizes.SubHeading.fontSize + 3,
        color: AppColors.default,
        textAlign: 'center',
        fontFamily: FontWeights.Regular1.fontFamily
    },
    diactivSubtitle: {
        fontWeight: '900',
        color: AppColors.default,
    },
    action: {
        color: AppColors.default,
        fontSize: 20,
        fontFamily: FontWeights.Bold1.fontFamily,
        marginBottom: -10
    },
    description: {
        justifyContent: "center",
        height: '100%'
    },
    image: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        zIndex: 10,
        top: -150,
    },
    lastStepAction: {
        paddingTop: 50,
        gap: 50,
        alignItems: 'center'
    },
    titleContainer: {
        paddingTop: '15%'
    },
    passedContainer: {
        alignItems: 'center',
        position: 'absolute',
        bottom: -80,
        left: '40%'
    },
    dotStyle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5
    },
    leftDeco: {
        width: '5%',
        height: '100%',
        backgroundColor: AppColors.lightColor,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
    },
    rightDeco: {
        width: '5%',
        height: '100%',
        backgroundColor: AppColors.lightColor,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    subtitleContainer: {
        display: 'flex',
        flexDirection: 'row'
    }
})
