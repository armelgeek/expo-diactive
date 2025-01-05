import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Icon, Input } from 'react-native-elements';
import { usePartner } from '../../hooks/usePartner';
import { supabase } from '../../services/supabase';
import * as ImagePicker from 'expo-image-picker';

export const ManageRewards = ({ navigation }) => {
  const { profile, isPartner, status } = usePartner();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    pointsCost: '',
    stock: ''
  });

  const fetchRewards = async () => {
    try {
      setLoading(true);
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('partner_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchRewards();
    }
  }, [profile]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const file = {
          uri: result.assets[0].uri,
          name: 'reward.jpg',
          type: 'image/jpeg',
        };

        const tempId = Date.now() + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const { data, error } = await supabase.storage
          .from('reward-images')
          .upload(`${profile.id}/${tempId}.jpg`, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('reward-images')
          .getPublicUrl(data.path);

        setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Erreur lors du téléchargement de l\'image');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (!formData.title.trim()) throw new Error('Le titre est requis');
      if (!formData.pointsCost || isNaN(formData.pointsCost)) {
        throw new Error('Le coût en points doit être un nombre valide');
      }
      if (!formData.stock || isNaN(formData.stock)) {
        throw new Error('Le stock doit être un nombre valide');
      }

      const { data, error } = await supabase
        .from('rewards')
        .insert({
          partner_id: profile.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          image_url: formData.imageUrl,
          points_cost: parseInt(formData.pointsCost),
          stock: parseInt(formData.stock)
        })
        .select()
        .single();

      if (error) throw error;
      await fetchRewards();
      setShowAddForm(false);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        pointsCost: '',
        stock: ''
      });
    } catch (err) {
      console.error('Error creating reward:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Voir les commandes"
          onPress={() => navigation.navigate('ManageOrders')}
          icon={
            <Icon
              name="list"
              type="font-awesome"
              color="white"
              size={16}
              style={{ marginRight: 10 }}
            />
          }
          containerStyle={styles.ordersButton}
        />
        <Button
          title="Ajouter une récompense"
          onPress={() => setShowAddForm(true)}
          icon={
            <Icon
              name="plus"
              type="font-awesome"
              color="white"
              size={16}
              style={{ marginRight: 10 }}
            />
          }
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchRewards}
          />
        }
      >
        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        {showAddForm && (
          <Card containerStyle={styles.formCard}>
            <Card.Title>Nouvelle récompense</Card.Title>
            <Input
              placeholder="Titre"
              value={formData.title}
              onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
            />
            <Input
              placeholder="Description"
              value={formData.description}
              onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
              multiline
            />
            <Input
              placeholder="Coût en points"
              value={formData.pointsCost}
              onChangeText={text => setFormData(prev => ({ ...prev, pointsCost: text }))}
              keyboardType="numeric"
            />
            <Input
              placeholder="Stock disponible"
              value={formData.stock}
              onChangeText={text => setFormData(prev => ({ ...prev, stock: text }))}
              keyboardType="numeric"
            />
            <Button
              title="Choisir une image"
              onPress={pickImage}
              type="outline"
              containerStyle={styles.button}
            />
            {formData.imageUrl && (
              <Card.Image
                source={{ uri: formData.imageUrl }}
                style={styles.previewImage}
              />
            )}
            <View style={styles.formButtons}>
              <Button
                title="Annuler"
                onPress={() => setShowAddForm(false)}
                type="outline"
                containerStyle={[styles.button, styles.cancelButton]}
              />
              <Button
                title="Créer"
                onPress={handleSubmit}
                containerStyle={[styles.button, styles.submitButton]}
                loading={loading}
              />
            </View>
          </Card>
        )}

        {rewards.map(reward => (
          <Card key={reward.id} containerStyle={styles.rewardCard}>
            <Card.Title>{reward.title}</Card.Title>
            {reward.image_url && (
              <Card.Image
                source={{ uri: reward.image_url }}
                style={styles.rewardImage}
              />
            )}
            <Text style={styles.description}>{reward.description}</Text>
            <View style={styles.rewardInfo}>
              <Text style={styles.points}>{reward.points_cost} points</Text>
              <Text style={styles.stock}>Stock: {reward.stock}</Text>
            </View>
          </Card>
        ))}

        {rewards.length === 0 && !showAddForm && (
          <Text style={styles.emptyText}>
            Aucune récompense pour le moment
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  ordersButton: {
    marginRight: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: 10,
  },
  formCard: {
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    marginVertical: 5,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    width: '48%',
  },
  submitButton: {
    width: '48%',
  },
  previewImage: {
    height: 200,
    marginVertical: 10,
    borderRadius: 5,
  },
  rewardCard: {
    borderRadius: 10,
    marginBottom: 15,
  },
  rewardImage: {
    height: 200,
    marginBottom: 15,
    borderRadius: 5,
  },
  description: {
    marginVertical: 10,
    color: '#666',
  },
  rewardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2089dc',
  },
  stock: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    padding: 20,
  },
});