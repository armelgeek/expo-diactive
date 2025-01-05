import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { CustomText } from '../../../molecules/CustomText';

export const PartnerSection = ({ isPartner = false, navigation }) => {
  return (
    <View style={styles.section}>
      <CustomText variant="titleMedium" style={styles.sectionTitle}>
        Espace Partenaire
      </CustomText>
      {isPartner ? (
        <Button
          mode="contained"
          onPress={() => navigation.navigate('PartnerDashboard')}
          style={styles.button}
        >
          Accéder à mon espace partenaire
        </Button>
      ) : (
        <>
          <CustomText style={styles.sectionText}>
            Devenez partenaire pour proposer vos récompenses aux utilisateurs.
          </CustomText>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('CreatePartner')}
            style={styles.button}
          >
            Devenir partenaire
          </Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  sectionText: {
    marginBottom: 10,
    color: '#666',
  },
  button: {
    marginVertical: 5,
  },
}); 